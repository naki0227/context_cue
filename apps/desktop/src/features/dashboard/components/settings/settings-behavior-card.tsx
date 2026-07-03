import { behaviorItems } from '@/features/dashboard/components/settings/settings-config';
import type { SettingsPageProps } from '@/features/dashboard/components/settings/settings-types';

type SettingsBehaviorCardProps = Pick<
  SettingsPageProps,
  'overlayPreferences' | 'setOverlayPreference'
>;

export function SettingsBehaviorCard({
  overlayPreferences,
  setOverlayPreference,
}: SettingsBehaviorCardProps) {
  return (
    <article className="soft-card settings-panel-card">
      <h3>動作設定</h3>
      <div className="settings-toggle-list">
        {behaviorItems.map((item) => (
          <div className="settings-toggle-row" key={item.key}>
            <div>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </div>
            <button
              className={`switch ${overlayPreferences[item.key] ? 'on' : ''}`}
              onClick={() =>
                setOverlayPreference(item.key, !overlayPreferences[item.key])
              }
              type="button"
            >
              <span />
            </button>
          </div>
        ))}
      </div>

      <div className="settings-hotkey-row">
        <div>
          <strong>ホットキーで表示 / 非表示を切り替え</strong>
          <p>設定したショートカットキーでオーバーレイの表示を切り替えます。</p>
        </div>
        <div className="settings-hotkey-pill">Ctrl + Alt + O</div>
      </div>
    </article>
  );
}
