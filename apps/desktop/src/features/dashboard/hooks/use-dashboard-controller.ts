import {
  type ChangeEvent,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from 'react';
import {
  formatPreparedness,
  type PageId,
} from '@/features/dashboard/lib/content';
import {
  isImportableKnowledgeFile,
  MAX_IMPORT_FILE_SIZE,
  readFileText,
  stripExtension,
} from '@/features/dashboard/lib/file-import';
import type { AppState, ConsentState } from '@/lib/schemas/app-state';
import { useAppStore } from '@/lib/state/app-store';
import { invokeCommand, setOverlayVisibility } from '@/lib/tauri/commands';
import { attachAppEvents } from '@/lib/tauri/events';

export type DashboardController = {
  activePage: PageId;
  appState: AppState;
  canStart: boolean;
  confirmItems: string[];
  consent: ConsentState;
  fileInputRef: RefObject<HTMLInputElement | null>;
  flowPoints: string[];
  knowledgeImportNotice: string;
  memoItems: string[];
  nextTalkCandidates: string[];
  overlayTopic: string;
  preparedness: string;
  sideOverlayVisible: boolean;
  topOverlayVisible: boolean;
  transcriptPreview: AppState['transcript'];
  setActivePage: (page: PageId) => void;
  setConsentField: (field: keyof ConsentState, value: boolean) => void;
  clearProfileDocuments: () => Promise<void>;
  importLocalFiles: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  importSampleKnowledge: () => Promise<void>;
  removeProfileDocument: (documentId: string) => Promise<void>;
  startSession: () => Promise<void>;
  stopSession: () => Promise<void>;
  toggleOverlay: (overlay: 'top' | 'side') => Promise<void>;
  toggleShareSafeMode: () => Promise<void>;
};

export function useDashboardController(): DashboardController {
  const {
    appState,
    consent,
    setConsentField,
    setAppState,
    startSessionLocally,
    stopSessionLocally,
  } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [knowledgeImportNotice, setKnowledgeImportNotice] = useState('');
  const [topOverlayVisible, setTopOverlayVisible] = useState(false);
  const [sideOverlayVisible, setSideOverlayVisible] = useState(false);
  const [activePage, setActivePage] = useState<PageId>('home');

  useEffect(() => {
    invokeCommand('get_app_state')
      .then((state) => setAppState(state))
      .catch(() => undefined);

    return attachAppEvents(useAppStore.getState());
  }, [setAppState]);

  useEffect(() => {
    const shouldShow = appState.session.status === 'running';

    setOverlayVisibility('top', shouldShow).catch(() => undefined);
    setOverlayVisibility('side', shouldShow).catch(() => undefined);
    setTopOverlayVisible(shouldShow);
    setSideOverlayVisible(shouldShow);
  }, [appState.session.status]);

  const canStart =
    consent.participantConsent &&
    consent.noCovertUse &&
    consent.shareSafeUnderstood &&
    appState.session.status !== 'running';

  const transcriptPreview = appState.transcript.slice(-4);
  const preparedness = formatPreparedness(appState.importedDocuments.length);
  const overlayTopic =
    appState.contextCue.topic === 'まだ会話は始まっていません'
      ? 'ガクチカについて詳しく教えてください'
      : appState.contextCue.topic;
  const flowPoints = [
    appState.contextCue.intent,
    ...appState.rollingSummary.importantPoints,
  ].filter((value, index, array) => value && array.indexOf(value) === index);
  const nextTalkCandidates =
    appState.contextCue.suggestedPoints.length > 0
      ? appState.contextCue.suggestedPoints
      : [
          '結論から話す（PREP法）',
          '数字を入れて具体的に話す',
          '再現性や学びを最後に伝える',
        ];
  const confirmItems =
    appState.contextCue.questionsToAsk.length > 0
      ? appState.contextCue.questionsToAsk
      : [
          'なぜその施策を選んだのか？',
          'チーム内での役割は？',
          '大変だったことは？',
        ];
  const memoItems =
    appState.contextCue.relatedNotes.length > 0
      ? appState.contextCue.relatedNotes
      : ['数字を入れる', '誇張NG'];

  async function importLocalFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const importableFiles = files.filter(isImportableKnowledgeFile);
    const oversizedFiles = importableFiles.filter(
      (file) => file.size > MAX_IMPORT_FILE_SIZE,
    );

    if (files.length === 0) {
      return;
    }

    if (importableFiles.length === 0) {
      setKnowledgeImportNotice('.md または .txt ファイルを選択してください。');
      event.target.value = '';
      return;
    }

    if (oversizedFiles.length > 0) {
      setKnowledgeImportNotice('1ファイル 512KB 以内で追加してください。');
      event.target.value = '';
      return;
    }

    const documents = await Promise.all(
      importableFiles.map(async (file) => ({
        content: await readFileText(file),
        title: stripExtension(file.name),
      })),
    );

    try {
      const previousCount = appState.importedDocuments.length;
      const state = await invokeCommand('import_profile_documents_from_files', {
        documents,
      });
      setAppState(state);
      setKnowledgeImportNotice(
        `${state.importedDocuments.length - previousCount}件のファイルを追加しました。`,
      );
    } catch {
      setKnowledgeImportNotice(
        'ファイルの読込に失敗しました。もう一度お試しください。',
      );
    }

    event.target.value = '';
  }

  async function importSampleKnowledge() {
    const state = await invokeCommand('import_profile_documents');
    setAppState(state);
    setKnowledgeImportNotice('サンプル個人ナレッジを読み込みました。');
  }

  async function removeProfileDocument(documentId: string) {
    const state = await invokeCommand('remove_profile_document', {
      documentId,
    });
    setAppState(state);
  }

  async function clearProfileDocuments() {
    const state = await invokeCommand('clear_profile_documents');
    setAppState(state);
    setKnowledgeImportNotice('追加済みの個人ナレッジを削除しました。');
  }

  async function startSession() {
    startSessionLocally();
    const state = await invokeCommand('start_session', { consent });
    setAppState(state);
  }

  async function stopSession() {
    stopSessionLocally();
    const state = await invokeCommand('stop_session');
    setAppState(state);
  }

  async function toggleShareSafeMode() {
    const state = await invokeCommand('toggle_share_safe_mode');
    setAppState(state);
  }

  async function toggleOverlay(overlay: 'top' | 'side') {
    const visible = overlay === 'top' ? topOverlayVisible : sideOverlayVisible;
    const nextVisible = !visible;
    await setOverlayVisibility(overlay, nextVisible);

    if (overlay === 'top') {
      setTopOverlayVisible(nextVisible);
      return;
    }

    setSideOverlayVisible(nextVisible);
  }

  return {
    activePage,
    appState,
    canStart,
    clearProfileDocuments,
    confirmItems,
    consent,
    fileInputRef,
    flowPoints,
    importLocalFiles,
    importSampleKnowledge,
    knowledgeImportNotice,
    memoItems,
    nextTalkCandidates,
    overlayTopic,
    preparedness,
    removeProfileDocument,
    setActivePage,
    setConsentField,
    sideOverlayVisible,
    startSession,
    stopSession,
    toggleOverlay,
    toggleShareSafeMode,
    topOverlayVisible,
    transcriptPreview,
  };
}
