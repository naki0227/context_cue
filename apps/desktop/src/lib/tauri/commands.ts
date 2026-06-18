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
  | 'import_profile_documents_from_files'
  | 'remove_profile_document'
  | 'clear_profile_documents'
  | 'set_overlay_visibility';

type OverlayTarget = 'top' | 'side';

type ImportedProfileDocumentDraft = {
  title: string;
  content: string;
};

type CommandPayload = {
  consent?: ConsentState;
  documentId?: string;
  documents?: ImportedProfileDocumentDraft[];
  overlay?: OverlayTarget;
  visible?: boolean;
};

const mockDocuments = [
  { id: 'values', title: 'values', sourceType: 'サンプル' },
  { id: 'projects', title: 'projects', sourceType: 'サンプル' },
  { id: 'meetings', title: 'meetings', sourceType: 'サンプル' },
  { id: 'todos', title: 'todos', sourceType: 'サンプル' },
  { id: 'experiences', title: 'experiences', sourceType: 'サンプル' },
];

function createMockAppState() {
  return appStateSchema.parse({
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
}

let mockAppState = createMockAppState();

export function resetMockAppState() {
  mockAppState = createMockAppState();
  mockOverlayVisibility.top = true;
  mockOverlayVisibility.side = true;
}

const mockOverlayVisibility: Record<OverlayTarget, boolean> = {
  top: true,
  side: true,
};

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

  if (command === 'import_profile_documents_from_files') {
    const documents =
      payload?.documents?.map((document) => ({
        id: document.title,
        title: document.title,
        sourceType: 'ローカルファイル',
      })) ?? [];

    const importedDocuments = [
      ...mockAppState.importedDocuments.filter(
        (existing) =>
          !documents.some((document) => document.id === existing.id),
      ),
      ...documents,
    ];

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

export async function setOverlayVisibility(
  overlay: OverlayTarget,
  visible: boolean,
): Promise<void> {
  if (
    !(window as Window & { __TAURI_INTERNALS__?: unknown }).__TAURI_INTERNALS__
  ) {
    mockOverlayVisibility[overlay] = visible;
    return;
  }

  await invoke('set_overlay_visibility', {
    overlay,
    visible,
  });
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
