import { useEffect, useMemo, useState } from 'react';
import {
  linesToText,
  textToLines,
} from '@/features/dashboard/lib/editor-utils';
import { buildReviewRelatedSession } from '@/features/dashboard/lib/workspace-relations';
import type { ReviewRecord } from '@/features/dashboard/lib/workspace-types';
import { useWorkspaceStore } from '@/lib/state/workspace-store';

const tabs = [
  'すべて',
  '面談',
  '面接',
  '会議',
  'GD',
  '1on1',
  'その他',
] as const;

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

export function ReviewPage() {
  const reviews = useWorkspaceStore((state) => state.reviews);
  const sessions = useWorkspaceStore((state) => state.sessions);
  const addReview = useWorkspaceStore((state) => state.addReview);
  const updateReview = useWorkspaceStore((state) => state.updateReview);
  const removeReview = useWorkspaceStore((state) => state.removeReview);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('すべて');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(reviews[0]?.id ?? '');

  const filteredReviews = useMemo(() => {
    return reviews.filter((card) => {
      const matchesTab = activeTab === 'すべて' || card.type === activeTab;
      const normalizedQuery = query.trim().toLowerCase();
      const haystack =
        `${card.title} ${card.meta} ${card.summary.join(' ')}`.toLowerCase();
      const matchesQuery =
        normalizedQuery.length === 0 || haystack.includes(normalizedQuery);

      return matchesTab && matchesQuery;
    });
  }, [activeTab, query, reviews]);

  useEffect(() => {
    const fallbackId = filteredReviews[0]?.id ?? reviews[0]?.id ?? '';
    if (!reviews.some((item) => item.id === selectedId) && fallbackId) {
      setSelectedId(fallbackId);
    }
  }, [filteredReviews, reviews, selectedId]);

  const featuredReview =
    reviews.find((card) => card.id === selectedId) ?? reviews[0] ?? null;
  const relatedSession = featuredReview
    ? buildReviewRelatedSession(sessions, featuredReview.id)
    : null;

  function addReviewRecord() {
    const id = addReview();
    setSelectedId(id);
  }

  function patchReview<Key extends keyof ReviewRecord>(
    key: Key,
    value: ReviewRecord[Key],
  ) {
    if (!featuredReview) {
      return;
    }

    updateReview(featuredReview.id, { [key]: value });
  }

  function deleteReview() {
    if (!featuredReview || !window.confirm('この振り返りを削除しますか？')) {
      return;
    }

    removeReview(featuredReview.id);
  }

  return (
    <div className="page-layout review-page-v2">
      <div className="sessions-hero">
        <h1>Review</h1>
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
              onChange={(event) => setQuery(event.target.value)}
              placeholder="検索"
              type="text"
              value={query}
            />
          </div>
          <button
            className="primary-button primary-button-v2"
            onClick={addReviewRecord}
            type="button"
          >
            ＋ 新しい振り返り
          </button>
        </div>
      </div>

      <div className="split-grid review-grid-v2">
        <article className="soft-card review-list-card">
          <h3>過去のセッション</h3>
          <div className="review-list-stack">
            {filteredReviews.map((card) => (
              <button
                className={`review-list-item ${card.id === selectedId ? 'active' : ''}`}
                key={card.id}
                onClick={() => setSelectedId(card.id)}
                type="button"
              >
                <strong>{card.title}</strong>
                <span className="session-pill tone-violet subtle-pill">
                  {card.type}
                </span>
                <p>{card.date}</p>
                <span>{card.meta}</span>
              </button>
            ))}
          </div>
        </article>

        {featuredReview ? (
          <article className="soft-card review-detail-card">
            <div className="review-detail-top">
              <div>
                <div className="project-title-row">
                  <h2>{featuredReview.title}</h2>
                  <span className="session-pill tone-violet">
                    {featuredReview.type}
                  </span>
                </div>
                <p className="projects-role-text">{featuredReview.meta}</p>
                <p className="projects-role-text">{featuredReview.date}</p>
                {relatedSession ? (
                  <p className="projects-role-text">
                    関連セッション: {relatedSession.title} /{' '}
                    {relatedSession.dateLabel}
                  </p>
                ) : null}
              </div>
              <button
                className="outline-button small"
                onClick={deleteReview}
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
                      value={featuredReview.title}
                      onChange={(event) =>
                        patchReview('title', event.target.value)
                      }
                    />
                  </label>
                  <label>
                    <span>タイプ</span>
                    <select
                      value={featuredReview.type}
                      onChange={(event) =>
                        patchReview(
                          'type',
                          event.target.value as ReviewRecord['type'],
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
                    <span>日付</span>
                    <input
                      value={featuredReview.date}
                      onChange={(event) =>
                        patchReview('date', event.target.value)
                      }
                    />
                  </label>
                  <label>
                    <span>メタ情報</span>
                    <input
                      value={featuredReview.meta}
                      onChange={(event) =>
                        patchReview('meta', event.target.value)
                      }
                    />
                  </label>
                </div>
              </section>

              <section className="soft-card detail-editor-card">
                <h3>良かった点</h3>
                <textarea
                  rows={6}
                  value={linesToText(featuredReview.summary)}
                  onChange={(event) =>
                    patchReview('summary', textToLines(event.target.value))
                  }
                />
              </section>

              <section className="soft-card detail-editor-card">
                <h3>重要な学び・気づき</h3>
                <textarea
                  rows={6}
                  value={linesToText(featuredReview.insights)}
                  onChange={(event) =>
                    patchReview('insights', textToLines(event.target.value))
                  }
                />
              </section>

              <section className="soft-card detail-editor-card">
                <h3>改善点</h3>
                <textarea
                  rows={6}
                  value={linesToText(featuredReview.improvements)}
                  onChange={(event) =>
                    patchReview('improvements', textToLines(event.target.value))
                  }
                />
              </section>

              <section className="soft-card detail-editor-card">
                <h3>メモ</h3>
                <textarea
                  rows={6}
                  value={linesToText(featuredReview.memo)}
                  onChange={(event) =>
                    patchReview('memo', textToLines(event.target.value))
                  }
                />
              </section>

              <section className="soft-card detail-editor-card">
                <h3>次回アクション</h3>
                <textarea
                  rows={6}
                  value={actionsToText(featuredReview.actions)}
                  onChange={(event) =>
                    patchReview('actions', textToActions(event.target.value))
                  }
                />
              </section>

              <section className="soft-card detail-editor-card span-2">
                <h3>トランスクリプト</h3>
                <textarea
                  rows={8}
                  value={linesToText(featuredReview.transcript)}
                  onChange={(event) =>
                    patchReview('transcript', textToLines(event.target.value))
                  }
                />
              </section>
            </div>
          </article>
        ) : null}
      </div>
    </div>
  );
}
