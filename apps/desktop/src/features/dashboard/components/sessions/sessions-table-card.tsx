import type { SessionRecord } from '@/features/dashboard/lib/workspace-types';

type SessionsTableCardProps = {
  currentPage: number;
  filteredCount: number;
  pageSize: number;
  selectedId: string;
  sessions: SessionRecord[];
  onSelect: (id: string) => void;
};

export function SessionsTableCard({
  currentPage,
  filteredCount,
  pageSize,
  selectedId,
  sessions,
  onSelect,
}: SessionsTableCardProps) {
  return (
    <article className="soft-card page-table-card sessions-table-card">
      <div className="table-head sessions-table-grid sessions-table-head">
        <span>タイトル</span>
        <span>タイプ</span>
        <span>日時</span>
        <span>相手 / 場所</span>
        <span>ステータス</span>
        <span>メモ</span>
        <span />
      </div>

      {sessions.map((row) => (
        <button
          className={`table-row sessions-table-grid sessions-table-row ${selectedId === row.id ? 'active' : ''}`}
          key={row.id}
          onClick={() => onSelect(row.id)}
          type="button"
        >
          <strong className="sessions-title-cell">{row.title}</strong>
          <span className={`session-pill tone-${row.typeTone}`}>
            {row.type}
          </span>
          <span>{row.dateLabel}</span>
          <div className="session-partner-cell">
            <span>
              {row.partner} / {row.location}
            </span>
            {row.recording ? (
              <span
                className={`session-pill tone-${row.recordingTone} subtle-pill`}
              >
                {row.recording}
              </span>
            ) : null}
          </div>
          <span className={`session-pill tone-${row.statusTone} subtle-pill`}>
            {row.status}
          </span>
          <span className="session-memo-cell">{row.memo}</span>
          <span className="row-menu-button">⋮</span>
        </button>
      ))}

      <div className="sessions-footer">
        <span>
          {filteredCount === 0
            ? '0 件を表示'
            : `${(currentPage - 1) * pageSize + 1}–${Math.min(
                currentPage * pageSize,
                filteredCount,
              )} / ${filteredCount} 件を表示`}
        </span>
      </div>
    </article>
  );
}
