import { useState } from 'react';
import { templateCards } from '@/features/dashboard/lib/content';

const tabs = [
  'すべて',
  '事前準備',
  '想定質問',
  '振り返り',
  '議事メモ',
  'その他',
];

export function TemplatesPage() {
  const [activeTab, setActiveTab] = useState('すべて');
  const [query, setQuery] = useState('');

  const filteredTemplates = templateCards.filter((template) => {
    const matchesTab =
      activeTab === 'すべて' ||
      template.tag.includes(activeTab) ||
      template.title.includes(activeTab);
    const matchesQuery =
      query.trim().length === 0 ||
      `${template.title} ${template.description} ${template.tag}`
        .toLowerCase()
        .includes(query.toLowerCase());

    return matchesTab && matchesQuery;
  });

  return (
    <div className="page-layout templates-page-v2">
      <div className="sessions-hero">
        <h1>Templates</h1>
        <div className="toolbar-actions sessions-toolbar-actions">
          <div className="tab-row people-tab-row">
            {tabs.map((tab) => (
              <button
                className={`toolbar-tab sessions-tab ${
                  activeTab === tab ? 'active' : ''
                }`}
                key={tab}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="sessions-search-row">
            <label className="search-input-shell">
              <span className="search-icon" />
              <input
                className="search-input-ghost"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="検索"
                type="text"
                value={query}
              />
            </label>
            <button className="primary-button primary-button-v2" type="button">
              ＋ 新しいテンプレート
            </button>
          </div>
        </div>
      </div>

      <div className="template-grid template-grid-v2">
        {filteredTemplates.map((template) => (
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
        {filteredTemplates.length === 0
          ? '一致するテンプレートがありません。検索条件を変えてみてください。'
          : 'テンプレートを活用して、効率的に情報を整理しましょう。'}
      </p>
    </div>
  );
}
