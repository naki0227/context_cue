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
  | 'toggle_share_safe_mode'
  | 'import_profile_documents'
  | 'remove_profile_document'
  | 'clear_profile_documents';

type CommandPayload = {
  consent?: ConsentState;
  documentId?: string;
};

const mockDocuments = [
  { id: 'values', title: 'values', sourceType: 'imported' },
  { id: 'projects', title: 'projects', sourceType: 'imported' },
  { id: 'meetings', title: 'meetings', sourceType: 'imported' },
  { id: 'todos', title: 'todos', sourceType: 'imported' },
  { id: 'experiences', title: 'experiences', sourceType: 'imported' },
];

let mockAppState = appStateSchema.parse({
  session: {
    status: 'idle',
    shareSafeMode: false,
  },
  connections: { ollamaReady: true, sttReady: true },
  adaptiveInference: { mode: 'light', questionScore: 0 },
  rollingSummary: {
    currentTopic: 'セッション開始を待っています',
    importantPoints: [],
    openQuestions: [],
  },
  contextCue: {
    topic: 'まだ会話は始まっていません',
    intent: 'セッションを開始すると提示内容を表示します',
    relatedNotes: [],
    suggestedPoints: [],
    questionsToAsk: [],
    caution: '文字起こしを始める前に参加者の同意が必要です。',
  },
  transcript: [],
  importedDocuments: [],
});

function invokeMockCommand(
  command: CommandName,
  payload?: CommandPayload,
): AppState {
  if (command === 'start_session') {
    mockAppState = {
      ...mockAppState,
      session: { ...mockAppState.session, status: 'running' },
    };
  }

  if (command === 'stop_session') {
    mockAppState = {
      ...mockAppState,
      session: { ...mockAppState.session, status: 'stopped' },
    };
  }

  if (command === 'toggle_share_safe_mode') {
    mockAppState = {
      ...mockAppState,
      session: {
        ...mockAppState.session,
        shareSafeMode: !mockAppState.session.shareSafeMode,
      },
    };
  }

  if (command === 'import_profile_documents') {
    mockAppState = {
      ...mockAppState,
      importedDocuments: mockDocuments,
      contextCue: {
        ...mockAppState.contextCue,
        relatedNotes: mockDocuments
          .slice(0, 3)
          .map((document) => document.title),
      },
    };
  }

  if (command === 'remove_profile_document' && payload?.documentId) {
    const importedDocuments = mockAppState.importedDocuments.filter(
      (document) => document.id !== payload.documentId,
    );
    mockAppState = {
      ...mockAppState,
      importedDocuments,
      contextCue: {
        ...mockAppState.contextCue,
        relatedNotes: importedDocuments
          .slice(0, 3)
          .map((document) => document.title),
      },
    };
  }

  if (command === 'clear_profile_documents') {
    mockAppState = {
      ...mockAppState,
      importedDocuments: [],
      contextCue: {
        ...mockAppState.contextCue,
        relatedNotes: [],
      },
    };
  }

  return appStateSchema.parse(mockAppState);
}

export async function invokeCommand(
  command: CommandName,
  payload?: CommandPayload,
): Promise<AppState> {
  if (
    !(window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__
  ) {
    return invokeMockCommand(command, payload);
  }

  const result = await invoke<AppState>(command, payload ?? {});
  return appStateSchema.parse(result);
}
