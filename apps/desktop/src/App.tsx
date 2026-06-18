import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/lib/state/app-store';
import { invokeCommand, setOverlayVisibility } from '@/lib/tauri/commands';
import { attachAppEvents } from '@/lib/tauri/events';

const MAX_IMPORT_FILE_SIZE = 512 * 1024;

const navItems = [
  'Home',
  'Sessions',
  'People',
  'Projects / Companies',
  'My Knowledge',
  'Templates',
  'Review',
  'Overlay Settings',
];

const actionItems = [
  {
    title: '事前ブリーフを作る',
    description: '相手や議題の情報をもとに要点を整理',
  },
  {
    title: '想定質問を作る',
    description: 'よく聞かれそうな質問を AI が生成',
  },
  {
    title: '確認事項を出す',
    description: '会話で確認すべきポイントを提案',
  },
  {
    title: '過去メモを要約する',
    description: '関連する過去の会話を要約',
  },
];

const useCases = [
  {
    title: '面接',
    description: '質問への応答整理、深掘り質問の想定、自己PRの整理をサポート。',
  },
  {
    title: '面談・カジュアル面談',
    description: '相手の話を整理し、質問の候補や関係構築のポイントを提案。',
  },
  {
    title: '会議',
    description: '議題の整理、決定事項の可視化、次アクションの明確化を支援。',
  },
  {
    title: 'グループディスカッション',
    description: '論点の整理、発言タイミングの提案、役割や立ち回りをサポート。',
  },
  {
    title: 'その他',
    description: '1on1、商談、授業、ブレストなどにもそのまま対応。',
  },
];

const listeningBarIds = [
  'bar-01',
  'bar-02',
  'bar-03',
  'bar-04',
  'bar-05',
  'bar-06',
  'bar-07',
  'bar-08',
  'bar-09',
  'bar-10',
  'bar-11',
  'bar-12',
  'bar-13',
  'bar-14',
  'bar-15',
  'bar-16',
  'bar-17',
  'bar-18',
];

function formatMode(mode: 'light' | 'deep') {
  return mode === 'deep' ? '深い推論' : '軽量モード';
}

function formatStatus(status: 'idle' | 'running' | 'stopped') {
  switch (status) {
    case 'running':
      return 'セッション中';
    case 'stopped':
      return '停止中';
    default:
      return '待機中';
  }
}

function formatPreparedness(count: number) {
  if (count >= 4) {
    return '準備完了';
  }

  if (count >= 2) {
    return '準備中';
  }

  return '未準備';
}

function isImportableKnowledgeFile(file: File) {
  const normalizedName = file.name.toLowerCase();
  return normalizedName.endsWith('.md') || normalizedName.endsWith('.txt');
}

function stripExtension(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, '');
}

function readFileText(file: File) {
  if (typeof file.text === 'function') {
    return file.text();
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
}

function getWindowView() {
  if (typeof window === 'undefined') {
    return 'dashboard';
  }

  const view = new URLSearchParams(window.location.search).get('view');
  if (view === 'overlay-top' || view === 'overlay-side') {
    return view;
  }

  return 'dashboard';
}

export function App() {
  const {
    appState,
    consent,
    setConsentField,
    setAppState,
    startSessionLocally,
    stopSessionLocally,
  } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [knowledgeImportNotice, setKnowledgeImportNotice] = useState('');
  const [topOverlayVisible, setTopOverlayVisible] = useState(true);
  const [sideOverlayVisible, setSideOverlayVisible] = useState(true);

  useEffect(() => {
    invokeCommand('get_app_state')
      .then((state) => setAppState(state))
      .catch(() => undefined);

    return attachAppEvents(useAppStore.getState());
  }, [setAppState]);

  const windowView = getWindowView();
  const topOverlayWindow = windowView === 'overlay-top';
  const sideOverlayWindow = windowView === 'overlay-side';

  useEffect(() => {
    document.body.dataset.view =
      windowView === 'dashboard' ? 'dashboard' : 'overlay';
    document.body.dataset.overlayKind = windowView;

    return () => {
      delete document.body.dataset.view;
      delete document.body.dataset.overlayKind;
    };
  }, [windowView]);

  const canStart =
    consent.participantConsent &&
    consent.noCovertUse &&
    consent.shareSafeUnderstood &&
    appState.session.status !== 'running';

  const transcriptPreview = appState.transcript.slice(-4);
  const preparedness = formatPreparedness(appState.importedDocuments.length);
  const nextSessionTitle =
    appState.contextCue.topic === 'まだ会話は始まっていません'
      ? '次のセッションを準備しましょう'
      : appState.contextCue.topic;
  const overlayTopic =
    appState.contextCue.topic === 'まだ会話は始まっていません'
      ? '会話開始待ち'
      : appState.contextCue.topic;
  const flowPoints = [
    appState.contextCue.intent,
    ...appState.rollingSummary.importantPoints,
  ].filter((value, index, array) => value && array.indexOf(value) === index);
  const nextTalkCandidates =
    appState.contextCue.suggestedPoints.length > 0
      ? appState.contextCue.suggestedPoints
      : ['関連する経験を1つ選ぶ', '相手の意図を言い換えて返す'];
  const confirmItems =
    appState.contextCue.questionsToAsk.length > 0
      ? appState.contextCue.questionsToAsk
      : appState.rollingSummary.openQuestions.length > 0
        ? appState.rollingSummary.openQuestions
        : ['認識のズレがないか確認する', '次のアクションを明確にする'];
  const memoItems =
    appState.contextCue.relatedNotes.length > 0
      ? appState.contextCue.relatedNotes
      : ['ナレッジを追加すると関連メモがここに表示されます'];
  const recentSessions = [
    {
      title: '株式会社B 一次面談',
      date: '2026/06/18',
      summary: '要約・学びを確認',
    },
    {
      title: '研究室ミーティング',
      date: '2026/06/17',
      summary: '決定事項を整理',
    },
    {
      title: 'GD 練習',
      date: '2026/06/16',
      summary: '役割・発言バランスを確認',
    },
  ];
  const todaySchedule = [
    { time: '14:00', title: '株式会社A カジュアル面談' },
    { time: '16:00', title: '研究室ミーティング' },
    { time: '18:00', title: 'GD 練習（模擬）' },
  ];

  if (topOverlayWindow) {
    return (
      <main className="top-overlay-shell">
        <section className="top-overlay-card" data-tauri-drag-region>
          <header className="top-overlay-header">
            <div className="top-overlay-title">
              <span className="top-overlay-status-dot" />
              <span>AI Assistant</span>
            </div>
            <div className="top-overlay-listening">
              <div className="mini-listening-bars" aria-hidden="true">
                {listeningBarIds.slice(0, 6).map((barId) => (
                  <span key={barId} />
                ))}
              </div>
              <span>
                {appState.session.status === 'running'
                  ? 'Listening...'
                  : 'Standby'}
              </span>
            </div>
          </header>

          <div className="top-overlay-grid">
            <article className="overlay-panel blue compact">
              <p className="overlay-label">質問</p>
              <p className="overlay-body">{overlayTopic}</p>
            </article>
            <article className="overlay-panel violet compact">
              <p className="overlay-label">回答の要点</p>
              <ul>
                {flowPoints.slice(0, 4).map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
            <article className="overlay-panel gold compact">
              <p className="overlay-label">話す際のヒント</p>
              <ul>
                {nextTalkCandidates.slice(0, 3).map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
            <article className="overlay-panel green compact">
              <p className="overlay-label">想定追加質問</p>
              <ul>
                {confirmItems.slice(0, 3).map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          </div>
        </section>
      </main>
    );
  }

  if (sideOverlayWindow) {
    const latestTranscript = transcriptPreview.at(-1);

    return (
      <main className="side-overlay-shell">
        <section className="side-overlay-card" data-tauri-drag-region>
          <div className="dock-tabs">
            <button className="dock-tab active" type="button">
              文字起こし
            </button>
            <button className="dock-tab" type="button">
              要約
            </button>
          </div>

          <div className="dock-feed">
            {transcriptPreview.length === 0 ? (
              <>
                <p className="speaker-line">
                  <span className="speaker-name other">相手</span>
                  セッションを開始すると文字起こしがここに流れます。
                </p>
                <p className="speaker-line">
                  <span className="speaker-name you">あなた</span>
                  ローカルのナレッジを追加すると候補の精度が上がります。
                </p>
              </>
            ) : (
              transcriptPreview.map((chunk, index) => (
                <p className="speaker-line" key={chunk.id}>
                  <span
                    className={`speaker-name ${
                      index % 2 === 0 ? 'other' : 'you'
                    }`}
                  >
                    {index % 2 === 0 ? '相手' : 'あなた'}
                  </span>
                  {chunk.text}
                </p>
              ))
            )}
          </div>

          <div className="side-overlay-summary">
            <p className="side-overlay-note-label">要約メモ</p>
            <ul>
              {memoItems.slice(0, 2).map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>

          <div className="dock-footer">
            <span>
              {latestTranscript?.text
                ? 'AIが聞いています...'
                : 'AIが待機しています...'}
            </span>
            <div className="listening-bars" aria-hidden="true">
              {listeningBarIds.map((barId) => (
                <span key={barId} />
              ))}
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="workspace-shell">
      <section className="dashboard-grid">
        <aside className="sidebar-card">
          <div className="sidebar-brand">
            <div className="brand-badge">CO</div>
            <div>
              <strong>Context Overlay</strong>
              <p>Conversation Workspace</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item, index) => (
              <button
                className={`nav-item ${index === 0 ? 'active' : ''}`}
                key={item}
                type="button"
              >
                {item}
              </button>
            ))}
          </nav>

          <div className="sidebar-user">
            <div className="user-avatar" />
            <div>
              <strong>User</strong>
              <p>Premium Plan</p>
            </div>
          </div>
        </aside>

        <div className="dashboard-main">
          <article className="call-showcase dashboard-showcase">
            <div className="preview-header">
              <div>
                <p className="preview-kicker">Overlay Preview</p>
                <h2>会話オーバーレイ</h2>
              </div>
              <p className="preview-copy">別ウィンドウとして常駐する想定</p>
            </div>
            <div className="meeting-shell">
              <div className="meeting-toolbar">
                <span className="record-pill">
                  <span className="record-dot" />
                  {appState.session.status === 'running' ? '録音中' : '待機中'}
                </span>
                <div className="toolbar-icons">
                  <span />
                  <span />
                  <span />
                  <span />
                </div>
              </div>

              <div className="overlay-strip">
                <article className="overlay-panel blue">
                  <p className="overlay-label">現在の話題</p>
                  <p className="overlay-body">{overlayTopic}</p>
                </article>
                <article className="overlay-panel green">
                  <p className="overlay-label">要点（話の流れ）</p>
                  <ul>
                    {flowPoints.slice(0, 4).map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </article>
                <article className="overlay-panel gold">
                  <p className="overlay-label">次に話す候補</p>
                  <ul>
                    {nextTalkCandidates.slice(0, 3).map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </article>
                <article className="overlay-panel orange">
                  <p className="overlay-label">確認したいこと</p>
                  <ul>
                    {confirmItems.slice(0, 3).map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </article>
                <article className="overlay-panel sand">
                  <p className="overlay-label">メモ</p>
                  <ul>
                    {memoItems.slice(0, 2).map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </article>
              </div>

              <div className="meeting-stage">
                <div className="avatar-backdrop" />
                <div className="avatar-card">
                  <div className="avatar-head" />
                  <div className="avatar-body" />
                </div>

                <aside className="transcript-dock">
                  <div className="dock-tabs">
                    <button className="dock-tab active" type="button">
                      文字起こし
                    </button>
                    <button className="dock-tab" type="button">
                      要約
                    </button>
                  </div>

                  <div className="dock-feed">
                    {transcriptPreview.length === 0 ? (
                      <>
                        <p className="speaker-line">
                          <span className="speaker-name other">相手</span>
                          セッションを開始すると文字起こしがここに流れます。
                        </p>
                        <p className="speaker-line">
                          <span className="speaker-name you">あなた</span>
                          個人ナレッジを追加すると会話候補の精度が上がります。
                        </p>
                      </>
                    ) : (
                      transcriptPreview.map((chunk, index) => (
                        <p className="speaker-line" key={chunk.id}>
                          <span
                            className={`speaker-name ${
                              index % 2 === 0 ? 'other' : 'you'
                            }`}
                          >
                            {index % 2 === 0 ? '相手' : 'あなた'}
                          </span>
                          {chunk.text}
                        </p>
                      ))
                    )}
                  </div>

                  <div className="dock-footer">
                    <span>AI が静かに支援しています…</span>
                    <div className="listening-bars" aria-hidden="true">
                      {listeningBarIds.map((barId) => (
                        <span key={barId} />
                      ))}
                    </div>
                  </div>
                </aside>

                <div className="overlay-visibility-pills">
                  <span className={topOverlayVisible ? 'visible' : 'hidden'}>
                    上部: {topOverlayVisible ? '表示中' : '非表示'}
                  </span>
                  <span className={sideOverlayVisible ? 'visible' : 'hidden'}>
                    右側: {sideOverlayVisible ? '表示中' : '非表示'}
                  </span>
                </div>

                <div className="meeting-footer">
                  <div className="meeting-meta">
                    <span>14:35</span>
                    <span>Meeting ID: abc-defg-hij</span>
                  </div>

                  <div className="meeting-controls">
                    <button className="control-button" type="button" />
                    <button className="control-button" type="button" />
                    <button className="control-button primary" type="button" />
                    <button className="control-button danger" type="button" />
                  </div>
                </div>
              </div>
            </div>
          </article>

          <div className="card-grid top-grid">
            <article className="info-card">
              <div className="card-head">
                <h3>今日の予定</h3>
                <span className={`status-chip ${preparedness}`}>
                  {preparedness}
                </span>
              </div>
              <ul className="agenda-list">
                {todaySchedule.map((item) => (
                  <li key={`${item.time}-${item.title}`}>
                    <strong>{item.time}</strong>
                    <span>{item.title}</span>
                  </li>
                ))}
              </ul>
              <div className="recommend-box">
                <h4>AIからのおすすめ</h4>
                <ul>
                  <li>{nextSessionTitle} の事前ブリーフを作成する</li>
                  <li>前回メモを振り返り、確認事項を整理する</li>
                  <li>自己紹介や要点メモを軽く見直す</li>
                </ul>
              </div>
            </article>

            <article className="info-card">
              <div className="card-head">
                <h3>最近のセッション</h3>
                <button className="text-link" type="button">
                  すべて見る
                </button>
              </div>
              <ul className="session-list">
                {recentSessions.map((session) => (
                  <li key={session.title}>
                    <div className="session-avatar" />
                    <div>
                      <strong>{session.title}</strong>
                      <p>{session.summary}</p>
                    </div>
                    <span>{session.date}</span>
                  </li>
                ))}
              </ul>
            </article>

            <article className="info-card">
              <div className="card-head">
                <h3>準備アクション</h3>
              </div>
              <ul className="action-list">
                {actionItems.map((item) => (
                  <li key={item.title}>
                    <div className="action-icon" />
                    <div>
                      <strong>{item.title}</strong>
                      <p>{item.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </article>

            <article className="info-card">
              <div className="card-head">
                <h3>ナレッジサマリー</h3>
                <span className="soft-chip">
                  {appState.importedDocuments.length}件のナレッジ
                </span>
              </div>

              <div className="knowledge-tags">
                {[
                  '自己分析',
                  '経験・エピソード',
                  'スキル・強み',
                  '研究・プロジェクト',
                  '過去の発言履歴',
                  'NG表現リスト',
                ].map((tag) => (
                  <span className="knowledge-tag" key={tag}>
                    {tag}
                  </span>
                ))}
              </div>

              <input
                accept=".md,.txt,text/plain,text/markdown"
                data-testid="profile-file-input"
                multiple
                onChange={async (event) => {
                  const files = Array.from(event.target.files ?? []);
                  const importableFiles = files.filter(
                    isImportableKnowledgeFile,
                  );
                  const oversizedFiles = importableFiles.filter(
                    (file) => file.size > MAX_IMPORT_FILE_SIZE,
                  );

                  if (files.length === 0) {
                    return;
                  }

                  if (importableFiles.length === 0) {
                    setKnowledgeImportNotice(
                      '.md または .txt ファイルを選択してください。',
                    );
                    event.target.value = '';
                    return;
                  }

                  if (oversizedFiles.length > 0) {
                    setKnowledgeImportNotice(
                      '1ファイル 512KB 以内で追加してください。',
                    );
                    event.target.value = '';
                    return;
                  }

                  const documents = await Promise.all(
                    importableFiles.map(async (file) => ({
                      title: stripExtension(file.name),
                      content: await readFileText(file),
                    })),
                  );

                  try {
                    const previousCount = appState.importedDocuments.length;
                    const state = await invokeCommand(
                      'import_profile_documents_from_files',
                      {
                        documents,
                      },
                    );
                    setAppState(state);
                    setKnowledgeImportNotice(
                      `${state.importedDocuments.length - previousCount}件のファイルを追加しました。`,
                    );
                  } catch {
                    setKnowledgeImportNotice(
                      'ファイルの読込に失敗しました。もう一度お試しください。',
                    );
                  }
                  event.target.value = '';
                }}
                ref={fileInputRef}
                style={{ display: 'none' }}
                type="file"
              />

              <div className="knowledge-actions">
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  type="button"
                >
                  ナレッジを追加
                </button>
                <button
                  className="secondary-button"
                  onClick={async () => {
                    const state = await invokeCommand(
                      'import_profile_documents',
                    );
                    setAppState(state);
                    setKnowledgeImportNotice(
                      'サンプル個人ナレッジを読み込みました。',
                    );
                  }}
                  type="button"
                >
                  サンプル個人ナレッジを追加
                </button>
              </div>

              <p className="helper-text">
                {knowledgeImportNotice ||
                  'ローカルの .md / .txt を追加すると会話中の想起支援に使われます。'}
              </p>
              <p className="helper-text">
                追加済みファイル数: {appState.importedDocuments.length}
              </p>

              <ul className="document-list">
                {appState.importedDocuments.length === 0 ? (
                  <li>まだ追加された個人ナレッジはありません。</li>
                ) : (
                  appState.importedDocuments.map((document) => (
                    <li key={document.id}>
                      <span>
                        {document.title} ({document.sourceType})
                      </span>
                      <button
                        className="text-link"
                        onClick={async () => {
                          const state = await invokeCommand(
                            'remove_profile_document',
                            {
                              documentId: document.id,
                            },
                          );
                          setAppState(state);
                        }}
                        type="button"
                      >
                        削除
                      </button>
                    </li>
                  ))
                )}
              </ul>
            </article>
          </div>

          <div className="card-grid middle-grid">
            <article className="info-card consent-card">
              <div className="card-head">
                <h3>オーバーレイ制御</h3>
                <span className="soft-chip">
                  {formatStatus(appState.session.status)}
                </span>
              </div>

              <div className="control-summary">
                <p>
                  LLM:{' '}
                  {appState.connections.ollamaReady ? '接続済み' : '未接続'}
                </p>
                <p>
                  STT: {appState.connections.sttReady ? '接続済み' : '未接続'}
                </p>
                <p>推論モード: {formatMode(appState.adaptiveInference.mode)}</p>
                <p>
                  質問スコア:{' '}
                  {appState.adaptiveInference.questionScore.toFixed(2)}
                </p>
              </div>

              <label className="checkbox-row">
                <input
                  checked={consent.participantConsent}
                  onChange={(event) =>
                    setConsentField('participantConsent', event.target.checked)
                  }
                  type="checkbox"
                />
                参加者全員が文字起こしと AI 補助の利用に同意しています。
              </label>
              <label className="checkbox-row">
                <input
                  checked={consent.noCovertUse}
                  onChange={(event) =>
                    setConsentField('noCovertUse', event.target.checked)
                  }
                  type="checkbox"
                />
                このツールを隠れた補助や回答代行のためには使用しません。
              </label>
              <label className="checkbox-row">
                <input
                  checked={consent.shareSafeUnderstood}
                  onChange={(event) =>
                    setConsentField('shareSafeUnderstood', event.target.checked)
                  }
                  type="checkbox"
                />
                Share Safe Mode がステルス用途ではないことを理解しています。
              </label>

              <div className="knowledge-actions">
                <button
                  className={topOverlayVisible ? '' : 'secondary-button'}
                  onClick={async () => {
                    const nextVisible = !topOverlayVisible;
                    await setOverlayVisibility('top', nextVisible);
                    setTopOverlayVisible(nextVisible);
                  }}
                  type="button"
                >
                  {topOverlayVisible
                    ? '上部オーバーレイを隠す'
                    : '上部オーバーレイを表示'}
                </button>
                <button
                  className={sideOverlayVisible ? '' : 'secondary-button'}
                  onClick={async () => {
                    const nextVisible = !sideOverlayVisible;
                    await setOverlayVisibility('side', nextVisible);
                    setSideOverlayVisible(nextVisible);
                  }}
                  type="button"
                >
                  {sideOverlayVisible
                    ? '右オーバーレイを隠す'
                    : '右オーバーレイを表示'}
                </button>
                <button
                  disabled={!canStart}
                  onClick={async () => {
                    startSessionLocally();
                    const state = await invokeCommand('start_session', {
                      consent,
                    });
                    setAppState(state);
                  }}
                  type="button"
                >
                  セッション開始
                </button>
                <button
                  className="secondary-button"
                  disabled={appState.session.status !== 'running'}
                  onClick={async () => {
                    stopSessionLocally();
                    const state = await invokeCommand('stop_session');
                    setAppState(state);
                  }}
                  type="button"
                >
                  セッション停止
                </button>
                <button
                  className="ghost-button"
                  onClick={async () => {
                    const state = await invokeCommand('toggle_share_safe_mode');
                    setAppState(state);
                  }}
                  type="button"
                >
                  Share Safe Mode 切り替え
                </button>
                <button
                  className="ghost-button"
                  disabled={appState.importedDocuments.length === 0}
                  onClick={async () => {
                    const state = await invokeCommand(
                      'clear_profile_documents',
                    );
                    setAppState(state);
                    setKnowledgeImportNotice(
                      '追加済みの個人ナレッジを削除しました。',
                    );
                  }}
                  type="button"
                >
                  すべて削除
                </button>
              </div>
            </article>

            <article className="info-card">
              <div className="card-head">
                <h3>オーバーレイの特徴</h3>
              </div>
              <ul className="feature-list">
                <li>相手に見えにくい位置に表示</li>
                <li>リアルタイム文字起こしと要約</li>
                <li>あなたの情報と文脈を照合</li>
                <li>次に話すことを優しく提案</li>
                <li>プライバシーに配慮したローカル実行</li>
              </ul>
              <div className="safety-box">
                <strong>安心・安全の設計</strong>
                <ul>
                  <li>録音・文字起こしは同意前提</li>
                  <li>データは明示した範囲で保持</li>
                  <li>いつでも削除・再編集が可能</li>
                </ul>
              </div>
            </article>
          </div>

          <article className="usecase-card">
            <div className="card-head">
              <h3>ユースケース例</h3>
            </div>
            <div className="usecase-grid">
              {useCases.map((item) => (
                <section className="usecase-item" key={item.title}>
                  <h4>{item.title}</h4>
                  <p>{item.description}</p>
                </section>
              ))}
            </div>
          </article>
        </div>
      </section>
    </main>
  );
}
