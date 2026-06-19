import { templateCards } from '@/features/dashboard/lib/content';

export function TemplatesPage() {
  return (
    <div className="page-layout templates-page-v2">
      <div className="sessions-hero">
        <h1>Templates</h1>
        <div className="toolbar-actions sessions-toolbar-actions">
          <div className="tab-row people-tab-row">
            {[
              'すべて',
              '事前準備',
              '想定質問',
              '振り返り',
              '議事メモ',
              'その他',
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
          <button className="primary-button primary-button-v2" type="button">
            ＋ 新しいテンプレート
          </button>
        </div>
      </div>

      <div className="template-grid template-grid-v2">
        {templateCards.map((template) => (
          <article
            className="soft-card template-card template-card-v2"
            key={template.title}
          >
            <div
              className={`template-icon template-icon-v2 icon-${template.icon} tone-${template.tone}`}
            />
            <h3>{template.title}</h3>
            <p>{template.description}</p>
            <span className={`template-tag tone-${template.tone}`}>
              {template.tag}
            </span>
          </article>
        ))}
      </div>

      <p className="templates-footer-note">
        テンプレートを活用して、効率的に情報を整理しましょう。
      </p>
    </div>
  );
}
