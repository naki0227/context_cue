import { useState } from 'react';
import { reviewCards } from '@/features/dashboard/lib/content';

export function ReviewPage() {
  const tabs = [
    'すべて',
    '面談',
    '面接',
    '会議',
    'GD',
    '1on1',
    'その他',
  ] as const;
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('すべて');
  const [query, setQuery] = useState('');
  const [selectedTitle, setSelectedTitle] = useState(
    reviewCards[0]?.title ?? '',
  );
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const filteredReviews = reviewCards.filter((card) => {
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
    reviewCards[0];

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
              placeholder="検索"
              onChange={(event) => setQuery(event.target.value)}
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
            {[
              'サマリー',
              'トランスクリプト',
              'AI分析',
              'メモ',
              'アクション',
            ].map((tab, index) => (
              <button
                className={`toolbar-tab sessions-tab ${index === 0 ? 'active' : ''}`}
                key={tab}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="review-detail-grid">
            <section className="soft-card review-panel">
              <h3>良かった点</h3>
              <ul className="people-check-list">
                <li>課題ヒアリングで相手の本質的なニーズを深掘りできた</li>
                <li>
                  自社サービスの価値を具体例を交えて分かりやすく伝えられた
                </li>
                <li>相手の反応を見ながら柔軟に説明の順序を調整できた</li>
                <li>
                  クロージングに向けて自然な流れで次のステップを提案できた
                </li>
              </ul>
            </section>

            <section className="soft-card review-panel">
              <h3>重要な学び・気づき</h3>
              <h4>相手の状況・背景</h4>
              <ul className="bullet-text">
                <li>現在、営業プロセスの属人化が課題になっている</li>
                <li>SFAの導入は進めているが、現場定着に苦戦している</li>
                <li>
                  来期予算での投資検討を進めており、6月中の判断を目指している
                </li>
              </ul>
              <h4>ニーズ・期待</h4>
              <ul className="bullet-text">
                <li>営業活動の可視化と、チーム全体の生産性向上を実現したい</li>
                <li>現場が使いやすく、定着しやすい仕組みを重視している</li>
                <li>導入後のサポート体制や伴走支援に期待している</li>
              </ul>
              <h4>懸念・不安点</h4>
              <ul className="bullet-text">
                <li>他システムとの連携やデータ移行の工数</li>
                <li>現場メンバーの抵抗感や運用定着のリスク</li>
                <li>投資対効果を経営層にどう説明するか</li>
              </ul>
            </section>

            <section className="soft-card review-panel">
              <h3>改善点</h3>
              <ul className="bullet-text warning-list">
                <li>
                  冒頭のアイスブレイクがやや長く、本題への導入に時間がかかった
                </li>
                <li>競合比較の説明で、当社独自の強みの訴求が弱かった</li>
                <li>相手の懸念点に対する具体的な解決策の提示が不足していた</li>
              </ul>
            </section>

            <section className="soft-card review-panel">
              <h3>次回のアクション</h3>
              <div className="projects-linked-list">
                {[
                  [
                    '提案資料をカスタマイズして再送する',
                    '田中 一郎',
                    '2024/05/22',
                  ],
                  [
                    '事例集（同業界）の追加資料を作成する',
                    '佐藤 花子',
                    '2024/05/24',
                  ],
                  [
                    '次回ミーティングの日程調整を行う',
                    '田中 一郎',
                    '2024/05/24',
                  ],
                ].map(([title, owner, date]) => (
                  <div className="review-action-row" key={`${title}-${date}`}>
                    <span className="action-check" />
                    <strong>{title}</strong>
                    <span>{owner}</span>
                    <span>{date}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="soft-card review-panel review-highlight-panel span-2">
              <h3>次回までのポイント</h3>
              <p className="people-summary-text">
                現場定着の成功事例を具体的に提示し、導入後のサポート体制をより詳細に説明する。
              </p>
              <p className="people-summary-text">
                ROIシミュレーションを用意し、投資対効果を数値で示す。
              </p>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
