import {
  linesToText,
  textToLines,
} from '@/features/dashboard/lib/editor-utils';
import type {
  ReviewRecord,
  SessionRecord,
} from '@/features/dashboard/lib/workspace-types';

type ReviewDetailCardProps = {
  relatedSession: SessionRecord | null;
  review: ReviewRecord;
  tabs: readonly string[];
  onDelete: () => void;
  onPatch: <Key extends keyof ReviewRecord>(
    key: Key,
    value: ReviewRecord[Key],
  ) => void;
};

function actionsToText(actions: ReviewRecord['actions']) {
  return actions
    .map((item) => `${item.title} | ${item.owner} | ${item.date}`)
    .join('\n');
}

function textToActions(value: string): ReviewRecord['actions'] {
  return value
    .split('\n')
    .map((line, index) => {
      const [title = '', owner = '', date = ''] = line
        .split('|')
        .map((item) => item.trim());
      if (!title) {
        return null;
      }

      return { id: `review-action-${index}-${title}`, title, owner, date };
    })
    .filter((item): item is ReviewRecord['actions'][number] => Boolean(item));
}

export function ReviewDetailCard({
  relatedSession,
  review,
  tabs,
  onDelete,
  onPatch,
}: ReviewDetailCardProps) {
  return (
    <article className="soft-card review-detail-card">
      <div className="review-detail-top">
        <div>
          <div className="project-title-row">
            <h2>{review.title}</h2>
            <span className="session-pill tone-violet">{review.type}</span>
          </div>
          <p className="projects-role-text">{review.meta}</p>
          <p className="projects-role-text">{review.date}</p>
          {relatedSession ? (
            <p className="projects-role-text">
              関連セッション: {relatedSession.title} /{' '}
              {relatedSession.dateLabel}
            </p>
          ) : null}
        </div>
        <button
          className="outline-button small"
          onClick={onDelete}
          type="button"
        >
          削除
        </button>
      </div>

      <div className="review-detail-grid">
        <section className="soft-card detail-editor-card">
          <h3>基本情報</h3>
          <div className="detail-editor-grid">
            <label>
              <span>タイトル</span>
              <input
                value={review.title}
                onChange={(event) => onPatch('title', event.target.value)}
              />
            </label>
            <label>
              <span>タイプ</span>
              <select
                value={review.type}
                onChange={(event) =>
                  onPatch('type', event.target.value as ReviewRecord['type'])
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
              <span>日付</span>
              <input
                value={review.date}
                onChange={(event) => onPatch('date', event.target.value)}
              />
            </label>
            <label>
              <span>メタ情報</span>
              <input
                value={review.meta}
                onChange={(event) => onPatch('meta', event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="soft-card detail-editor-card">
          <h3>良かった点</h3>
          <textarea
            rows={6}
            value={linesToText(review.summary)}
            onChange={(event) =>
              onPatch('summary', textToLines(event.target.value))
            }
          />
        </section>

        <section className="soft-card detail-editor-card">
          <h3>重要な学び・気づき</h3>
          <textarea
            rows={6}
            value={linesToText(review.insights)}
            onChange={(event) =>
              onPatch('insights', textToLines(event.target.value))
            }
          />
        </section>

        <section className="soft-card detail-editor-card">
          <h3>改善点</h3>
          <textarea
            rows={6}
            value={linesToText(review.improvements)}
            onChange={(event) =>
              onPatch('improvements', textToLines(event.target.value))
            }
          />
        </section>

        <section className="soft-card detail-editor-card">
          <h3>メモ</h3>
          <textarea
            rows={6}
            value={linesToText(review.memo)}
            onChange={(event) =>
              onPatch('memo', textToLines(event.target.value))
            }
          />
        </section>

        <section className="soft-card detail-editor-card">
          <h3>次回アクション</h3>
          <textarea
            rows={6}
            value={actionsToText(review.actions)}
            onChange={(event) =>
              onPatch('actions', textToActions(event.target.value))
            }
          />
        </section>

        <section className="soft-card detail-editor-card span-2">
          <h3>トランスクリプト</h3>
          <textarea
            rows={8}
            value={linesToText(review.transcript)}
            onChange={(event) =>
              onPatch('transcript', textToLines(event.target.value))
            }
          />
        </section>
      </div>
    </article>
  );
}
