import { reviewCards } from '@/features/dashboard/lib/content';

export function ReviewPage() {
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
