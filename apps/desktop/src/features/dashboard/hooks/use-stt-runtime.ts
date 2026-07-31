import { listen } from '@tauri-apps/api/event';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import {
  type SttModelProgress,
  type SttStatus,
  sttModelProgressSchema,
} from '@/lib/schemas/stt';
import { useAppStore } from '@/lib/state/app-store';
import {
  cancelSttModelDownload,
  checkSttStatus,
  downloadSttModel,
  startSttCapture,
  stopSttCapture,
} from '@/lib/tauri/runtime-commands';

const initialStatus: SttStatus = {
  modelId: 'large-v3-turbo-q5-0',
  modelName: 'Whisper large-v3-turbo q5_0（高精度・日本語対応）',
  modelInstalled: false,
  modelSizeBytes: 0,
  modelDownloadBytes: 574_041_195,
  systemMemoryBytes: 0,
  selectionReason: '端末性能から推奨モデルを確認しています。',
  devices: [],
  selectedDeviceId: null,
  recording: false,
  message: '音声認識を確認しています。',
};

export function useSttRuntime(onError: (message: string) => void) {
  const [status, setStatus] = useState(initialStatus);
  const [progress, setProgress] = useState<SttModelProgress | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const cancelRequested = useRef(false);
  const setAppState = useAppStore((state) => state.setAppState);
  const onRuntimeError = useEffectEvent(onError);

  async function refreshStatus() {
    setIsChecking(true);
    try {
      applyStatus(await checkSttStatus());
    } catch {
      onRuntimeError('音声認識の状態を確認できませんでした。');
    } finally {
      setIsChecking(false);
    }
  }

  async function downloadModel() {
    cancelRequested.current = false;
    setIsDownloading(true);
    setProgress(null);
    try {
      applyStatus(await downloadSttModel());
    } catch {
      if (!cancelRequested.current) {
        onRuntimeError(
          '音声認識モデルを取得できませんでした。通信と空き容量を確認してください。',
        );
      }
    } finally {
      cancelRequested.current = false;
      setIsDownloading(false);
    }
  }

  async function cancelDownload() {
    cancelRequested.current = true;
    try {
      await cancelSttModelDownload();
      setIsDownloading(false);
    } catch {
      onRuntimeError('音声認識モデルの取得を中止できませんでした。');
    }
  }

  async function startCapture() {
    if (!status.modelInstalled) {
      return;
    }
    try {
      applyStatus(await startSttCapture(selectedDeviceId));
    } catch {
      onRuntimeError(
        'マイクを開始できませんでした。OSのマイク権限と入力デバイスを確認してください。',
      );
    }
  }

  async function stopCapture() {
    if (!status.recording) {
      return;
    }
    try {
      applyStatus(await stopSttCapture());
    } catch {
      onRuntimeError(
        'マイクを停止できませんでした。アプリを再起動してください。',
      );
    }
  }

  function applyStatus(nextStatus: SttStatus) {
    setStatus(nextStatus);
    if (nextStatus.selectedDeviceId) {
      setSelectedDeviceId(nextStatus.selectedDeviceId);
    }
    const current = useAppStore.getState().appState;
    setAppState({
      ...current,
      connections: {
        ...current.connections,
        sttReady: nextStatus.modelInstalled,
      },
    });
  }

  const refreshOnMount = useEffectEvent(refreshStatus);

  useEffect(() => {
    void refreshOnMount();
    if (
      !(window as Window & { __TAURI_INTERNALS__?: unknown })
        .__TAURI_INTERNALS__
    ) {
      return;
    }

    const unlisteners: Array<() => void> = [];
    void Promise.all([
      listen('stt-model-progress', (event) => {
        const parsed = sttModelProgressSchema.safeParse(event.payload);
        if (parsed.success) {
          setProgress(parsed.data);
        }
      }),
      listen<string>('stt-warning', (event) => {
        onRuntimeError(event.payload);
      }),
    ]).then((handlers) => {
      unlisteners.push(...handlers);
    });
    return () => {
      for (const unlisten of unlisteners) {
        unlisten();
      }
    };
  }, []);

  return {
    cancelDownload,
    downloadModel,
    isChecking,
    isDownloading,
    progress,
    refreshStatus,
    selectedDeviceId,
    setSelectedDeviceId,
    startCapture,
    status,
    stopCapture,
  };
}
