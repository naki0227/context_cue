import { projectCards } from '@/features/dashboard/lib/content';

export function ProjectsPage() {
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
                  <div className="progress-fill" style={{ width: progress }} />
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
