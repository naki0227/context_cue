import { useEffect, useMemo, useState } from 'react';
import { ReviewDetailCard } from '@/features/dashboard/components/review/review-detail-card';
import { ReviewListCard } from '@/features/dashboard/components/review/review-list-card';
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

export function ReviewPage() {
  const reviews = useWorkspaceStore((state) => state.reviews);
  const sessions = useWorkspaceStore((state) => state.sessions);
  const addReview = useWorkspaceStore((state) => state.addReview);
  const updateReview = useWorkspaceStore((state) => state.updateReview);
  const updateSession = useWorkspaceStore((state) => state.updateSession);
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

  function updateRelatedSessionId(nextSessionId: string | null) {
    if (!featuredReview) {
      return;
    }

    for (const session of sessions) {
      const shouldLink = session.id === nextSessionId;
      const isLinked = session.reviewId === featuredReview.id;
      if (shouldLink === isLinked) {
        continue;
      }

      updateSession(session.id, {
        reviewId: shouldLink ? featuredReview.id : undefined,
      });
    }
  }

  return (
    <div className="page-layout review-page-v2">
      <div className="sessions-hero">
        <h1>Review</h1>
        <div className="toolbar-actions sessions-toolbar-actions">
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

      <div className="toolbar-row sessions-tabs-row">
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
      </div>

      <div className="split-grid review-grid-v2">
        <ReviewListCard
          reviews={filteredReviews}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />

        {featuredReview ? (
          <ReviewDetailCard
            relatedSession={relatedSession}
            review={featuredReview}
            sessions={sessions}
            tabs={tabs}
            onDelete={deleteReview}
            onChangeRelatedSessionId={updateRelatedSessionId}
            onPatch={patchReview}
          />
        ) : null}
      </div>
    </div>
  );
}
