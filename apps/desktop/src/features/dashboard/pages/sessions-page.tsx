import { useMemo, useState } from 'react';
import { sessionTable } from '@/features/dashboard/lib/content';

const tabs = [
  'すべて',
  '面接',
  '面談',
  '会議',
  'GD',
  '1on1',
  '授業',
  'その他',
] as const;

const pageSize = 4;

export function SessionsPage() {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('すべて');
  const [query, setQuery] = useState('');
  const [selectedTitle, setSelectedTitle] = useState(
    sessionTable[0]?.title ?? '',
  );
  const [draftSessions, setDraftSessions] = useState(sessionTable.slice(0, 0));
  const [page, setPage] = useState(1);

  const sessions = useMemo(
    () => [...draftSessions, ...sessionTable],
    [draftSessions],
  );

  const filteredSessions = sessions.filter((row) => {
    const matchesTab = activeTab === 'すべて' || row.type === activeTab;
    const normalizedQuery = query.trim().toLowerCase();
    const haystack = `${row.title} ${row.partner} ${row.memo}`.toLowerCase();
    const matchesQuery =
      normalizedQuery.length === 0 || haystack.includes(normalizedQuery);

    return matchesTab && matchesQuery;
  });

  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedSessions = filteredSessions.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  function addDraftSession() {
    const nextSession = {
      title: `新しいセッション ${draftSessions.length + 1}`,
      type: '面談',
      date: '未設定',
      partner: '相手未設定 / オンライン',
      recording: '',
      status: '予定',
      memo: '会話の目的と確認したいことをここに整理します。',
      typeTone: 'green',
      recordingTone: 'neutral',
      statusTone: 'blue',
    } as (typeof sessionTable)[number];

    setDraftSessions((current) => [nextSession, ...current]);
    setSelectedTitle(nextSession.title);
    setPage(1);
  }

  return (
    <div className="page-layout sessions-page-v2">
      <div className="sessions-hero">
        <h1>Sessions</h1>
        <div className="toolbar-actions sessions-toolbar-actions">
          <div className="search-shell">
            <span className="search-shell-icon" />
            <input
              className="search-input search-input-v2"
              onChange={(event) => {
                setPage(1);
                setQuery(event.target.value);
              }}
              placeholder="検索"
              type="text"
              value={query}
            />
          </div>
          <button
            className="primary-button primary-button-v2"
            onClick={addDraftSession}
            type="button"
          >
            ＋ 新しいセッション
          </button>
        </div>
      </div>

      <div className="toolbar-row sessions-tabs-row">
        <div className="tab-row sessions-tab-row">
          {tabs.map((tab) => (
            <button
              className={`toolbar-tab sessions-tab ${activeTab === tab ? 'active' : ''}`}
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setPage(1);
              }}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

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

        {paginatedSessions.map((row) => (
          <button
            className={`table-row sessions-table-grid sessions-table-row ${selectedTitle === row.title ? 'active' : ''}`}
            key={row.title}
            onClick={() => setSelectedTitle(row.title)}
            type="button"
          >
            <strong className="sessions-title-cell">{row.title}</strong>
            <span className={`session-pill tone-${row.typeTone}`}>
              {row.type}
            </span>
            <span>{row.date}</span>
            <div className="session-partner-cell">
              <span>{row.partner}</span>
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
            {filteredSessions.length === 0
              ? '0 件を表示'
              : `${(safePage - 1) * pageSize + 1}–${Math.min(
                  safePage * pageSize,
                  filteredSessions.length,
                )} / ${filteredSessions.length} 件を表示`}
          </span>
          <div className="sessions-pagination">
            <button
              className="pagination-button"
              disabled={safePage === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              type="button"
            >
              ‹
            </button>
            {Array.from({ length: totalPages }, (_, index) => index + 1).map(
              (pageNumber) => (
                <button
                  className={`pagination-button ${
                    safePage === pageNumber ? 'active' : ''
                  }`}
                  key={pageNumber}
                  onClick={() => setPage(pageNumber)}
                  type="button"
                >
                  {pageNumber}
                </button>
              ),
            )}
            <button
              className="pagination-button"
              disabled={safePage === totalPages}
              onClick={() =>
                setPage((current) => Math.min(totalPages, current + 1))
              }
              type="button"
            >
              ›
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
