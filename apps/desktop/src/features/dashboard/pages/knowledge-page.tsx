import { useEffect, useMemo, useState } from 'react';
import type { DashboardController } from '@/features/dashboard/hooks/use-dashboard-controller';
import {
  linesToText,
  textToLines,
} from '@/features/dashboard/lib/editor-utils';
import type { KnowledgeRecord } from '@/features/dashboard/lib/workspace-types';
import { useWorkspaceStore } from '@/lib/state/workspace-store';

type KnowledgePageProps = Pick<
  DashboardController,
  | 'fileInputRef'
  | 'importLocalFiles'
  | 'importSampleKnowledge'
  | 'knowledgeImportNotice'
  | 'removeProfileDocument'
>;

export function KnowledgePage({
  fileInputRef,
  importLocalFiles,
  importSampleKnowledge,
  knowledgeImportNotice,
  removeProfileDocument,
}: KnowledgePageProps) {
  const knowledgeItems = useWorkspaceStore((state) => state.knowledgeItems);
  const addKnowledgeItem = useWorkspaceStore((state) => state.addKnowledgeItem);
  const updateKnowledgeItem = useWorkspaceStore(
    (state) => state.updateKnowledgeItem,
  );
  const removeKnowledgeItem = useWorkspaceStore(
    (state) => state.removeKnowledgeItem,
  );
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(knowledgeItems[0]?.id ?? '');

  const filteredItems = useMemo(() => {
    return knowledgeItems.filter((item) =>
      `${item.title} ${item.tag} ${item.content.join(' ')}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  }, [knowledgeItems, query]);

  useEffect(() => {
    const fallbackId = filteredItems[0]?.id ?? knowledgeItems[0]?.id ?? '';
    if (!knowledgeItems.some((item) => item.id === selectedId) && fallbackId) {
      setSelectedId(fallbackId);
    }
  }, [filteredItems, knowledgeItems, selectedId]);

  const selectedItem =
    knowledgeItems.find((item) => item.id === selectedId) ??
    knowledgeItems[0] ??
    null;
  const tags = Array.from(new Set(knowledgeItems.map((item) => item.tag)));
  const importedItems = knowledgeItems.filter(
    (item) => item.source !== 'manual',
  );

  function addDraftItem() {
    const id = addKnowledgeItem();
    setSelectedId(id);
  }

  function patchKnowledge<Key extends keyof KnowledgeRecord>(
    key: Key,
    value: KnowledgeRecord[Key],
  ) {
    if (!selectedItem) {
      return;
    }

    updateKnowledgeItem(selectedItem.id, {
      [key]: value,
      updatedAt: new Date().toLocaleDateString('ja-JP'),
    });
  }

  async function deleteKnowledge() {
    if (!selectedItem || !window.confirm('このナレッジ項目を削除しますか？')) {
      return;
    }

    if (selectedItem.sourceDocumentId) {
      await removeProfileDocument(selectedItem.sourceDocumentId);
      return;
    }

    removeKnowledgeItem(selectedItem.id);
  }

  return (
    <div className="page-layout">
      <div className="toolbar-row">
        <div className="toolbar-actions">
          <button
            className="primary-button"
            onClick={addDraftItem}
            type="button"
          >
            ＋ 新しい項目
          </button>
          <input
            className="search-input"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="検索"
            type="text"
            value={query}
          />
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

          {filteredItems.map((item) => (
            <button
              className={`table-row table-four knowledge-row-button ${
                selectedItem?.id === item.id ? 'active' : ''
              }`}
              key={item.id}
              onClick={() => setSelectedId(item.id)}
              type="button"
            >
              <strong>{item.title}</strong>
              <span className="tag-bubble">{item.tag}</span>
              <span>{item.updatedAt}</span>
              <span className="text-link">詳細</span>
            </button>
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
            <button onClick={() => fileInputRef.current?.click()} type="button">
              ナレッジを追加
            </button>
            <button
              className="secondary-button"
              onClick={importSampleKnowledge}
              type="button"
            >
              サンプル個人ナレッジを追加
            </button>
          </div>

          <p className="helper-text">
            {knowledgeImportNotice ||
              'ローカルの .md / .txt を追加すると同じ保存層に統合されます。'}
          </p>
          <p className="helper-text">
            追加済みファイル数: {importedItems.length}
          </p>
          <ul className="document-list">
            {importedItems.length === 0 ? (
              <li>まだ追加された個人ナレッジはありません。</li>
            ) : (
              importedItems.map((item) => (
                <li key={item.id}>
                  {item.title} ({item.tag})
                </li>
              ))
            )}
          </ul>
        </article>

        {selectedItem ? (
          <article className="soft-card detail-editor-card">
            <div className="detail-editor-head">
              <div className="detail-header">
                <h3>{selectedItem.title}</h3>
                <p>{selectedItem.tag}</p>
              </div>
              <button
                className="outline-button"
                onClick={() => void deleteKnowledge()}
                type="button"
              >
                削除
              </button>
            </div>

            <div className="detail-editor-grid">
              <label className="span-2">
                <span>タイトル</span>
                <input
                  value={selectedItem.title}
                  onChange={(event) =>
                    patchKnowledge('title', event.target.value)
                  }
                />
              </label>
              <label>
                <span>タグ</span>
                <input
                  list="knowledge-tags"
                  value={selectedItem.tag}
                  onChange={(event) =>
                    patchKnowledge('tag', event.target.value)
                  }
                />
                <datalist id="knowledge-tags">
                  {tags.map((tag) => (
                    <option key={tag} value={tag} />
                  ))}
                </datalist>
              </label>
              <label>
                <span>更新日</span>
                <input
                  value={selectedItem.updatedAt}
                  onChange={(event) =>
                    patchKnowledge('updatedAt', event.target.value)
                  }
                />
              </label>
              <label className="span-2">
                <span>内容</span>
                <textarea
                  rows={12}
                  value={linesToText(selectedItem.content)}
                  onChange={(event) =>
                    patchKnowledge('content', textToLines(event.target.value))
                  }
                />
              </label>
            </div>
          </article>
        ) : null}
      </div>
    </div>
  );
}
