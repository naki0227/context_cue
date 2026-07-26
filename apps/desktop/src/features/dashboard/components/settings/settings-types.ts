import type { DashboardController } from '@/features/dashboard/hooks/use-dashboard-controller';

export type SettingsPageProps = Pick<
  DashboardController,
  | 'appState'
  | 'canStart'
  | 'clearProfileDocuments'
  | 'consent'
  | 'dataActionNotice'
  | 'deleteAllLocalData'
  | 'exportAllData'
  | 'ollama'
  | 'ollamaCancelPull'
  | 'ollamaPullModel'
  | 'ollamaRefresh'
  | 'overlayPreferences'
  | 'setConsentField'
  | 'setOverlayPreference'
  | 'sideOverlayVisible'
  | 'startSession'
  | 'stopSession'
  | 'toggleShareSafeMode'
  | 'toggleOverlaySection'
  | 'topOverlayVisible'
>;
