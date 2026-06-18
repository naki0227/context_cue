import type { DashboardController } from '@/features/dashboard/hooks/use-dashboard-controller';

type SettingsPageProps = Pick<
  DashboardController,
  | 'appState'
  | 'canStart'
  | 'consent'
  | 'setConsentField'
  | 'sideOverlayVisible'
  | 'startSession'
  | 'stopSession'
  | 'toggleOverlay'
  | 'toggleShareSafeMode'
  | 'topOverlayVisible'
  | 'clearProfileDocuments'
>;

export function SettingsPage({
  appState,
  canStart,
  clearProfileDocuments,
  consent,
  setConsentField,
  sideOverlayVisible,
  startSession,
  stopSession,
  toggleOverlay,
  toggleShareSafeMode,
  topOverlayVisible,
}: SettingsPageProps) {
  return (
    <div className="page-layout">
      <div className="settings-grid">
        <article className="soft-card">
          <h3>表示設定</h3>
          <div className="setting-row">
            <span>表示位置</span>
            <select className="setting-select" defaultValue="右上中央">
              <option>右上中央</option>
              <option>上部固定</option>
              <option>右寄せ</option>
            </select>
          </div>
          <div className="setting-row">
            <span>高さ</span>
            <div className="slider-row">
              <input defaultValue="80" type="range" />
              <strong>80px</strong>
            </div>
          </div>
          <div className="setting-row">
            <span>文字サイズ</span>
            <div className="slider-row">
              <input defaultValue="14" type="range" />
              <strong>14px</strong>
            </div>
          </div>
          <div className="setting-row">
            <span>透明度</span>
            <div className="slider-row">
              <input defaultValue="90" type="range" />
              <strong>90%</strong>
            </div>
          </div>

          <div className="settings-checks">
            <label className="checkbox-row">
              <input
                checked={consent.participantConsent}
                onChange={(event) =>
                  setConsentField('participantConsent', event.target.checked)
                }
                type="checkbox"
              />
              同意を確認済み
            </label>
            <label className="checkbox-row">
              <input
                checked={consent.noCovertUse}
                onChange={(event) =>
                  setConsentField('noCovertUse', event.target.checked)
                }
                type="checkbox"
              />
              ステルス用途に使わない
            </label>
            <label className="checkbox-row">
              <input
                checked={consent.shareSafeUnderstood}
                onChange={(event) =>
                  setConsentField('shareSafeUnderstood', event.target.checked)
                }
                type="checkbox"
              />
              記録と補助の挙動を理解している
            </label>
          </div>

          <div className="knowledge-actions">
            <button
              className={topOverlayVisible ? '' : 'secondary-button'}
              onClick={() => toggleOverlay('top')}
              type="button"
            >
              {topOverlayVisible
                ? '上部オーバーレイを隠す'
                : '上部オーバーレイを表示'}
            </button>
            <button
              className={sideOverlayVisible ? '' : 'secondary-button'}
              onClick={() => toggleOverlay('side')}
              type="button"
            >
              {sideOverlayVisible
                ? '右オーバーレイを隠す'
                : '右オーバーレイを表示'}
            </button>
            <button disabled={!canStart} onClick={startSession} type="button">
              セッション開始
            </button>
            <button
              className="secondary-button"
              disabled={appState.session.status !== 'running'}
              onClick={stopSession}
              type="button"
            >
              セッション停止
            </button>
            <button
              className="ghost-button"
              onClick={toggleShareSafeMode}
              type="button"
            >
              Share Safe Mode 切り替え
            </button>
            <button
              className="ghost-button"
              disabled={appState.importedDocuments.length === 0}
              onClick={clearProfileDocuments}
              type="button"
            >
              すべて削除
            </button>
          </div>
        </article>

        <article className="soft-card">
          <h3>デザイン</h3>
          <div className="setting-row">
            <span>テーマ</span>
            <div className="radio-row">
              <label>
                <input defaultChecked name="theme" type="radio" />
                ダーク
              </label>
              <label>
                <input name="theme" type="radio" />
                ライト
              </label>
              <label>
                <input name="theme" type="radio" />
                自動
              </label>
            </div>
          </div>

          <div className="setting-row">
            <span>アクセントカラー</span>
            <div className="accent-row">
              {[
                '#274cff',
                '#3b82f6',
                '#38bdf8',
                '#34d399',
                '#f59e0b',
                '#f472b6',
              ].map((color, index) => (
                <button
                  className={`accent-swatch ${index === 0 ? 'active' : ''}`}
                  key={color}
                  style={{ background: color }}
                  type="button"
                />
              ))}
            </div>
          </div>

          <div className="toggle-list">
            {[
              '起動時に表示',
              '常に画面前面に表示',
              '画面共有時には非表示にする',
              '録音・文字起こしを事前にする',
            ].map((label, index) => (
              <div className="toggle-row" key={label}>
                <span>{label}</span>
                <button
                  className={`switch ${index > 0 ? 'on' : ''}`}
                  type="button"
                >
                  <span />
                </button>
              </div>
            ))}
          </div>

          <div className="hint-box">
            表示位置や透明度は、右上で邪魔にならず、視線移動だけで読めることを想定して調整しています。
          </div>
        </article>
      </div>
    </div>
  );
}
