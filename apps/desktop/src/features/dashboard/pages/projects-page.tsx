import { useState } from 'react';
import { projectCards } from '@/features/dashboard/lib/content';

export function ProjectsPage() {
  const tabs = ['すべて', '企業', 'プロジェクト', '課題'] as const;
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('すべて');
  const [query, setQuery] = useState('');
  const [selectedTitle, setSelectedTitle] = useState(
    projectCards[0]?.title ?? '',
  );
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const filteredProjects = projectCards.filter((project) => {
    const matchesTab =
      activeTab === 'すべて' ||
      project.category === activeTab ||
      (activeTab === '課題' && project.issues > 0);
    const normalizedQuery = query.trim().toLowerCase();
    const haystack = `${project.title} ${project.subtitle}`.toLowerCase();
    const matchesQuery =
      normalizedQuery.length === 0 || haystack.includes(normalizedQuery);

    return matchesTab && matchesQuery;
  });

  const featuredProject =
    filteredProjects.find((project) => project.title === selectedTitle) ??
    filteredProjects[0] ??
    projectCards[0];

  return (
    <div className="page-layout projects-page-v2">
      <div className="sessions-hero">
        <h1>Projects / Companies</h1>
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
              className={`view-switch-button ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              type="button"
            >
              ▦
            </button>
            <button
              className={`view-switch-button ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              type="button"
            >
              ☰
            </button>
          </div>
          <button className="primary-button primary-button-v2" type="button">
            ＋ 新しい企業 / プロジェクト
          </button>
        </div>
      </div>

      <div className="split-grid projects-grid-v2">
        <article className="soft-card projects-list-card">
          {filteredProjects.map((project) => (
            <button
              className={`project-line project-line-v2 ${project.title === featuredProject.title ? 'active' : ''}`}
              key={project.title}
              onClick={() => setSelectedTitle(project.title)}
              type="button"
            >
              <div className={`project-avatar icon-${project.icon}`} />
              <div className="project-main-copy">
                <div className="project-title-row">
                  <strong>{project.title}</strong>
                  <span className={`session-pill tone-${project.tone}`}>
                    {project.category}
                  </span>
                </div>
                <p>{project.subtitle}</p>
                <div className="project-meta-chips">
                  <span>関連セッション {project.sessions}</span>
                  <span>課題 {project.issues}</span>
                </div>
              </div>
              <div className="progress-box progress-box-v2">
                <span>{project.progress}</span>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{ width: project.progress }}
                  />
                </div>
                <p>最終更新: {project.updatedAt}</p>
              </div>
            </button>
          ))}
        </article>

        <article className="projects-detail-stack">
          <section className="soft-card projects-profile-card">
            <div className="projects-profile-top">
              <div className="project-avatar icon-company large" />
              <div className="projects-profile-copy">
                <div className="project-title-row">
                  <h2>{featuredProject.title}</h2>
                  <span className={`session-pill tone-${featuredProject.tone}`}>
                    {featuredProject.category}
                  </span>
                </div>
                <p className="projects-role-text">{featuredProject.subtitle}</p>
                <div className="project-meta-pills">
                  <span>最終更新: 今日 14:00</span>
                  <span>関連セッション 12</span>
                  <span>課題 8</span>
                  <span>担当: User</span>
                </div>
              </div>
              <span className="session-pill tone-green">アクティブ</span>
            </div>
          </section>

          <div className="projects-detail-grid">
            <section className="soft-card projects-info-card">
              <h3>概要</h3>
              <p className="people-summary-text">
                関東エリアを中心に展開する居酒屋チェーン。カジュアルな雰囲気とリーズナブルな価格帯で、
                20〜40代の会社員を中心に支持を集めている。
              </p>
              <button className="text-link" type="button">
                詳細を表示
              </button>
            </section>

            <section className="soft-card projects-sessions-card">
              <div className="section-head">
                <h3>関連セッション</h3>
                <button className="text-link" type="button">
                  すべて見る
                </button>
              </div>
              <div className="projects-linked-list">
                {[
                  ['研究室ミーティング', '会議', '今日 16:00'],
                  ['GD練習（模擬）', 'GD', '昨日 18:00'],
                  ['株式会社カジュアル酒場 定例MTG', '会議', '2024/05/15'],
                  ['先輩との1on1', '1on1', '2024/05/18'],
                  ['株式会社C 事業連携相談', '会議', '2024/05/10'],
                ].map(([title, type, date]) => (
                  <div className="projects-linked-row" key={`${title}-${date}`}>
                    <strong>{title}</strong>
                    <span className="session-pill tone-violet subtle-pill">
                      {type}
                    </span>
                    <span>{date}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="soft-card projects-points-card">
              <h3>重要なポイント</h3>
              <ul className="people-check-list">
                <li>新規出店計画: 2024年内に5店舗の出店を予定</li>
                <li>人材採用・教育の強化が急務</li>
                <li>原材料費の高騰に対するコスト最適化が課題</li>
                <li>デジタルマーケティングの強化で集客向上を目指す</li>
              </ul>
              <button className="text-link" type="button">
                すべてのポイントを表示
              </button>
            </section>

            <section className="soft-card projects-action-card">
              <div className="section-head">
                <h3>今後のアクション</h3>
                <button className="text-link" type="button">
                  すべて見る
                </button>
              </div>
              <div className="projects-linked-list">
                {[
                  ['新店舗出店計画の詳細検討', '2024/05/20', '高'],
                  ['採用戦略の見直し提案', '2024/05/22', '中'],
                  ['コスト最適化施策の提案資料作成', '2024/05/25', '中'],
                  ['デジタルマーケ施策の検討', '2024/05/28', '低'],
                ].map(([title, date, priority]) => (
                  <div className="projects-action-row" key={`${title}-${date}`}>
                    <span className="action-check" />
                    <strong>{title}</strong>
                    <span>{date}</span>
                    <span
                      className={`session-pill ${
                        priority === '高'
                          ? 'tone-orange'
                          : priority === '中'
                            ? 'tone-gold'
                            : 'tone-blue'
                      } subtle-pill`}
                    >
                      {priority}
                    </span>
                  </div>
                ))}
              </div>
              <div className="projects-input-row">
                ＋ 新しいアクションを追加...
              </div>
            </section>

            <section className="soft-card projects-connection-card">
              <h3>あなたとのつながり</h3>
              <ul className="people-bullet-list">
                <li>最終打ち合わせ: 今日 14:00（田中さん / Google Meet）</li>
                <li>担当者: 田中 太郎（代表取締役）</li>
                <li>関係期間: 2024年3月〜現在（3ヶ月）</li>
                <li>主な役割: 経営課題の整理・戦略支援</li>
              </ul>
              <button className="text-link" type="button">
                関係性の詳細を表示
              </button>
            </section>
          </div>
        </article>
      </div>
    </div>
  );
}
