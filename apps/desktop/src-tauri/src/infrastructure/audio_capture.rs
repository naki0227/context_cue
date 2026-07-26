use std::sync::{Arc, Mutex};

use cpal::{
    FromSample, Sample, SampleFormat, SizedSample, Stream, StreamConfig,
    traits::{DeviceTrait, HostTrait, StreamTrait},
};

use crate::domain::stt::{AudioDevice, SttError};

const WHISPER_SAMPLE_RATE: u32 = 16_000;
const SEGMENT_SECONDS: usize = 4;
const RMS_THRESHOLD: f32 = 0.008;
const PEAK_THRESHOLD: f32 = 0.03;

pub type SegmentHandler = Arc<dyn Fn(Vec<f32>) + Send + Sync>;

pub fn list_input_devices() -> Result<Vec<AudioDevice>, SttError> {
    let host = cpal::default_host();
    let default_id = host
        .default_input_device()
        .and_then(|device| device.id().ok())
        .map(|id| id.to_string());
    let devices = host
        .input_devices()
        .map_err(|_| SttError::AudioDeviceUnavailable)?
        .filter_map(|device| {
            let id = device.id().ok()?.to_string();
            let name = device.description().ok()?.name().to_owned();
            Some(AudioDevice {
                is_default: default_id.as_deref() == Some(id.as_str()),
                id,
                name,
            })
        })
        .collect();
    Ok(devices)
}

pub fn start_input_stream(
    selected_device_id: Option<&str>,
    handler: SegmentHandler,
) -> Result<(Stream, String), SttError> {
    let host = cpal::default_host();
    let device = select_device(&host, selected_device_id)?;
    let device_id = device
        .id()
        .map_err(|_| SttError::AudioDeviceUnavailable)?
        .to_string();
    let supported = device
        .default_input_config()
        .map_err(|_| SttError::AudioPermissionDenied)?;
    let sample_format = supported.sample_format();
    let config: StreamConfig = supported.into();
    let processor = Arc::new(Mutex::new(AudioSegmenter::new(
        config.sample_rate,
        config.channels,
        handler,
    )));

    let stream = match sample_format {
        SampleFormat::F32 => build_stream::<f32>(&device, &config, processor),
        SampleFormat::I16 => build_stream::<i16>(&device, &config, processor),
        SampleFormat::U16 => build_stream::<u16>(&device, &config, processor),
        _ => return Err(SttError::AudioDeviceUnavailable),
    }?;
    stream.play().map_err(|_| SttError::AudioPermissionDenied)?;
    Ok((stream, device_id))
}

fn select_device(
    host: &cpal::Host,
    selected_device_id: Option<&str>,
) -> Result<cpal::Device, SttError> {
    if let Some(selected_id) = selected_device_id {
        let devices = host
            .input_devices()
            .map_err(|_| SttError::AudioDeviceUnavailable)?;
        for device in devices {
            if device.id().is_ok_and(|id| id.to_string() == selected_id) {
                return Ok(device);
            }
        }
        return Err(SttError::AudioDeviceUnavailable);
    }
    host.default_input_device()
        .ok_or(SttError::AudioDeviceUnavailable)
}

fn build_stream<T>(
    device: &cpal::Device,
    config: &StreamConfig,
    processor: Arc<Mutex<AudioSegmenter>>,
) -> Result<Stream, SttError>
where
    T: SizedSample,
    f32: FromSample<T>,
{
    device
        .build_input_stream(
            *config,
            move |data: &[T], _| {
                let samples = data
                    .iter()
                    .map(|sample| f32::from_sample(*sample))
                    .collect::<Vec<_>>();
                if let Ok(mut processor) = processor.lock() {
                    processor.push(&samples);
                }
            },
            move |error| {
                eprintln!("audio input stream failed: {error}");
            },
            None,
        )
        .map_err(|_| SttError::AudioPermissionDenied)
}

struct AudioSegmenter {
    channels: usize,
    handler: SegmentHandler,
    samples: Vec<f32>,
    source_rate: u32,
}

impl AudioSegmenter {
    fn new(source_rate: u32, channels: u16, handler: SegmentHandler) -> Self {
        Self {
            channels: usize::from(channels.max(1)),
            handler,
            samples: Vec::new(),
            source_rate,
        }
    }

    fn push(&mut self, interleaved: &[f32]) {
        let mono = interleaved
            .chunks(self.channels)
            .filter_map(|frame| frame.first().copied())
            .collect::<Vec<_>>();
        self.samples
            .extend(resample_mono(&mono, self.source_rate, WHISPER_SAMPLE_RATE));

        let segment_length = WHISPER_SAMPLE_RATE as usize * SEGMENT_SECONDS;
        while self.samples.len() >= segment_length {
            let segment = self.samples.drain(..segment_length).collect::<Vec<_>>();
            if contains_speech(&segment) {
                (self.handler)(segment);
            }
        }
    }
}

fn resample_mono(samples: &[f32], source_rate: u32, target_rate: u32) -> Vec<f32> {
    if samples.is_empty() || source_rate == 0 || target_rate == 0 {
        return Vec::new();
    }
    if source_rate == target_rate {
        return samples.to_vec();
    }
    let output_length =
        ((samples.len() as u64 * u64::from(target_rate)) / u64::from(source_rate)) as usize;
    let ratio = source_rate as f64 / target_rate as f64;
    (0..output_length)
        .map(|index| {
            let position = index as f64 * ratio;
            let left = position.floor() as usize;
            let right = (left + 1).min(samples.len() - 1);
            let fraction = (position - left as f64) as f32;
            samples[left] * (1.0 - fraction) + samples[right] * fraction
        })
        .collect()
}

fn contains_speech(samples: &[f32]) -> bool {
    if samples.is_empty() {
        return false;
    }
    let energy = samples.iter().map(|sample| sample * sample).sum::<f32>() / samples.len() as f32;
    let peak = samples
        .iter()
        .map(|sample| sample.abs())
        .fold(0.0_f32, f32::max);
    energy.sqrt() >= RMS_THRESHOLD && peak >= PEAK_THRESHOLD
}

#[cfg(test)]
mod tests {
    use super::{contains_speech, resample_mono};

    #[test]
    fn silence_is_rejected_by_vad() {
        assert!(!contains_speech(&vec![0.0; 16_000]));
        assert!(contains_speech(&vec![0.1; 16_000]));
    }

    #[test]
    fn resampler_converts_48khz_to_16khz() {
        let output = resample_mono(&vec![0.2; 48_000], 48_000, 16_000);
        assert_eq!(output.len(), 16_000);
    }
}
