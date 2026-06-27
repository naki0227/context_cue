import { useEffect, useMemo, useState } from 'react';
import {
  listPersonNames,
  listProjectTitles,
  resolvePersonIdsByNames,
  resolveProjectIdsByTitles,
} from '@/features/dashboard/lib/workspace-relations';
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
            className={`table-row sessions-table-grid sessions-table-row ${selectedId === row.id ? 'active' : ''}`}
            key={row.id}
            onClick={() => setSelectedId(row.id)}
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
            {filteredSessions.length === 0
              ? '0 件を表示'
              : `${(safePage - 1) * pageSize + 1}–${Math.min(
                  safePage * pageSize,
                  filteredSessions.length,
                )} / ${filteredSessions.length} 件を表示`}
          </span>
        </div>
      </article>

      {selectedSession ? (
        <section className="soft-card detail-editor-card">
          <div className="detail-editor-head">
            <div>
              <h3>セッション詳細</h3>
              <p>一覧と同じデータを直接編集できます。</p>
            </div>
            <button
              className="outline-button"
              onClick={deleteSession}
              type="button"
            >
              削除
            </button>
          </div>

          <div className="detail-editor-grid">
            <label>
              <span>タイトル</span>
              <input
                value={selectedSession.title}
                onChange={(event) => patchSession('title', event.target.value)}
              />
            </label>
            <label>
              <span>日時表示</span>
              <input
                value={selectedSession.dateLabel}
                onChange={(event) =>
                  patchSession('dateLabel', event.target.value)
                }
              />
            </label>
            <label>
              <span>タイプ</span>
              <select
                value={selectedSession.type}
                onChange={(event) =>
                  patchSession(
                    'type',
                    event.target.value as SessionRecord['type'],
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
              <span>ステータス</span>
              <select
                value={selectedSession.status}
                onChange={(event) =>
                  patchSession(
                    'status',
                    event.target.value as SessionRecord['status'],
                  )
                }
              >
                <option value="予定">予定</option>
                <option value="進行中">進行中</option>
                <option value="完了">完了</option>
              </select>
            </label>
            <label>
              <span>相手</span>
              <input
                value={selectedSession.partner}
                onChange={(event) =>
                  patchSession('partner', event.target.value)
                }
              />
            </label>
            <label>
              <span>場所</span>
              <input
                value={selectedSession.location}
                onChange={(event) =>
                  patchSession('location', event.target.value)
                }
              />
            </label>
            <label>
              <span>プラットフォーム</span>
              <input
                value={selectedSession.platform}
                onChange={(event) =>
                  patchSession('platform', event.target.value)
                }
              />
            </label>
            <label>
              <span>録画表示</span>
              <input
                value={selectedSession.recording}
                onChange={(event) =>
                  patchSession('recording', event.target.value)
                }
              />
            </label>
            <label className="span-2">
              <span>関連人物</span>
              <input
                placeholder="名前またはIDを , 区切りで入力"
                value={listPersonNames(people, selectedSession.peopleIds)}
                onChange={(event) =>
                  patchSession(
                    'peopleIds',
                    resolvePersonIdsByNames(people, event.target.value),
                  )
                }
              />
            </label>
            <label className="span-2">
              <span>関連プロジェクト</span>
              <input
                placeholder="タイトルまたはIDを , 区切りで入力"
                value={listProjectTitles(projects, selectedSession.projectIds)}
                onChange={(event) =>
                  patchSession(
                    'projectIds',
                    resolveProjectIdsByTitles(projects, event.target.value),
                  )
                }
              />
            </label>
            <label>
              <span>関連レビュー</span>
              <select
                value={selectedSession.reviewId ?? ''}
                onChange={(event) =>
                  patchSession(
                    'reviewId',
                    event.target.value.length > 0
                      ? event.target.value
                      : undefined,
                  )
                }
              >
                <option value="">未設定</option>
                {reviews.map((review) => (
                  <option key={review.id} value={review.id}>
                    {review.title}
                  </option>
                ))}
              </select>
            </label>
            <label className="span-2">
              <span>メモ</span>
              <textarea
                rows={4}
                value={selectedSession.memo}
                onChange={(event) => patchSession('memo', event.target.value)}
              />
            </label>
          </div>
        </section>
      ) : null}
    </div>
  );
}
