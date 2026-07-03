import type { SettingsPageProps } from '@/features/dashboard/components/settings/settings-types';

type SettingsMiscCardProps = Pick<
  SettingsPageProps,
  'overlayPreferences' | 'setOverlayPreference'
>;

export function SettingsMiscCard({
  overlayPreferences,
  setOverlayPreference,
}: SettingsMiscCardProps) {
  return (
    <article className="soft-card settings-panel-card settings-mini-card">
      <h3>その他</h3>
      <div className="settings-mini-row">
        <div>
          <strong>言語</strong>
          <p>オーバーレイ内の言語を設定します。</p>
        </div>
        <select
          className="setting-select setting-select-v2"
          onChange={(event) =>
            setOverlayPreference(
              'language',
              event.target.value as '日本語' | 'English',
            )
          }
          value={overlayPreferences.language}
        >
          <option value="日本語">日本語</option>
          <option value="English">English</option>
        </select>
      </div>
      <div className="settings-mini-row">
        <div>
          <strong>自動保存</strong>
          <p>設定の変更を自動的に保存します。</p>
        </div>
        <button
          className={`switch ${overlayPreferences.autoSave ? 'on' : ''}`}
          onClick={() =>
            setOverlayPreference('autoSave', !overlayPreferences.autoSave)
          }
          type="button"
        >
          <span />
        </button>
      </div>
    </article>
  );
}
