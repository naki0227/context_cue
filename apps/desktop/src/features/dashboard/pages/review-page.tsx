import { useMemo, useState } from 'react';
import { reviewCards } from '@/features/dashboard/lib/content';
import { useWorkspaceStore } from '@/lib/state/workspace-store';

const tabs = [
  'すべて',
  '面談',
  '面接',
  '会議',
  'GD',
  '1on1',
  'その他',
] as const;
const innerTabs = [
  'サマリー',
  'トランスクリプト',
  'AI分析',
  'メモ',
  'アクション',
] as const;

const reviewDetails: Record<
  string,
  {
    actions: Array<[string, string, string]>;
    improvements: string[];
    insights: string[];
    memo: string[];
    summary: string[];
    transcript: string[];
  }
> = {
  '株式会社セールス・イノベーション': {
    summary: [
      '課題ヒアリングで相手の本質的なニーズを深掘りできた。',
      '自社サービスの価値を具体例を交えて分かりやすく伝えられた。',
      'クロージングに向けて自然な流れで次のステップを提案できた。',
    ],
    transcript: [
      '相手: 現場定着がうまく進まず、営業プロセスが属人化しています。',
      'あなた: 定着の阻害要因を運用面とツール面に分けて整理しましょう。',
      '相手: その切り分けは分かりやすいです。現場教育も課題です。',
    ],
    insights: [
      '現在、営業プロセスの属人化が課題になっている。',
      'SFAの導入は進めているが、現場定着に苦戦している。',
      '来期予算での投資検討を進めており、6月中の判断を目指している。',
    ],
    improvements: [
      '冒頭のアイスブレイクがやや長く、本題への導入に時間がかかった。',
      '競合比較の説明で、当社独自の強みの訴求が弱かった。',
      '相手の懸念点に対する具体的な解決策の提示が不足していた。',
    ],
    memo: [
      '現場定着の成功事例を次回用に必ず準備する。',
      'ROIシミュレーションを数値で示せる形にして持参する。',
    ],
    actions: [
      ['提案資料をカスタマイズして再送する', '田中 一郎', '2024/05/22'],
      ['事例集（同業界）の追加資料を作成する', '佐藤 花子', '2024/05/24'],
      ['次回ミーティングの日程調整を行う', '田中 一郎', '2024/05/24'],
    ],
  },
};

function fallbackReview(title: string) {
  return {
    summary: [`${title} の振り返りをここに整理していきます。`],
    transcript: ['まだ詳細なトランスクリプトはありません。'],
    insights: ['相手の背景・意図・次回の論点を記録する想定です。'],
    improvements: ['話し方や論点整理で改善したい点をここに残します。'],
    memo: ['次回までに準備したいことを追加してください。'],
    actions: [['次回準備メモを作る', 'User', '未設定']],
  };
}

export function ReviewPage() {
  const draftReviews = useWorkspaceStore((state) => state.draftReviews);
  const addReviewDraft = useWorkspaceStore((state) => state.addReviewDraft);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('すべて');
  const [query, setQuery] = useState('');
  const [selectedTitle, setSelectedTitle] = useState(
    reviewCards[0]?.title ?? '',
  );
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [detailTab, setDetailTab] =
    useState<(typeof innerTabs)[number]>('サマリー');

  const reviews = useMemo(
    () => [...draftReviews, ...reviewCards],
    [draftReviews],
  );

  const filteredReviews = reviews.filter((card) => {
    const matchesTab = activeTab === 'すべて' || card.type === activeTab;
    const normalizedQuery = query.trim().toLowerCase();
    const haystack = `${card.title} ${card.meta}`.toLowerCase();
    const matchesQuery =
      normalizedQuery.length === 0 || haystack.includes(normalizedQuery);

    return matchesTab && matchesQuery;
  });

  const featuredReview =
    filteredReviews.find((card) => card.title === selectedTitle) ??
    filteredReviews[0] ??
    reviews[0];
  const detail =
    reviewDetails[featuredReview.title] ?? fallbackReview(featuredReview.title);

  function addReview() {
    const nextReview = {
      title: `新しい振り返り ${draftReviews.length + 1}`,
      date: '今日',
      meta: '未設定 / 30分 / ローカル',
      type: 'その他',
    } as (typeof reviewCards)[number];

    addReviewDraft(nextReview);
    setSelectedTitle(nextReview.title);
  }

  return (
    <div className="page-layout review-page-v2">
      <div className="sessions-hero">
        <h1>Review</h1>
        <div className="toolbar-actions sessions-toolbar-actions">
          <div className="tab-row people-tab-row">
            {tabs.map((tab) => (
              <button
                className={`toolbar-tab sessions-tab ${activeTab === tab ? 'active' : ''}`}
                key={tab}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="search-shell projects-search-shell">
            <span className="search-shell-icon" />
            <input
              className="search-input search-input-v2"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="検索"
              type="text"
              value={query}
            />
          </div>
          <div className="view-switch">
            <button
              className={`view-switch-button ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              type="button"
            >
              ☰
            </button>
            <button
              className={`view-switch-button ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              type="button"
            >
              ▦
            </button>
          </div>
          <button
            className="primary-button primary-button-v2"
            onClick={addReview}
            type="button"
          >
            ＋ 新しい振り返り
          </button>
        </div>
      </div>

      <div className="split-grid review-grid-v2">
        <article className="soft-card review-list-card">
          <h3>過去のセッション</h3>
          <div className="review-list-stack">
            {filteredReviews.map((card) => (
              <button
                className={`review-list-item ${card.title === featuredReview.title ? 'active' : ''}`}
                key={card.title}
                onClick={() => setSelectedTitle(card.title)}
                type="button"
              >
                <strong>{card.title}</strong>
                <span className="session-pill tone-violet subtle-pill">
                  {card.type}
                </span>
                <p>{card.date}</p>
                <span>{card.meta}</span>
              </button>
            ))}
          </div>
          <button className="text-link people-more-link" type="button">
            すべて見る
          </button>
        </article>

        <article className="soft-card review-detail-card">
          <div className="review-detail-top">
            <div>
              <div className="project-title-row">
                <h2>{featuredReview.title}</h2>
                <span className="session-pill tone-violet">
                  {featuredReview.type}
                </span>
              </div>
              <p className="projects-role-text">{featuredReview.meta}</p>
              <p className="projects-role-text">60分 / Google Meet</p>
            </div>
            <div className="review-actions review-actions-v2">
              <button className="outline-button small" type="button">
                編集
              </button>
              <button className="primary-button share-button" type="button">
                共有
              </button>
            </div>
          </div>

          <div className="tab-row review-inner-tabs">
            {innerTabs.map((tab) => (
              <button
                className={`toolbar-tab sessions-tab ${detailTab === tab ? 'active' : ''}`}
                key={tab}
                onClick={() => setDetailTab(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="review-detail-grid">
            {detailTab === 'サマリー' ? (
              <>
                <section className="soft-card review-panel">
                  <h3>良かった点</h3>
                  <ul className="people-check-list">
                    {detail.summary.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
                <section className="soft-card review-panel">
                  <h3>重要な学び・気づき</h3>
                  <ul className="bullet-text">
                    {detail.insights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
                <section className="soft-card review-panel">
                  <h3>改善点</h3>
                  <ul className="bullet-text warning-list">
                    {detail.improvements.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </section>
                <section className="soft-card review-panel">
                  <h3>次回のアクション</h3>
                  <div className="projects-linked-list">
                    {detail.actions.map(([title, owner, date]) => (
                      <div
                        className="review-action-row"
                        key={`${title}-${date}`}
                      >
                        <span className="action-check" />
                        <strong>{title}</strong>
                        <span>{owner}</span>
                        <span>{date}</span>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            ) : null}

            {detailTab === 'トランスクリプト' ? (
              <section className="soft-card review-panel span-2">
                <h3>トランスクリプト</h3>
                <ul className="bullet-text">
                  {detail.transcript.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {detailTab === 'AI分析' ? (
              <section className="soft-card review-panel span-2">
                <h3>AI分析</h3>
                <ul className="bullet-text">
                  {detail.insights.concat(detail.improvements).map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {detailTab === 'メモ' ? (
              <section className="soft-card review-panel span-2">
                <h3>メモ</h3>
                <ul className="bullet-text">
                  {detail.memo.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </section>
            ) : null}

            {detailTab === 'アクション' ? (
              <section className="soft-card review-panel span-2">
                <h3>次回までのポイント</h3>
                <div className="projects-linked-list">
                  {detail.actions.map(([title, owner, date]) => (
                    <div className="review-action-row" key={`${title}-${date}`}>
                      <span className="action-check" />
                      <strong>{title}</strong>
                      <span>{owner}</span>
                      <span>{date}</span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null}
          </div>
        </article>
      </div>
    </div>
  );
}
