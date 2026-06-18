import { create } from 'zustand';
import type { AppState, ConsentState } from '@/lib/schemas/app-state';

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
    currentTopic: 'Waiting for a session',
    importantPoints: [],
    openQuestions: [],
  },
  contextCue: {
    topic: 'No active conversation',
    intent: 'Start a session to preview cues',
    relatedNotes: [],
    suggestedPoints: [],
    questionsToAsk: [],
    caution: 'Consent is required before transcription starts.',
  },
  transcript: [],
};

const defaultConsent: ConsentState = {
  participantConsent: false,
  noCovertUse: false,
  shareSafeUnderstood: false,
};

type StoreState = {
  appState: AppState;
  consent: ConsentState;
  setAppState: (appState: AppState) => void;
  patchSession: (session: AppState['session']) => void;
  patchRollingSummary: (rollingSummary: AppState['rollingSummary']) => void;
  patchContextCue: (contextCue: AppState['contextCue']) => void;
  patchAdaptiveInference: (
    adaptiveInference: AppState['adaptiveInference'],
  ) => void;
  pushTranscriptChunk: (chunk: AppState['transcript'][number]) => void;
  setConsentField: (field: keyof ConsentState, value: boolean) => void;
  startSessionLocally: () => void;
  stopSessionLocally: () => void;
};

export const useAppStore = create<StoreState>((set) => ({
  appState: defaultState,
  consent: defaultConsent,
  setAppState: (appState) => set({ appState }),
  patchSession: (session) =>
    set((state) => ({ appState: { ...state.appState, session } })),
  patchRollingSummary: (rollingSummary) =>
    set((state) => ({ appState: { ...state.appState, rollingSummary } })),
  patchContextCue: (contextCue) =>
    set((state) => ({ appState: { ...state.appState, contextCue } })),
  patchAdaptiveInference: (adaptiveInference) =>
    set((state) => ({ appState: { ...state.appState, adaptiveInference } })),
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
}));
