import type { DashboardController } from '@/features/dashboard/hooks/use-dashboard-controller';
import type {
  OverlayPosition,
  OverlaySectionKey,
  OverlayTheme,
} from '@/lib/state/app-store';

type SettingsPageProps = Pick<
  DashboardController,
  | 'appState'
  | 'canStart'
  | 'clearProfileDocuments'
  | 'consent'
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

const accentColors = [
  '#2d5bff',
  '#6d50ef',
  '#18b3a8',
  '#f3b11c',
  '#ef476f',
  '#9aa3b7',
];

const sectionItems: Array<{
  key: OverlaySectionKey;
  subtitle: string;
  title: string;
  tone: string;
}> = [
  {
    key: 'assistant',
    title: 'AI アシスタント',
    subtitle: '質問への回答や提案を表示します',
    tone: 'blue',
  },
  {
    key: 'summary',
    title: '議事の要点',
    subtitle: '議論の要点や結論をリアルタイムで表示します',
    tone: 'violet',
  },
  {
    key: 'suggestions',
    title: '提案・次のアクション',
    subtitle: '推奨されるアクションや次のステップを表示します',
    tone: 'gold',
  },
  {
    key: 'transcript',
    title: '転記（トランスクリプト）',
    subtitle: '会話の文字起こしを表示します',
    tone: 'green',
  },
  {
    key: 'related',
    title: '関連情報',
    subtitle: '関連するプロジェクトやナレッジを表示します',
    tone: 'slate',
  },
];

const behaviorItems: Array<{
  description: string;
  key:
    | 'alwaysOn'
    | 'hideOnScreenShare'
    | 'keepTranscriptPanel'
    | 'startMinimized'
    | 'highlightUnread';
  title: string;
}> = [
  {
    key: 'alwaysOn',
    title: '常に表示（Always-on）',
    description: '他のアプリの上にも常にオーバーレイを表示します。',
  },
  {
    key: 'hideOnScreenShare',
    title: '画面共有中は非表示',
    description:
      '画面共有やプレゼンテーション中はオーバーレイを非表示にします。',
  },
  {
    key: 'keepTranscriptPanel',
    title: 'トランスクリプトパネルを維持',
    description: '画面が狭い場合でも、転記パネルを折りたたまずに表示します。',
  },
  {
    key: 'startMinimized',
    title: '起動時に最小化して開始',
    description: 'アプリ起動時はオーバーレイを最小化した状態で開始します。',
  },
  {
    key: 'highlightUnread',
    title: '未読の提案をハイライト',
    description: '新しい提案やアクションがある場合にハイライトで通知します。',
  },
];

const themeOptions: OverlayTheme[] = ['dark', 'light', 'auto'];
const themeLabels: Record<OverlayTheme, string> = {
  dark: 'ダーク',
  light: 'ライト',
  auto: '自動',
};

const positionOptions: OverlayPosition[] = ['右上', '上部中央', '右寄せ'];

function shadowLabel(shadow: number) {
  if (shadow < 34) return '弱';
  if (shadow < 67) return '中';
  return '強';
}

export function SettingsPage({
  appState,
  canStart,
  clearProfileDocuments,
  consent,
  overlayPreferences,
  setConsentField,
  setOverlayPreference,
  sideOverlayVisible,
  startSession,
  stopSession,
  toggleOverlaySection,
  toggleShareSafeMode,
  topOverlayVisible,
}: SettingsPageProps) {
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
          <article className="soft-card settings-panel-card">
            <h3>表示設定</h3>

            <div className="settings-block">
              <div className="settings-label-row">
                <div>
                  <strong>表示位置</strong>
                  <p>オーバーレイを画面のどこに表示するかを設定します。</p>
                </div>
                <select
                  className="setting-select setting-select-v2"
                  onChange={(event) =>
                    setOverlayPreference(
                      'position',
                      event.target.value as OverlayPosition,
                    )
                  }
                  value={overlayPreferences.position}
                >
                  {positionOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="settings-block">
              <div className="settings-label-row">
                <div>
                  <strong>高さ</strong>
                  <p>オーバーレイ全体の高さを調整します。</p>
                </div>
                <span className="settings-value-pill">
                  {overlayPreferences.height}px
                </span>
              </div>
              <div className="settings-slider-row">
                <input
                  max="560"
                  min="280"
                  onChange={(event) =>
                    setOverlayPreference('height', Number(event.target.value))
                  }
                  type="range"
                  value={overlayPreferences.height}
                />
              </div>
            </div>

            <div className="settings-block">
              <div className="settings-label-row">
                <div>
                  <strong>文字サイズ</strong>
                  <p>オーバーレイ内のテキストサイズを調整します。</p>
                </div>
                <span className="settings-value-pill">
                  {overlayPreferences.fontSize}px
                </span>
              </div>
              <div className="settings-slider-row">
                <input
                  max="18"
                  min="12"
                  onChange={(event) =>
                    setOverlayPreference('fontSize', Number(event.target.value))
                  }
                  type="range"
                  value={overlayPreferences.fontSize}
                />
              </div>
            </div>

            <div className="settings-block">
              <div className="settings-label-row">
                <div>
                  <strong>透明度</strong>
                  <p>オーバーレイの背景の透明度を調整します。</p>
                </div>
                <span className="settings-value-pill">
                  {overlayPreferences.opacity}%
                </span>
              </div>
              <div className="settings-slider-row">
                <input
                  max="100"
                  min="55"
                  onChange={(event) =>
                    setOverlayPreference('opacity', Number(event.target.value))
                  }
                  type="range"
                  value={overlayPreferences.opacity}
                />
              </div>
            </div>

            <div className="settings-block">
              <div className="settings-section-head">
                <strong>表示するセクション</strong>
                <p>オーバーレイに表示する情報を選択します。</p>
              </div>

              <div className="settings-section-list">
                {sectionItems.map((item) => (
                  <button
                    className="settings-section-row"
                    key={item.key}
                    onClick={() => toggleOverlaySection(item.key)}
                    type="button"
                  >
                    <span
                      aria-hidden="true"
                      className={`settings-check-indicator ${
                        overlayPreferences.sections[item.key] ? 'checked' : ''
                      }`}
                    />
                    <span
                      className={`settings-section-icon tone-${item.tone}`}
                    />
                    <span className="settings-section-copy">
                      <strong>{item.title}</strong>
                      <small>{item.subtitle}</small>
                    </span>
                    <span className="settings-drag-handle">⋮⋮</span>
                  </button>
                ))}
              </div>
              <p className="settings-caption">
                ドラッグ & ドロップで表示順を並び替えられます
              </p>
            </div>
          </article>

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
        </div>

        <div className="settings-right-column">
          <article className="soft-card settings-panel-card">
            <h3>デザイン設定</h3>

            <div className="settings-block">
              <div className="settings-label-row">
                <div>
                  <strong>テーマ</strong>
                  <p>オーバーレイの配色テーマを選択します。</p>
                </div>
                <div className="settings-segmented">
                  {themeOptions.map((theme) => (
                    <button
                      className={
                        overlayPreferences.theme === theme ? 'active' : ''
                      }
                      key={theme}
                      onClick={() => setOverlayPreference('theme', theme)}
                      type="button"
                    >
                      {themeLabels[theme]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="settings-block">
              <div className="settings-label-row">
                <div>
                  <strong>アクセントカラー</strong>
                  <p>オーバーレイのアクセントカラーを選択します。</p>
                </div>
                <div className="settings-color-row">
                  {accentColors.map((color) => (
                    <button
                      aria-label={`${color} を選択`}
                      className={`accent-swatch accent-swatch-v2 ${
                        overlayPreferences.accentColor === color ? 'active' : ''
                      }`}
                      key={color}
                      onClick={() => setOverlayPreference('accentColor', color)}
                      style={{ background: color }}
                      type="button"
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="settings-block">
              <div className="settings-label-row">
                <div>
                  <strong>角の丸み</strong>
                  <p>オーバーレイの角の丸みを調整します。</p>
                </div>
                <span className="settings-value-pill">
                  {overlayPreferences.cornerRadius}px
                </span>
              </div>
              <div className="settings-slider-row">
                <input
                  max="28"
                  min="8"
                  onChange={(event) =>
                    setOverlayPreference(
                      'cornerRadius',
                      Number(event.target.value),
                    )
                  }
                  type="range"
                  value={overlayPreferences.cornerRadius}
                />
              </div>
            </div>

            <div className="settings-block">
              <div className="settings-label-row">
                <div>
                  <strong>シャドウ</strong>
                  <p>オーバーレイの影の強さを調整します。</p>
                </div>
                <span className="settings-value-pill">
                  {shadowLabel(overlayPreferences.shadow)}
                </span>
              </div>
              <div className="settings-slider-row">
                <input
                  max="84"
                  min="12"
                  onChange={(event) =>
                    setOverlayPreference('shadow', Number(event.target.value))
                  }
                  type="range"
                  value={overlayPreferences.shadow}
                />
              </div>
            </div>
          </article>

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
                    className={`switch ${
                      overlayPreferences[item.key] ? 'on' : ''
                    }`}
                    onClick={() =>
                      setOverlayPreference(
                        item.key,
                        !overlayPreferences[item.key],
                      )
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
                <p>
                  設定したショートカットキーでオーバーレイの表示を切り替えます。
                </p>
              </div>
              <div className="settings-hotkey-pill">Ctrl + Alt + O</div>
            </div>
          </article>

          <article className="soft-card settings-panel-card settings-runtime-note">
            <h3>利用時の注意</h3>
            <ul className="people-bullet-list">
              <li>現在のセッション状態: {appState.session.status}</li>
              <li>
                読み込み済みナレッジ: {appState.importedDocuments.length} 件
              </li>
              <li>
                上部オーバーレイ: {topOverlayVisible ? '表示中' : '非表示'}
              </li>
              <li>
                右側オーバーレイ: {sideOverlayVisible ? '表示中' : '非表示'}
              </li>
              <li>
                参加者同意: {consent.participantConsent ? '確認済み' : '未確認'}
              </li>
            </ul>
            <div className="settings-consent-box">
              <label className="checkbox-row settings-consent-row">
                <input
                  checked={consent.participantConsent}
                  onChange={(event) =>
                    setConsentField('participantConsent', event.target.checked)
                  }
                  type="checkbox"
                />
                同意を確認済み
              </label>
              <label className="checkbox-row settings-consent-row">
                <input
                  checked={consent.noCovertUse}
                  onChange={(event) =>
                    setConsentField('noCovertUse', event.target.checked)
                  }
                  type="checkbox"
                />
                ステルス用途に使わない
              </label>
              <label className="checkbox-row settings-consent-row">
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
        </div>
      </div>
    </div>
  );
}
