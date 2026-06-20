import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppState, ConsentState } from '@/lib/schemas/app-state';
import { createBrowserPersistStorage } from '@/lib/state/persist-storage';

export type OverlayTheme = 'dark' | 'light' | 'auto';
export type OverlayPosition = '右上' | '上部中央' | '右寄せ';
export type OverlayLanguage = '日本語' | 'English';

export type OverlaySectionKey =
  | 'assistant'
  | 'summary'
  | 'suggestions'
  | 'transcript'
  | 'related';

export type OverlayPreferences = {
  accentColor: string;
  alwaysOn: boolean;
  autoSave: boolean;
  cornerRadius: number;
  fontSize: number;
  height: number;
  hideOnScreenShare: boolean;
  highlightUnread: boolean;
  keepTranscriptPanel: boolean;
  language: OverlayLanguage;
  opacity: number;
  position: OverlayPosition;
  sections: Record<OverlaySectionKey, boolean>;
  shadow: number;
  startMinimized: boolean;
  theme: OverlayTheme;
};

const defaultState: AppState = {
  session: {
    status: 'idle',
    shareSafeMode: false,
  },
  connections: {
    ollamaReady: true,
    sttReady: true,
  },
  adaptiveInference: {
    mode: 'light',
    questionScore: 0,
  },
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
};

const defaultConsent: ConsentState = {
  participantConsent: false,
  noCovertUse: false,
  shareSafeUnderstood: false,
};

const defaultOverlayPreferences: OverlayPreferences = {
  accentColor: '#2d5bff',
  alwaysOn: true,
  autoSave: true,
  cornerRadius: 12,
  fontSize: 14,
  height: 400,
  hideOnScreenShare: true,
  highlightUnread: true,
  keepTranscriptPanel: true,
  language: '日本語',
  opacity: 90,
  position: '右上',
  sections: {
    assistant: true,
    summary: true,
    suggestions: true,
    transcript: true,
    related: false,
  },
  shadow: 52,
  startMinimized: false,
  theme: 'dark',
};

type StoreState = {
  appState: AppState;
  consent: ConsentState;
  overlayPreferences: OverlayPreferences;
  setAppState: (appState: AppState) => void;
  patchSession: (session: AppState['session']) => void;
  patchRollingSummary: (rollingSummary: AppState['rollingSummary']) => void;
  patchContextCue: (contextCue: AppState['contextCue']) => void;
  patchAdaptiveInference: (
    adaptiveInference: AppState['adaptiveInference'],
  ) => void;
  pushTranscriptChunk: (chunk: AppState['transcript'][number]) => void;
  setConsentField: (field: keyof ConsentState, value: boolean) => void;
  setOverlayPreference: <Key extends keyof OverlayPreferences>(
    key: Key,
    value: OverlayPreferences[Key],
  ) => void;
  toggleOverlaySection: (key: OverlaySectionKey) => void;
  startSessionLocally: () => void;
  stopSessionLocally: () => void;
};

export const useAppStore = create<StoreState>()(
  persist(
    (set) => ({
      appState: defaultState,
      consent: defaultConsent,
      overlayPreferences: defaultOverlayPreferences,
      setAppState: (appState) => set({ appState }),
      patchSession: (session) =>
        set((state) => ({ appState: { ...state.appState, session } })),
      patchRollingSummary: (rollingSummary) =>
        set((state) => ({ appState: { ...state.appState, rollingSummary } })),
      patchContextCue: (contextCue) =>
        set((state) => ({ appState: { ...state.appState, contextCue } })),
      patchAdaptiveInference: (adaptiveInference) =>
        set((state) => ({
          appState: { ...state.appState, adaptiveInference },
        })),
      pushTranscriptChunk: (chunk) =>
        set((state) => ({
          appState: {
            ...state.appState,
            transcript: [...state.appState.transcript.slice(-9), chunk],
          },
        })),
      setConsentField: (field, value) =>
        set((state) => ({
          consent: {
            ...state.consent,
            [field]: value,
          },
        })),
      setOverlayPreference: (key, value) =>
        set((state) => ({
          overlayPreferences: {
            ...state.overlayPreferences,
            [key]: value,
          },
        })),
      toggleOverlaySection: (key) =>
        set((state) => ({
          overlayPreferences: {
            ...state.overlayPreferences,
            sections: {
              ...state.overlayPreferences.sections,
              [key]: !state.overlayPreferences.sections[key],
            },
          },
        })),
      startSessionLocally: () =>
        set((state) => ({
          appState: {
            ...state.appState,
            session: {
              ...state.appState.session,
              status: 'running',
            },
          },
        })),
      stopSessionLocally: () =>
        set((state) => ({
          appState: {
            ...state.appState,
            session: {
              ...state.appState.session,
              status: 'stopped',
            },
          },
        })),
    }),
    {
      name: 'context-cue-ui-v1',
      partialize: (state) => ({
        consent: state.consent,
        overlayPreferences: state.overlayPreferences,
      }),
      storage: createBrowserPersistStorage(),
    },
  ),
);
