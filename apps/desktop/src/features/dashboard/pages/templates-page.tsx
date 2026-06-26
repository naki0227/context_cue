import { useEffect, useMemo, useState } from 'react';
import {
  linesToText,
  textToLines,
} from '@/features/dashboard/lib/editor-utils';
import type { TemplateRecord } from '@/features/dashboard/lib/workspace-types';
import { useWorkspaceStore } from '@/lib/state/workspace-store';

const tabs = [
  'すべて',
  '事前準備',
  '想定質問',
  '振り返り',
  '議事メモ',
  'その他',
] as const;

export function TemplatesPage() {
  const templates = useWorkspaceStore((state) => state.templates);
  const addTemplate = useWorkspaceStore((state) => state.addTemplate);
  const updateTemplate = useWorkspaceStore((state) => state.updateTemplate);
  const removeTemplate = useWorkspaceStore((state) => state.removeTemplate);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('すべて');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(templates[0]?.id ?? '');

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesTab = activeTab === 'すべて' || template.tag === activeTab;
      const matchesQuery =
        query.trim().length === 0 ||
        `${template.title} ${template.description} ${template.tag} ${template.body.join(' ')}`
          .toLowerCase()
          .includes(query.toLowerCase());

      return matchesTab && matchesQuery;
    });
  }, [activeTab, query, templates]);

  useEffect(() => {
    const fallbackId = filteredTemplates[0]?.id ?? templates[0]?.id ?? '';
    if (!templates.some((item) => item.id === selectedId) && fallbackId) {
      setSelectedId(fallbackId);
    }
  }, [filteredTemplates, selectedId, templates]);

  const selectedTemplate =
    templates.find((item) => item.id === selectedId) ?? templates[0] ?? null;

  function addTemplateRecord() {
    const id = addTemplate();
    setSelectedId(id);
  }

  function patchTemplate<Key extends keyof TemplateRecord>(
    key: Key,
    value: TemplateRecord[Key],
  ) {
    if (!selectedTemplate) {
      return;
    }

    updateTemplate(selectedTemplate.id, { [key]: value });
  }

  function deleteTemplate() {
    if (
      !selectedTemplate ||
      !window.confirm('このテンプレートを削除しますか？')
    ) {
      return;
    }

    removeTemplate(selectedTemplate.id);
  }

  return (
    <div className="page-layout templates-page-v2">
      <div className="sessions-hero">
        <h1>Templates</h1>
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
            <button
              className="primary-button primary-button-v2"
              onClick={addTemplateRecord}
              type="button"
            >
              ＋ 新しいテンプレート
            </button>
          </div>
        </div>
      </div>

      <div className="split-grid templates-grid-live">
        <div className="template-grid template-grid-v2">
          {filteredTemplates.map((template) => (
            <button
              className={`soft-card template-card template-card-v2 ${template.id === selectedId ? 'active' : ''}`}
              key={template.id}
              onClick={() => setSelectedId(template.id)}
              type="button"
            >
              <div
                className={`template-icon template-icon-v2 icon-${template.icon} tone-${template.tone}`}
              />
              <h3>{template.title}</h3>
              <p>{template.description}</p>
              <span className={`template-tag tone-${template.tone}`}>
                {template.tag}
              </span>
            </button>
          ))}
        </div>

        {selectedTemplate ? (
          <section className="soft-card detail-editor-card">
            <div className="detail-editor-head">
              <div>
                <h3>テンプレート詳細</h3>
                <p>一覧と同じ保存データを編集します。</p>
              </div>
              <button
                className="outline-button"
                onClick={deleteTemplate}
                type="button"
              >
                削除
              </button>
            </div>

            <div className="detail-editor-grid">
              <label className="span-2">
                <span>タイトル</span>
                <input
                  value={selectedTemplate.title}
                  onChange={(event) =>
                    patchTemplate('title', event.target.value)
                  }
                />
              </label>
              <label>
                <span>タグ</span>
                <select
                  value={selectedTemplate.tag}
                  onChange={(event) =>
                    patchTemplate(
                      'tag',
                      event.target.value as TemplateRecord['tag'],
                    )
                  }
                >
                  {tabs.slice(1).map((tab) => (
                    <option key={tab} value={tab}>
                      {tab}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>更新日</span>
                <input
                  value={selectedTemplate.updatedAt}
                  onChange={(event) =>
                    patchTemplate('updatedAt', event.target.value)
                  }
                />
              </label>
              <label className="span-2">
                <span>説明</span>
                <textarea
                  rows={4}
                  value={selectedTemplate.description}
                  onChange={(event) =>
                    patchTemplate('description', event.target.value)
                  }
                />
              </label>
              <label className="span-2">
                <span>本文</span>
                <textarea
                  rows={8}
                  value={linesToText(selectedTemplate.body)}
                  onChange={(event) =>
                    patchTemplate('body', textToLines(event.target.value))
                  }
                />
              </label>
            </div>
          </section>
        ) : null}
      </div>

      <p className="templates-footer-note">
        {filteredTemplates.length === 0
          ? '一致するテンプレートがありません。検索条件を変えてみてください。'
          : 'テンプレートを活用して、効率的に情報を整理しましょう。'}
      </p>
    </div>
  );
}
