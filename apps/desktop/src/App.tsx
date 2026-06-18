import { type ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useAppStore } from '@/lib/state/app-store';
import { invokeCommand, setOverlayVisibility } from '@/lib/tauri/commands';
import { attachAppEvents } from '@/lib/tauri/events';

const MAX_IMPORT_FILE_SIZE = 512 * 1024;

const sidebarItems = [
  { id: 'home', label: 'Home' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'people', label: 'People' },
  { id: 'projects', label: 'Projects / Companies' },
  { id: 'knowledge', label: 'My Knowledge' },
  { id: 'templates', label: 'Templates' },
  { id: 'review', label: 'Review' },
  { id: 'settings', label: 'Overlay Settings' },
] as const;

type PageId = (typeof sidebarItems)[number]['id'];

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

const todaySchedule = [
  {
    time: '14:00',
    title: '株式会社A カジュアル面談',
    badge: '30分後',
    meta: 'Google Meet 60分',
  },
  {
    time: '16:00',
    title: '研究室ミーティング',
    badge: '予定',
    meta: '研究室 / 302会議室',
  },
  {
    time: '18:00',
    title: 'GD練習（模擬）',
    badge: '予定',
    meta: '就活仲間 / オンライン',
  },
];

const readinessItems = [
  ['事前ブリーフ', '完了'],
  ['想定質問', '12件'],
  ['紹介カードを整理', '進行中'],
  ['確認したいこと', '5件'],
];

const recentSessions = [
  ['株式会社B 一次面談', '2024/05/20'],
  ['研究室ミーティング', '2024/05/17'],
  ['GD練習（模擬）', '2024/05/16'],
];

const sessionTable = [
  [
    '株式会社A カジュアル面談',
    '面談',
    '今日 14:00',
    '田中さん / Google Meet',
    '準備中',
  ],
  ['研究室ミーティング', '会議', '今日 16:00', '研究室 / 302会議室', '予定'],
  ['GD練習（模擬）', 'GD', '今日 18:00', '就活仲間 / オンライン', '予定'],
  ['株式会社B 一次面談', '面接', '2024/05/20', '人事部 / Zoom', '完了'],
  ['先輩との1on1', '1on1', '2024/05/18', '高橋さん / カフェ', '完了'],
  ['株式会社C 最終面接', '面接', '2024/05/15', '役員 / Google Meet', '完了'],
];

const peopleList = [
  ['田中 一郎', '株式会社A 人事部'],
  ['佐伯 花子', '面談担当 / エンジニア'],
  ['山本 健太', '研究室 先輩'],
  ['鈴木 葵', '就活エージェント'],
  ['高橋 太郎', '株式会社C 役員'],
];

const projectCards = [
  ['株式会社A', '選考 / 面談前', '60%'],
  ['株式会社B', '選考 / 二次面接完了', '40%'],
  ['新規機能提案プロジェクト', '進行中', '70%'],
  ['研究室プロジェクト', '進行中', '50%'],
];

const templateCards = [
  [
    '面談準備ブリーフ',
    '相手や企業情報をもとに、事前に知っておくべき情報を整理します。',
  ],
  ['想定質問生成', 'セッションのタイプに応じた想定質問を自動生成します。'],
  ['自己紹介（30秒）', '自己紹介の軸をもとに、30秒の自己紹介を作成します。'],
  ['逆質問リスト', '面談後半でも使える逆質問をシーン別に整理します。'],
  ['面接振り返りシート', '面談後の振り返りを構造化して記録・再利用します。'],
  ['会話アジェンダ作成', '面談前に目的をもとに、アジェンダを簡易作成します。'],
];

const reviewCards = [
  {
    title: '株式会社B 一次面談',
    date: '2024/05/20 14:00-14:45',
    left: [
      '学生時代に力を入れたことは？',
      'チームでの役割は？',
      'なぜその施策を選んだのですか？',
    ],
    right: ['具体例を交えて話せた', '月間PV改善の話題で反応がよかった'],
  },
  {
    title: '研究室ミーティング',
    date: '2024/05/17',
    left: ['自分の担当方針', '詰まりの原因', '次回までのTODO'],
    right: ['前回よりも論点が明確', '次に確認すべきことを整理できた'],
  },
];

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

function getPageTitle(page: PageId) {
  switch (page) {
    case 'home':
      return 'おはようございます、User さん';
    case 'sessions':
      return 'Sessions';
    case 'people':
      return 'People';
    case 'projects':
      return 'Projects / Companies';
    case 'knowledge':
      return 'My Knowledge';
    case 'templates':
      return 'Templates';
    case 'review':
      return 'Review';
    case 'settings':
      return 'Overlay Settings';
  }
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
  const [activePage, setActivePage] = useState<PageId>('home');

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
  const overlayTopic =
    appState.contextCue.topic === 'まだ会話は始まっていません'
      ? 'ガクチカについて詳しく教えてください'
      : appState.contextCue.topic;
  const flowPoints = [
    appState.contextCue.intent,
    ...appState.rollingSummary.importantPoints,
  ].filter((value, index, array) => value && array.indexOf(value) === index);
  const nextTalkCandidates =
    appState.contextCue.suggestedPoints.length > 0
      ? appState.contextCue.suggestedPoints
      : [
          '結論から話す（PREP法）',
          '数字を入れて具体的に話す',
          '再現性や学びを最後に伝える',
        ];
  const confirmItems =
    appState.contextCue.questionsToAsk.length > 0
      ? appState.contextCue.questionsToAsk
      : [
          'なぜその施策を選んだのか？',
          'チーム内での役割は？',
          '大変だったことは？',
        ];
  const memoItems =
    appState.contextCue.relatedNotes.length > 0
      ? appState.contextCue.relatedNotes
      : ['数字を入れる', '誇張NG'];

  const knowledgeTags = useMemo(
    () => [
      '自己分析',
      '経験・エピソード',
      'スキル・強み',
      '研究・プロジェクト',
      '過去の発言履歴',
      'NG表現リスト',
    ],
    [],
  );

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
                  : 'Listening...'}
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
                  学生時代に力を入れたことについて教えてください。
                </p>
                <p className="speaker-line">
                  <span className="speaker-name you">あなた</span>
                  はい、大学時代にUSJでのアルバイトに力を入れました。
                </p>
                <p className="speaker-line">
                  <span className="speaker-name other">相手</span>
                  なるほど、具体的にどのような課題があったのですか？
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
                : 'AIが静かに支援しています...'}
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

  async function importLocalFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    const importableFiles = files.filter(isImportableKnowledgeFile);
    const oversizedFiles = importableFiles.filter(
      (file) => file.size > MAX_IMPORT_FILE_SIZE,
    );

    if (files.length === 0) {
      return;
    }

    if (importableFiles.length === 0) {
      setKnowledgeImportNotice('.md または .txt ファイルを選択してください。');
      event.target.value = '';
      return;
    }

    if (oversizedFiles.length > 0) {
      setKnowledgeImportNotice('1ファイル 512KB 以内で追加してください。');
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
      const state = await invokeCommand('import_profile_documents_from_files', {
        documents,
      });
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
  }

  function renderSidebar() {
    return (
      <aside className="sidebar-card">
        <div className="sidebar-brand">
          <div className="brand-badge">CO</div>
          <div>
            <strong>Context Overlay</strong>
            <p>Local-first OSS</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sidebarItems.map((item) => (
            <button
              className={`nav-item ${activePage === item.id ? 'active' : ''}`}
              key={item.id}
              onClick={() => setActivePage(item.id)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="sidebar-user">
          <div className="user-avatar" />
          <div>
            <strong>User</strong>
            <p>Open Source Edition</p>
          </div>
        </div>
      </aside>
    );
  }

  function renderOverlayPreview() {
    return (
      <article className="preview-surface">
        <div className="preview-topline">
          <p className="page-section-title">セッション詳細</p>
          <span className="mini-badge">
            {appState.session.status === 'running' ? '録音中' : '待機中'}
          </span>
        </div>
        <div className="meeting-shell">
          <div className="overlay-strip">
            <article className="overlay-panel blue">
              <p className="overlay-label">質問</p>
              <p className="overlay-body">{overlayTopic}</p>
            </article>
            <article className="overlay-panel violet">
              <p className="overlay-label">回答の要点</p>
              <ul>
                {flowPoints.slice(0, 4).map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
            <article className="overlay-panel gold">
              <p className="overlay-label">話す際のヒント</p>
              <ul>
                {nextTalkCandidates.slice(0, 3).map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
            <article className="overlay-panel green">
              <p className="overlay-label">想定追加質問</p>
              <ul>
                {confirmItems.slice(0, 3).map((point) => (
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
                <p className="speaker-line">
                  <span className="speaker-name other">相手</span>
                  学生時代に力を入れたことについて教えてください。
                </p>
                <p className="speaker-line">
                  <span className="speaker-name you">あなた</span>
                  はい、大学時代にUSJでのアルバイトに力を入れました。
                </p>
                <p className="speaker-line">
                  <span className="speaker-name other">相手</span>
                  なるほど、具体的にどのような課題があったのですか？
                </p>
              </div>

              <div className="dock-footer">
                <span>AIが聞いています...</span>
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
    );
  }

  function renderHomePage() {
    return (
      <div className="page-layout">
        <div className="page-grid home-grid">
          <article className="soft-card hero-card">
            <div className="hero-title-row">
              <div>
                <p className="page-section-title">次のセッション</p>
                <h2>株式会社A カジュアル面談</h2>
              </div>
              <span className="blue-badge">30分後</span>
            </div>
            <div className="next-session-panel">
              <div className="next-session-time">14:00</div>
              <div>
                <strong>Google Meet</strong>
                <p>60分 / 相手: 田中さん</p>
              </div>
            </div>
          </article>

          <article className="soft-card compact-card">
            <div className="section-head">
              <p className="page-section-title">準備状況</p>
              <span className="mini-badge">{preparedness}</span>
            </div>
            <ul className="simple-check-list">
              {readinessItems.map(([label, meta]) => (
                <li key={label}>
                  <span>{label}</span>
                  <strong>{meta}</strong>
                </li>
              ))}
            </ul>
          </article>

          <article className="soft-card compact-card">
            <p className="page-section-title">今日の予定</p>
            <ul className="agenda-list">
              {todaySchedule.slice(1).map((item) => (
                <li key={item.title}>
                  <strong>{item.time}</strong>
                  <span>{item.title}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="soft-card compact-card">
            <p className="page-section-title">AIからのおすすめ</p>
            <ul className="recommend-list">
              <li>面談の企業情報を整理しました</li>
              <li>次回の質問候補を6件用意しました</li>
              <li>あなたの強みを数字つきで話せるよう整えます</li>
            </ul>
          </article>

          <article className="soft-card span-2">
            <div className="section-head">
              <h3>最近のセッション</h3>
              <button className="text-link" type="button">
                すべて見る
              </button>
            </div>
            <div className="recent-row">
              {recentSessions.map(([title, date]) => (
                <div className="recent-session-chip" key={title}>
                  <span className="mini-icon" />
                  <strong>{title}</strong>
                  <span>{date}</span>
                </div>
              ))}
            </div>
          </article>
        </div>
      </div>
    );
  }

  function renderSessionsPage() {
    return (
      <div className="page-layout">
        <div className="toolbar-row">
          <div className="tab-row">
            {[
              'すべて',
              '面接',
              '面談',
              '会議',
              'GD',
              '1on1',
              '授業',
              'その他',
            ].map((tab, index) => (
              <button
                className={`toolbar-tab ${index === 0 ? 'active' : ''}`}
                key={tab}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="toolbar-actions">
            <input className="search-input" placeholder="検索" type="text" />
            <button className="primary-button" type="button">
              ＋ 新しいセッション
            </button>
          </div>
        </div>

        <article className="soft-card page-table-card">
          <div className="table-head table-five">
            <span>タイトル</span>
            <span>タイプ</span>
            <span>日時</span>
            <span>相手 / 場所</span>
            <span>ステータス</span>
          </div>
          {sessionTable.map((row) => (
            <div className="table-row table-five" key={row[0]}>
              <strong>{row[0]}</strong>
              <span>{row[1]}</span>
              <span>{row[2]}</span>
              <span>{row[3]}</span>
              <span className="status-bubble">{row[4]}</span>
            </div>
          ))}
        </article>
      </div>
    );
  }

  function renderPeoplePage() {
    return (
      <div className="page-layout">
        <div className="toolbar-row">
          <div className="tab-row">
            {[
              'すべて',
              '面談官・採用担当',
              '社員・先輩',
              'メンバー・同僚',
              'その他',
            ].map((tab, index) => (
              <button
                className={`toolbar-tab ${index === 0 ? 'active' : ''}`}
                key={tab}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
          <input className="search-input" placeholder="検索" type="text" />
        </div>

        <div className="split-grid">
          <article className="soft-card">
            <ul className="people-list">
              {peopleList.map(([name, role], index) => (
                <li className={index === 0 ? 'active' : ''} key={name}>
                  <div className="person-avatar" />
                  <div>
                    <strong>{name}</strong>
                    <p>{role}</p>
                  </div>
                </li>
              ))}
            </ul>
          </article>

          <article className="soft-card">
            <div className="detail-header">
              <h3>田中 一郎</h3>
              <p>株式会社A 人事部 採用担当</p>
            </div>
            <div className="detail-block">
              <h4>メモ</h4>
              <ul className="bullet-text">
                <li>自己紹介の入りを丁寧に聞く</li>
                <li>学生時代の成果の再現性を重視</li>
                <li>チームでの役割や学びを重視</li>
              </ul>
            </div>
            <div className="detail-block">
              <h4>過去のセッション</h4>
              <div className="mini-history-card">
                <span>株式会社A カジュアル面談</span>
                <strong>2024/05/12</strong>
              </div>
              <div className="mini-history-card">
                <span>会社説明会</span>
                <strong>2024/04/20</strong>
              </div>
            </div>
          </article>
        </div>
      </div>
    );
  }

  function renderProjectsPage() {
    return (
      <div className="page-layout">
        <div className="toolbar-row">
          <div className="tab-row">
            {['すべて', '企業', 'プロジェクト', '課題'].map((tab, index) => (
              <button
                className={`toolbar-tab ${index === 0 ? 'active' : ''}`}
                key={tab}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="toolbar-actions">
            <input className="search-input" placeholder="検索" type="text" />
            <div className="icon-pair">
              <span />
              <span />
            </div>
          </div>
        </div>

        <div className="split-grid">
          <article className="soft-card">
            {projectCards.map(([title, meta, progress]) => (
              <div className="project-line" key={title}>
                <div>
                  <strong>{title}</strong>
                  <p>{meta}</p>
                </div>
                <div className="progress-box">
                  <span>{progress}</span>
                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{ width: progress }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </article>

          <article className="soft-card">
            <div className="detail-header">
              <h3>株式会社A</h3>
              <p>面談前 / SaaS / 都内勤務 / SOあり検討</p>
            </div>
            <div className="detail-block">
              <h4>メモ</h4>
              <ul className="bullet-text">
                <li>若手の裁量が強い</li>
                <li>新規事業に積極的</li>
                <li>新卒の1on1面談があると確認</li>
              </ul>
            </div>
            <div className="detail-block">
              <h4>自分との接点</h4>
              <ul className="bullet-text">
                <li>USJでの接客経験が活かせそう</li>
                <li>チームでの仮説検証を評価してくれそう</li>
              </ul>
            </div>
          </article>
        </div>
      </div>
    );
  }

  function renderKnowledgePage() {
    return (
      <div className="page-layout">
        <div className="toolbar-row">
          <div className="toolbar-actions">
            <button className="primary-button" type="button">
              ＋ 新しい項目
            </button>
            <input className="search-input" placeholder="検索" type="text" />
            <div className="icon-pair">
              <span />
              <span />
            </div>
          </div>
        </div>

        <div className="split-grid knowledge-grid">
          <article className="soft-card">
            <div className="table-head table-four">
              <span>項目</span>
              <span>タグ</span>
              <span>更新</span>
              <span />
            </div>

            {[
              ['自己分析まとめ', '自己分析', '2024/05/10'],
              ['USJでの改善経験', '経験・エピソード', '2024/05/08'],
              ['研究での仮説検証経験', '経験・エピソード', '2024/05/06'],
              ['チーム開発での役割', '経験・エピソード', '2024/05/07'],
              ['強み・弱み', 'スキル・強み', '2024/05/05'],
              ['ポートフォリオURL', '制作物', '2024/05/04'],
            ].map((item) => (
              <div className="table-row table-four" key={item[0]}>
                <strong>{item[0]}</strong>
                <span className="tag-bubble">{item[1]}</span>
                <span>{item[2]}</span>
                <button className="text-link" type="button">
                  編集
                </button>
              </div>
            ))}

            <input
              accept=".md,.txt,text/plain,text/markdown"
              data-testid="profile-file-input"
              multiple
              onChange={importLocalFiles}
              ref={fileInputRef}
              style={{ display: 'none' }}
              type="file"
            />

            <div className="knowledge-actions">
              <button
                onClick={() => fileInputRef.current?.click()}
                type="button"
              >
                ナレッジを追加
              </button>
              <button
                className="secondary-button"
                onClick={async () => {
                  const state = await invokeCommand('import_profile_documents');
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
                          { documentId: document.id },
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

          <article className="soft-card">
            <div className="detail-header">
              <h3>USJでの改善経験</h3>
              <p>概要</p>
            </div>
            <div className="detail-block">
              <ul className="bullet-text">
                <li>アルバイトリーダーとして、待ち時間の見える化を提案</li>
                <li>課題設定と仮説検証を繰り返し、満足度向上を実現</li>
                <li>面談では再現性・数値・周囲との連携まで話せるよう整理</li>
              </ul>
            </div>
            <div className="knowledge-tags">
              {knowledgeTags.map((tag) => (
                <span className="knowledge-tag" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </article>
        </div>
      </div>
    );
  }

  function renderTemplatesPage() {
    return (
      <div className="page-layout">
        <div className="toolbar-row">
          <div className="tab-row">
            {[
              'すべて',
              '事前準備',
              '想定質問',
              '振り返り',
              '面談メモ',
              'その他',
            ].map((tab, index) => (
              <button
                className={`toolbar-tab ${index === 0 ? 'active' : ''}`}
                key={tab}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
          <button className="primary-button" type="button">
            ＋ 新しいテンプレート
          </button>
        </div>
        <div className="template-grid">
          {templateCards.map(([title, description]) => (
            <article className="soft-card template-card" key={title}>
              <div className="template-icon" />
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </div>
    );
  }

  function renderReviewPage() {
    return (
      <div className="page-layout">
        <div className="toolbar-row">
          <div className="tab-row">
            {['すべて', '面談', '面接', '会議', 'GD', '1on1', 'その他'].map(
              (tab, index) => (
                <button
                  className={`toolbar-tab ${index === 0 ? 'active' : ''}`}
                  key={tab}
                  type="button"
                >
                  {tab}
                </button>
              ),
            )}
          </div>
          <div className="toolbar-actions">
            <input className="search-input" placeholder="検索" type="text" />
            <div className="icon-pair">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>

        <div className="review-grid">
          {reviewCards.map((card) => (
            <article className="soft-card review-card" key={card.title}>
              <div className="review-title-row">
                <div>
                  <h3>{card.title}</h3>
                  <p>{card.date}</p>
                </div>
                <div className="review-actions">
                  <button className="text-link" type="button">
                    編集
                  </button>
                  <button className="text-link" type="button">
                    共有
                  </button>
                </div>
              </div>
              <div className="review-columns">
                <div>
                  <h4>聞かれたこと</h4>
                  <ul className="bullet-text">
                    {card.left.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4>良かった点</h4>
                  <ul className="bullet-text">
                    {card.right.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    );
  }

  function renderSettingsPage() {
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
                  const state = await invokeCommand('clear_profile_documents');
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

  function renderCurrentPage() {
    switch (activePage) {
      case 'home':
        return renderHomePage();
      case 'sessions':
        return renderSessionsPage();
      case 'people':
        return renderPeoplePage();
      case 'projects':
        return renderProjectsPage();
      case 'knowledge':
        return renderKnowledgePage();
      case 'templates':
        return renderTemplatesPage();
      case 'review':
        return renderReviewPage();
      case 'settings':
        return renderSettingsPage();
    }
  }

  return (
    <main className="workspace-shell">
      <section className="dashboard-grid">
        {renderSidebar()}

        <div className="dashboard-main">
          <header className="page-header">
            <div>
              <h1>{getPageTitle(activePage)}</h1>
              <p>
                {activePage === 'home'
                  ? '会話の準備から振り返りまで、ひとつのワークスペースで管理します。'
                  : '画像の構成に合わせて、一覧と詳細を見やすく整理しています。'}
              </p>
            </div>
          </header>

          {activePage === 'home' ? renderHomePage() : renderCurrentPage()}

          {activePage === 'sessions' && renderOverlayPreview()}
        </div>
      </section>
    </main>
  );
}
