import { templateCards } from '@/features/dashboard/lib/content';

export function TemplatesPage() {
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
