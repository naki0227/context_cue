import { invoke } from '@tauri-apps/api/core';
import {
  type CueGenerationRequest,
  cueGenerationOutcomeSchema,
  type OllamaStatus,
  ollamaStatusSchema,
} from '@/lib/schemas/llm';
import { type SttStatus, sttStatusSchema } from '@/lib/schemas/stt';

function isDesktopRuntime() {
  return Boolean(
    (window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__,
  );
}

export async function checkOllamaStatus(): Promise<OllamaStatus> {
  if (!isDesktopRuntime()) {
    return ollamaStatusSchema.parse({
      running: false,
      models: [],
      recommendedModel: 'gemma4:e2b',
      recommendedModelInstalled: false,
      message: 'デスクトップアプリでOllamaの状態を確認できます。',
    });
  }
  return ollamaStatusSchema.parse(await invoke('check_ollama_status'));
}

export async function pullRecommendedModel(): Promise<OllamaStatus> {
  return ollamaStatusSchema.parse(await invoke('pull_recommended_model'));
}

export async function cancelModelPull(): Promise<void> {
  await invoke('cancel_model_pull');
}

export async function checkSttStatus(): Promise<SttStatus> {
  if (!isDesktopRuntime()) {
    return sttStatusSchema.parse({
      modelName: 'Whisper base q5_1（日本語対応）',
      modelInstalled: false,
      modelSizeBytes: 0,
      devices: [],
      selectedDeviceId: null,
      recording: false,
      message: 'デスクトップアプリでマイクの状態を確認できます。',
    });
  }
  return sttStatusSchema.parse(await invoke('check_stt_status'));
}

export async function downloadSttModel(): Promise<SttStatus> {
  return sttStatusSchema.parse(await invoke('download_stt_model'));
}

export async function cancelSttModelDownload(): Promise<void> {
  await invoke('cancel_stt_model_download');
}

export async function startSttCapture(
  deviceId: string | null,
): Promise<SttStatus> {
  return sttStatusSchema.parse(await invoke('start_stt_capture', { deviceId }));
}

export async function stopSttCapture(): Promise<SttStatus> {
  return sttStatusSchema.parse(await invoke('stop_stt_capture'));
}

export async function generateContextCue(request: CueGenerationRequest) {
  return cueGenerationOutcomeSchema.parse(
    await invoke('generate_context_cue', { request }),
  );
}
