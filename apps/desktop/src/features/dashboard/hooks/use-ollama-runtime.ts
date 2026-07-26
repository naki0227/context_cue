import { listen } from '@tauri-apps/api/event';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import {
  type OllamaStatus,
  type PullProgress,
  pullProgressSchema,
} from '@/lib/schemas/llm';
import { useAppStore } from '@/lib/state/app-store';
import {
  cancelModelPull,
  checkOllamaStatus,
  pullRecommendedModel,
} from '@/lib/tauri/commands';

const initialStatus: OllamaStatus = {
  running: false,
  models: [],
  recommendedModel: 'gemma4:e2b',
  recommendedModelInstalled: false,
  message: 'Ollamaを確認しています。',
};

export function useOllamaRuntime(onError: (message: string) => void) {
  const [status, setStatus] = useState(initialStatus);
  const [progress, setProgress] = useState<PullProgress | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [isPulling, setIsPulling] = useState(false);
  const cancelRequested = useRef(false);
  const setAppState = useAppStore((state) => state.setAppState);
  const onRuntimeError = useEffectEvent(onError);

  async function refreshStatus() {
    setIsChecking(true);
    try {
      applyStatus(await checkOllamaStatus());
    } catch {
      onError('Ollamaの状態を確認できませんでした。再試行してください。');
    } finally {
      setIsChecking(false);
    }
  }

  async function pullModel() {
    cancelRequested.current = false;
    setIsPulling(true);
    setProgress(null);
    try {
      applyStatus(await pullRecommendedModel());
    } catch {
      if (!cancelRequested.current) {
        onError(
          'モデルを取得できませんでした。Ollamaと空き容量を確認してください。',
        );
      }
    } finally {
      cancelRequested.current = false;
      setIsPulling(false);
    }
  }

  async function cancelPull() {
    try {
      cancelRequested.current = true;
      await cancelModelPull();
      setIsPulling(false);
    } catch {
      onError('モデル取得を中止できませんでした。');
    }
  }

  function applyStatus(nextStatus: OllamaStatus) {
    setStatus(nextStatus);
    const current = useAppStore.getState().appState;
    setAppState({
      ...current,
      connections: {
        ...current.connections,
        ollamaReady: nextStatus.running && nextStatus.recommendedModelInstalled,
      },
    });
  }

  const refreshStatusOnMount = useEffectEvent(refreshStatus);

  useEffect(() => {
    void refreshStatusOnMount();
    if (
      !(window as Window & { __TAURI_INTERNALS__?: unknown })
        .__TAURI_INTERNALS__
    ) {
      return;
    }

    const unlisteners: Array<() => void> = [];
    void Promise.all([
      listen('ollama-pull-progress', (event) => {
        const parsed = pullProgressSchema.safeParse(event.payload);
        if (parsed.success) {
          setProgress(parsed.data);
        }
      }),
      listen<string>('llm-warning', (event) => {
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
    cancelPull,
    isChecking,
    isPulling,
    progress,
    pullModel,
    refreshStatus,
    status,
  };
}
