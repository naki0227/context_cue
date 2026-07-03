import { SettingsBehaviorCard } from '@/features/dashboard/components/settings/settings-behavior-card';
import { SettingsDesignCard } from '@/features/dashboard/components/settings/settings-design-card';
import { SettingsDisplayCard } from '@/features/dashboard/components/settings/settings-display-card';
import { SettingsMiscCard } from '@/features/dashboard/components/settings/settings-misc-card';
import { SettingsRuntimeCard } from '@/features/dashboard/components/settings/settings-runtime-card';
import type { SettingsPageProps } from '@/features/dashboard/components/settings/settings-types';

export function SettingsPage(props: SettingsPageProps) {
  return (
    <div className="page-layout settings-page-v2">
      <div className="settings-hero">
        <h1>Overlay Settings</h1>
        <p>
          オーバーレイ（AI
          アシスタント）の表示やデザイン、動作をカスタマイズできます。
        </p>
      </div>

      <div className="settings-grid settings-grid-v2">
        <div className="settings-left-column">
          <SettingsDisplayCard
            overlayPreferences={props.overlayPreferences}
            setOverlayPreference={props.setOverlayPreference}
            toggleOverlaySection={props.toggleOverlaySection}
          />
          <SettingsMiscCard
            overlayPreferences={props.overlayPreferences}
            setOverlayPreference={props.setOverlayPreference}
          />
        </div>

        <div className="settings-right-column">
          <SettingsDesignCard
            overlayPreferences={props.overlayPreferences}
            setOverlayPreference={props.setOverlayPreference}
          />
          <SettingsBehaviorCard
            overlayPreferences={props.overlayPreferences}
            setOverlayPreference={props.setOverlayPreference}
          />
          <SettingsRuntimeCard
            appState={props.appState}
            canStart={props.canStart}
            clearProfileDocuments={props.clearProfileDocuments}
            consent={props.consent}
            setConsentField={props.setConsentField}
            sideOverlayVisible={props.sideOverlayVisible}
            startSession={props.startSession}
            stopSession={props.stopSession}
            toggleShareSafeMode={props.toggleShareSafeMode}
            topOverlayVisible={props.topOverlayVisible}
          />
        </div>
      </div>
    </div>
  );
}
