import {
  type ChangeEvent,
  type RefObject,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useDataManagement } from '@/features/dashboard/hooks/use-data-management';
import { useKnowledgeImport } from '@/features/dashboard/hooks/use-knowledge-import';
import { useOllamaRuntime } from '@/features/dashboard/hooks/use-ollama-runtime';
import { useSttRuntime } from '@/features/dashboard/hooks/use-stt-runtime';
import { useWorkspacePersistence } from '@/features/dashboard/hooks/use-workspace-persistence';
import type { PageId } from '@/features/dashboard/lib/content';
import { buildOverlayViewModel } from '@/features/overlay/lib/overlay-view-model';
import type { AppState, ConsentState } from '@/lib/schemas/app-state';
import {
  type OverlayPreferences,
  type OverlaySectionKey,
  useAppStore,
} from '@/lib/state/app-store';
import { invokeCommand, setOverlayVisibility } from '@/lib/tauri/commands';
import { attachAppEvents } from '@/lib/tauri/events';

export type DashboardController = {
  activePage: PageId;
  appState: AppState;
  canStart: boolean;
  confirmItems: string[];
  consent: ConsentState;
  dataActionNotice: string;
  fileInputRef: RefObject<HTMLInputElement | null>;
  flowPoints: string[];
  knowledgeImportNotice: string;
  runtimeError: string;
  memoItems: string[];
  nextTalkCandidates: string[];
  ollama: ReturnType<typeof useOllamaRuntime>;
  overlayTopic: string;
  overlayPreferences: OverlayPreferences;
  preparedness: string;
  sideOverlayVisible: boolean;
  stt: ReturnType<typeof useSttRuntime>;
  topOverlayVisible: boolean;
  transcriptPreview: AppState['transcript'];
  setActivePage: (page: PageId) => void;
  clearRuntimeError: () => void;
  deleteAllLocalData: () => Promise<void>;
  exportAllData: () => Promise<void>;
  ollamaCancelPull: () => Promise<void>;
  ollamaPullModel: () => Promise<void>;
  ollamaRefresh: () => Promise<void>;
  sttCancelDownload: () => Promise<void>;
  sttDownloadModel: () => Promise<void>;
  sttRefresh: () => Promise<void>;
  setConsentField: (field: keyof ConsentState, value: boolean) => void;
  setOverlayPreference: <Key extends keyof OverlayPreferences>(
    key: Key,
    value: OverlayPreferences[Key],
  ) => void;
  toggleOverlaySection: (key: OverlaySectionKey) => void;
  clearProfileDocuments: () => Promise<void>;
  importLocalFiles: (event: ChangeEvent<HTMLInputElement>) => Promise<void>;
  importSampleKnowledge: () => Promise<void>;
  removeProfileDocument: (documentId: string) => Promise<void>;
  startSession: () => Promise<void>;
  stopSession: () => Promise<void>;
  toggleOverlay: (overlay: 'top' | 'side') => Promise<void>;
  toggleShareSafeMode: () => Promise<void>;
};

export function useDashboardController(
  runtimeLaunchModeMatches: boolean,
): DashboardController {
  const {
    appState,
    consent,
    overlayPreferences,
    setConsentField,
    resetConsent,
    setOverlayPreference,
    setAppState,
    toggleOverlaySection,
  } = useAppStore();
  const [runtimeError, setRuntimeError] = useState('');
  const [topOverlayVisible, setTopOverlayVisible] = useState(false);
  const [sideOverlayVisible, setSideOverlayVisible] = useState(false);
  const [activePage, setActivePage] = useState<PageId>('home');
  const reportRuntimeError = useCallback((message: string) => {
    setRuntimeError(message);
  }, []);

  useWorkspacePersistence({
    enabled: runtimeLaunchModeMatches,
    onError: reportRuntimeError,
  });
  const knowledgeImport = useKnowledgeImport(reportRuntimeError);
  const dataManagement = useDataManagement(reportRuntimeError);
  const ollama = useOllamaRuntime(reportRuntimeError);
  const stt = useSttRuntime(reportRuntimeError);

  useEffect(() => {
    invokeCommand('get_app_state')
      .then((state) => setAppState(state))
      .catch(() => {
        reportRuntimeError(
          'アプリの状態を読み込めませんでした。再起動してください。',
        );
      });

    return attachAppEvents(useAppStore.getState());
  }, [reportRuntimeError, setAppState]);

  useEffect(() => {
    const shouldShow = appState.session.status === 'running';

    setOverlayVisibility('top', shouldShow).catch(() => {
      reportRuntimeError('上部オーバーレイの表示を変更できませんでした。');
    });
    setOverlayVisibility('side', shouldShow).catch(() => {
      reportRuntimeError('右側オーバーレイの表示を変更できませんでした。');
    });
    setTopOverlayVisible(shouldShow);
    setSideOverlayVisible(shouldShow);
  }, [appState.session.status, reportRuntimeError]);

  const canStart =
    consent.participantConsent &&
    consent.noCovertUse &&
    consent.shareSafeUnderstood &&
    appState.session.status !== 'running';

  const {
    confirmItems,
    flowPoints,
    memoItems,
    nextTalkCandidates,
    overlayTopic,
    preparedness,
    transcriptPreview,
  } = buildOverlayViewModel(appState);

  async function startSession() {
    await runSafely(async () => {
      const state = await invokeCommand('start_session', { consent });
      setAppState(state);
      await stt.startCapture();
    }, 'セッションを開始できませんでした。同意状態と保存先を確認してください。');
  }

  async function stopSession() {
    await runSafely(async () => {
      await stt.stopCapture();
      const state = await invokeCommand('stop_session');
      setAppState(state);
      resetConsent();
    }, 'セッションを停止できませんでした。');
  }

  async function toggleShareSafeMode() {
    await runSafely(async () => {
      const state = await invokeCommand('toggle_share_safe_mode');
      setAppState(state);
    }, '画面共有保護を切り替えられませんでした。');
  }

  async function toggleOverlay(overlay: 'top' | 'side') {
    const visible = overlay === 'top' ? topOverlayVisible : sideOverlayVisible;
    const nextVisible = !visible;
    try {
      await setOverlayVisibility(overlay, nextVisible);
    } catch {
      reportRuntimeError('オーバーレイの表示を切り替えられませんでした。');
      return;
    }

    if (overlay === 'top') {
      setTopOverlayVisible(nextVisible);
      return;
    }

    setSideOverlayVisible(nextVisible);
  }

  async function runSafely(action: () => Promise<void>, message: string) {
    try {
      await action();
    } catch {
      reportRuntimeError(message);
    }
  }

  return {
    activePage,
    appState,
    canStart,
    clearProfileDocuments: knowledgeImport.clearProfileDocuments,
    clearRuntimeError: () => setRuntimeError(''),
    confirmItems,
    consent,
    dataActionNotice: dataManagement.dataActionNotice,
    deleteAllLocalData: dataManagement.deleteAllLocalData,
    fileInputRef: knowledgeImport.fileInputRef,
    flowPoints,
    exportAllData: dataManagement.exportAllData,
    importLocalFiles: knowledgeImport.importLocalFiles,
    importSampleKnowledge: knowledgeImport.importSampleKnowledge,
    knowledgeImportNotice: knowledgeImport.knowledgeImportNotice,
    memoItems,
    nextTalkCandidates,
    ollama,
    ollamaCancelPull: ollama.cancelPull,
    ollamaPullModel: ollama.pullModel,
    ollamaRefresh: ollama.refreshStatus,
    overlayTopic,
    overlayPreferences,
    preparedness,
    removeProfileDocument: knowledgeImport.removeProfileDocument,
    runtimeError,
    setActivePage,
    setConsentField,
    setOverlayPreference,
    sideOverlayVisible,
    startSession,
    stt,
    sttCancelDownload: stt.cancelDownload,
    sttDownloadModel: stt.downloadModel,
    sttRefresh: stt.refreshStatus,
    stopSession,
    toggleOverlay,
    toggleOverlaySection,
    toggleShareSafeMode,
    topOverlayVisible,
    transcriptPreview,
  };
}
