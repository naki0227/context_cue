import {
  linesToText,
  textToLines,
} from '@/features/dashboard/lib/editor-utils';
import type { KnowledgeRecord } from '@/features/dashboard/lib/workspace-types';

type KnowledgeDetailEditorProps = {
  item: KnowledgeRecord;
  onDelete: () => void;
  onPatch: <Key extends keyof KnowledgeRecord>(
    key: Key,
    value: KnowledgeRecord[Key],
  ) => void;
  tags: string[];
};

export function KnowledgeDetailEditor({
  item,
  onDelete,
  onPatch,
  tags,
}: KnowledgeDetailEditorProps) {
  return (
    <article className="soft-card detail-editor-card">
      <div className="detail-editor-head">
        <div className="detail-header">
          <h3>{item.title}</h3>
          <p>
            {item.tag} / {item.sensitivity ?? '個人'}
          </p>
        </div>
        <button className="outline-button" onClick={onDelete} type="button">
          削除
        </button>
      </div>

      <div className="detail-editor-grid">
        <label className="span-2">
          <span>タイトル</span>
          <input
            value={item.title}
            onChange={(event) => onPatch('title', event.target.value)}
          />
        </label>
        <label>
          <span>タグ</span>
          <input
            list="knowledge-tags"
            value={item.tag}
            onChange={(event) => onPatch('tag', event.target.value)}
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
            value={item.updatedAt}
            onChange={(event) => onPatch('updatedAt', event.target.value)}
          />
        </label>
        <label>
          <span>出典</span>
          <input
            maxLength={240}
            value={item.sourceLabel ?? ''}
            onChange={(event) => onPatch('sourceLabel', event.target.value)}
          />
        </label>
        <label>
          <span>確度</span>
          <select
            value={item.confidence ?? '未確認'}
            onChange={(event) =>
              onPatch(
                'confidence',
                event.target.value as KnowledgeRecord['confidence'],
              )
            }
          >
            <option>確認済み</option>
            <option>概算</option>
            <option>未確認</option>
          </select>
        </label>
        <label>
          <span>機密度</span>
          <select
            value={item.sensitivity ?? '個人'}
            onChange={(event) =>
              onPatch(
                'sensitivity',
                event.target.value as KnowledgeRecord['sensitivity'],
              )
            }
          >
            <option>一般</option>
            <option>個人</option>
            <option>機密</option>
          </select>
        </label>
        <label className="span-2">
          <span>内容</span>
          <textarea
            rows={12}
            value={linesToText(item.content)}
            onChange={(event) =>
              onPatch('content', textToLines(event.target.value))
            }
          />
        </label>
      </div>
    </article>
  );
}
