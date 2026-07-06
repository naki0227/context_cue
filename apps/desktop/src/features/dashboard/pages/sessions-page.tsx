import { useEffect, useMemo, useState } from 'react';
import { SessionDetailCard } from '@/features/dashboard/components/sessions/session-detail-card';
import { SessionsTableCard } from '@/features/dashboard/components/sessions/sessions-table-card';
import type { SessionRecord } from '@/features/dashboard/lib/workspace-types';
import { useWorkspaceStore } from '@/lib/state/workspace-store';

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

const pageSize = 8;

export function SessionsPage() {
  const sessions = useWorkspaceStore((state) => state.sessions);
  const people = useWorkspaceStore((state) => state.people);
  const projects = useWorkspaceStore((state) => state.projects);
  const reviews = useWorkspaceStore((state) => state.reviews);
  const addSession = useWorkspaceStore((state) => state.addSession);
  const updateSession = useWorkspaceStore((state) => state.updateSession);
  const removeSession = useWorkspaceStore((state) => state.removeSession);
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('すべて');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState(sessions[0]?.id ?? '');
  const [page, setPage] = useState(1);

  const filteredSessions = useMemo(() => {
    return sessions.filter((row) => {
      const matchesTab = activeTab === 'すべて' || row.type === activeTab;
      const normalizedQuery = query.trim().toLowerCase();
      const haystack =
        `${row.title} ${row.partner} ${row.location} ${row.memo}`.toLowerCase();
      const matchesQuery =
        normalizedQuery.length === 0 || haystack.includes(normalizedQuery);

      return matchesTab && matchesQuery;
    });
  }, [activeTab, query, sessions]);

  useEffect(() => {
    const fallbackId = filteredSessions[0]?.id ?? sessions[0]?.id ?? '';
    if (!sessions.some((item) => item.id === selectedId) && fallbackId) {
      setSelectedId(fallbackId);
    }
  }, [filteredSessions, selectedId, sessions]);

  const totalPages = Math.max(1, Math.ceil(filteredSessions.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedSessions = filteredSessions.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );
  const selectedSession =
    sessions.find((item) => item.id === selectedId) ?? sessions[0] ?? null;

  function addDraftSession() {
    const id = addSession();
    setSelectedId(id);
    setPage(1);
  }

  function patchSession<Key extends keyof SessionRecord>(
    key: Key,
    value: SessionRecord[Key],
  ) {
    if (!selectedSession) {
      return;
    }

    updateSession(selectedSession.id, { [key]: value });
  }

  function deleteSession() {
    if (!selectedSession || !window.confirm('このセッションを削除しますか？')) {
      return;
    }

    removeSession(selectedSession.id);
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

      <SessionsTableCard
        currentPage={safePage}
        filteredCount={filteredSessions.length}
        pageSize={pageSize}
        selectedId={selectedId}
        sessions={paginatedSessions}
        onSelect={setSelectedId}
      />

      {selectedSession ? (
        <SessionDetailCard
          people={people}
          projects={projects}
          reviews={reviews}
          session={selectedSession}
          tabs={tabs}
          onDelete={deleteSession}
          onPatch={patchSession}
        />
      ) : null}
    </div>
  );
}
