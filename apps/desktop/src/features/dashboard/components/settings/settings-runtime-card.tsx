import type { SettingsPageProps } from '@/features/dashboard/components/settings/settings-types';

type SettingsRuntimeCardProps = Pick<
  SettingsPageProps,
  | 'appState'
  | 'canStart'
  | 'clearProfileDocuments'
  | 'consent'
  | 'setConsentField'
  | 'sideOverlayVisible'
  | 'startSession'
  | 'stopSession'
  | 'toggleShareSafeMode'
  | 'topOverlayVisible'
>;

export function SettingsRuntimeCard({
  appState,
  canStart,
  clearProfileDocuments,
  consent,
  setConsentField,
  sideOverlayVisible,
  startSession,
  stopSession,
  toggleShareSafeMode,
  topOverlayVisible,
}: SettingsRuntimeCardProps) {
  return (
    <article className="soft-card settings-panel-card settings-runtime-note">
      <h3>利用時の注意</h3>
      <ul className="people-bullet-list">
        <li>現在のセッション状態: {appState.session.status}</li>
        <li>読み込み済みナレッジ: {appState.importedDocuments.length} 件</li>
        <li>上部オーバーレイ: {topOverlayVisible ? '表示中' : '非表示'}</li>
        <li>右側オーバーレイ: {sideOverlayVisible ? '表示中' : '非表示'}</li>
        <li>
          参加者同意: {consent.participantConsent ? '確認済み' : '未確認'}
        </li>
      </ul>
      <div className="settings-consent-box">
        <ConsentRow
          checked={consent.participantConsent}
          label="同意を確認済み"
          onChange={(checked) => setConsentField('participantConsent', checked)}
        />
        <ConsentRow
          checked={consent.noCovertUse}
          label="ステルス用途に使わない"
          onChange={(checked) => setConsentField('noCovertUse', checked)}
        />
        <ConsentRow
          checked={consent.shareSafeUnderstood}
          label="記録と補助の挙動を理解している"
          onChange={(checked) =>
            setConsentField('shareSafeUnderstood', checked)
          }
        />
      </div>
      <div className="settings-runtime-actions">
        <button
          className="primary-button share-button"
          disabled={!canStart}
          onClick={startSession}
          type="button"
        >
          セッション開始
        </button>
        <button
          className="outline-button small"
          disabled={appState.session.status !== 'running'}
          onClick={stopSession}
          type="button"
        >
          セッション停止
        </button>
        <button
          className="outline-button small"
          onClick={toggleShareSafeMode}
          type="button"
        >
          Share Safe Mode
        </button>
        <button
          className="outline-button small"
          disabled={appState.importedDocuments.length === 0}
          onClick={clearProfileDocuments}
          type="button"
        >
          ナレッジ削除
        </button>
      </div>
    </article>
  );
}

type ConsentRowProps = {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
};

function ConsentRow({ checked, label, onChange }: ConsentRowProps) {
  return (
    <label className="checkbox-row settings-consent-row">
      <input
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      {label}
    </label>
  );
}
