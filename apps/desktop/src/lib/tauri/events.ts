import { listen } from '@tauri-apps/api/event';
import {
  appStateSchema,
  contextCueSchema,
  rollingSummarySchema,
  transcriptChunkSchema,
} from '@/lib/schemas/app-state';
import type { useAppStore } from '@/lib/state/app-store';

type StoreState = ReturnType<typeof useAppStore.getState>;

export function attachAppEvents(store: StoreState) {
  const unlisteners: Array<() => void> = [];

  if (
    !(window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__
  ) {
    return () => undefined;
  }

  const attach = async () => {
    unlisteners.push(
      await listen('session-status-changed', (event) => {
        const parsed = appStateSchema.pick({ session: true }).parse({
          session: event.payload,
        });
        store.patchSession(parsed.session);
      }),
    );

    unlisteners.push(
      await listen('rolling-summary-updated', (event) => {
        store.patchRollingSummary(rollingSummarySchema.parse(event.payload));
      }),
    );

    unlisteners.push(
      await listen('context-cue-updated', (event) => {
        store.patchContextCue(contextCueSchema.parse(event.payload));
      }),
    );

    unlisteners.push(
      await listen('transcript-updated', (event) => {
        store.pushTranscriptChunk(transcriptChunkSchema.parse(event.payload));
      }),
    );

    unlisteners.push(
      await listen('question-score-updated', (event) => {
        const payload = event.payload as {
          mode: 'light' | 'deep';
          questionScore: number;
        };
        store.patchAdaptiveInference(payload);
      }),
    );
  };

  void attach();

  return () => {
    for (const unlisten of unlisteners) {
      unlisten();
    }
  };
}
