import { invoke } from '@tauri-apps/api/core';
import {
  type AppState,
  appStateSchema,
  type ConsentState,
} from '@/lib/schemas/app-state';

type CommandName =
  | 'get_app_state'
  | 'start_session'
  | 'stop_session'
  | 'toggle_share_safe_mode';

export async function invokeCommand(
  command: CommandName,
  payload?: { consent?: ConsentState },
): Promise<AppState> {
  if (
    !(window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__
  ) {
    return appStateSchema.parse({
      session: {
        status: command === 'start_session' ? 'running' : 'idle',
        shareSafeMode: false,
      },
      connections: { ollamaReady: true, sttReady: true },
      adaptiveInference: { mode: 'light', questionScore: 0 },
      rollingSummary: {
        currentTopic: 'Mock local mode',
        importantPoints: ['No Tauri runtime detected'],
        openQuestions: [],
      },
      contextCue: {
        topic: 'Mock local mode',
        intent: 'Preview the shell',
        relatedNotes: ['sample/meetings.md'],
        suggestedPoints: ['Start the Tauri runtime to use live events'],
        questionsToAsk: [],
        caution: 'Mock state only',
      },
      transcript: [],
    });
  }

  const result = await invoke<AppState>(command, payload ?? {});
  return appStateSchema.parse(result);
}
