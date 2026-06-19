import type { DashboardController } from '@/features/dashboard/hooks/use-dashboard-controller';

type SettingsPageProps = Pick<
  DashboardController,
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

export function SettingsPage({
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
}: SettingsPageProps) {
  const sectionItems = [
    {
      title: 'AI アシスタント',
      subtitle: '質問への回答や提案を表示します',
      checked: topOverlayVisible,
      tone: 'blue',
    },
    {
      title: '議事の要点',
      subtitle: '議論の要点や結論をリアルタイムで表示します',
      checked: consent.shareSafeUnderstood,
      tone: 'violet',
    },
    {
      title: '提案・次のアクション',
      subtitle: '推奨されるアクションや次のステップを表示します',
      checked: consent.noCovertUse,
      tone: 'gold',
    },
    {
      title: '転記（トランスクリプト）',
      subtitle: '会話の文字起こしを表示します',
      checked: sideOverlayVisible,
      tone: 'green',
    },
    {
      title: '関連情報',
      subtitle: '関連するプロジェクトやナレッジを表示します',
      checked: consent.participantConsent,
      tone: 'slate',
    },
  ];

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
                  defaultValue="右上"
                >
                  <option>右上</option>
                  <option>上部中央</option>
                  <option>右寄せ</option>
                </select>
              </div>
            </div>

            <div className="settings-block">
              <div className="settings-label-row">
                <div>
                  <strong>高さ</strong>
                  <p>オーバーレイ全体の高さを調整します。</p>
                </div>
                <span className="settings-value-pill">400px</span>
              </div>
              <div className="settings-slider-row">
                <input defaultValue="56" type="range" />
              </div>
            </div>

            <div className="settings-block">
              <div className="settings-label-row">
                <div>
                  <strong>文字サイズ</strong>
                  <p>オーバーレイ内のテキストサイズを調整します。</p>
                </div>
                <span className="settings-value-pill">14px</span>
              </div>
              <div className="settings-slider-row">
                <input defaultValue="34" type="range" />
              </div>
            </div>

            <div className="settings-block">
              <div className="settings-label-row">
                <div>
                  <strong>透明度</strong>
                  <p>オーバーレイの背景の透明度を調整します。</p>
                </div>
                <span className="settings-value-pill">90%</span>
              </div>
              <div className="settings-slider-row">
                <input defaultValue="90" type="range" />
              </div>
            </div>

            <div className="settings-block">
              <div className="settings-section-head">
                <strong>表示するセクション</strong>
                <p>オーバーレイに表示する情報を選択します。</p>
              </div>

              <div className="settings-section-list">
                {sectionItems.map((item) => (
                  <div className="settings-section-row" key={item.title}>
                    <span
                      aria-hidden="true"
                      className={`settings-check-indicator ${item.checked ? 'checked' : ''}`}
                    />
                    <span
                      className={`settings-section-icon tone-${item.tone}`}
                    />
                    <span className="settings-section-copy">
                      <strong>{item.title}</strong>
                      <small>{item.subtitle}</small>
                    </span>
                    <span className="settings-drag-handle">⋮⋮</span>
                  </div>
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
                defaultValue="日本語"
              >
                <option>日本語</option>
                <option>English</option>
              </select>
            </div>
            <div className="settings-mini-row">
              <div>
                <strong>自動保存</strong>
                <p>設定の変更を自動的に保存します。</p>
              </div>
              <button className="switch on" type="button">
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
                  <button className="active" type="button">
                    ダーク
                  </button>
                  <button type="button">ライト</button>
                  <button type="button">自動</button>
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
                  {[
                    '#2d5bff',
                    '#6d50ef',
                    '#18b3a8',
                    '#f3b11c',
                    '#ef476f',
                    '#9aa3b7',
                  ].map((color, index) => (
                    <button
                      className={`accent-swatch accent-swatch-v2 ${index === 0 ? 'active' : ''}`}
                      key={color}
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
                <span className="settings-value-pill">12px</span>
              </div>
              <div className="settings-slider-row">
                <input defaultValue="24" type="range" />
              </div>
            </div>

            <div className="settings-block">
              <div className="settings-label-row">
                <div>
                  <strong>シャドウ</strong>
                  <p>オーバーレイの影の強さを調整します。</p>
                </div>
                <span className="settings-value-pill">中</span>
              </div>
              <div className="settings-slider-row">
                <input defaultValue="52" type="range" />
              </div>
            </div>
          </article>

          <article className="soft-card settings-panel-card">
            <h3>動作設定</h3>
            <div className="settings-toggle-list">
              {[
                ['常に表示（Always-on）', true],
                ['画面共有中は非表示', true],
                ['トランスクリプトパネルを維持', true],
                ['起動時に最小化して開始', false],
                ['未読の提案をハイライト', true],
              ].map(([label, enabled]) => (
                <div className="settings-toggle-row" key={label}>
                  <div>
                    <strong>{label}</strong>
                    <p>
                      {label === '常に表示（Always-on）'
                        ? '他のアプリの上にも常にオーバーレイを表示します。'
                        : label === '画面共有中は非表示'
                          ? '画面共有やプレゼンテーション中はオーバーレイを非表示にします。'
                          : label === 'トランスクリプトパネルを維持'
                            ? '画面が狭い場合でも、転記パネルを折りたたまずに表示します。'
                            : label === '起動時に最小化して開始'
                              ? 'アプリ起動時はオーバーレイを最小化した状態で開始します。'
                              : '新しい提案やアクションがある場合にハイライトで通知します。'}
                    </p>
                  </div>
                  <button
                    className={`switch ${enabled ? 'on' : ''}`}
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
