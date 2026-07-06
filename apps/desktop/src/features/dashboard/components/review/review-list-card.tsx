import type { ReviewRecord } from '@/features/dashboard/lib/workspace-types';

type ReviewListCardProps = {
  reviews: ReviewRecord[];
  selectedId: string;
  onSelect: (id: string) => void;
};

export function ReviewListCard({
  reviews,
  selectedId,
  onSelect,
}: ReviewListCardProps) {
  return (
    <article className="soft-card review-list-card">
      <h3>過去のセッション</h3>
      <div className="review-list-stack">
        {reviews.map((card) => (
          <button
            className={`review-list-item ${card.id === selectedId ? 'active' : ''}`}
            key={card.id}
            onClick={() => onSelect(card.id)}
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
  );
}
