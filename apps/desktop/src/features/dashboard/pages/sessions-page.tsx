import { sessionTable } from '@/features/dashboard/lib/content';

export function SessionsPage() {
  return (
    <div className="page-layout sessions-page-v2">
      <div className="sessions-hero">
        <h1>Sessions</h1>
        <div className="toolbar-actions sessions-toolbar-actions">
          <div className="search-shell">
            <span className="search-shell-icon" />
            <input
              className="search-input search-input-v2"
              placeholder="検索"
              type="text"
            />
          </div>
          <button className="primary-button primary-button-v2" type="button">
            ＋ 新しいセッション
          </button>
        </div>
      </div>

      <div className="toolbar-row sessions-tabs-row">
        <div className="tab-row sessions-tab-row">
          {[
            'すべて',
            '面接',
            '面談',
            '会議',
            'GD',
            '1on1',
            '授業',
            'その他',
          ].map((tab, index) => (
            <button
              className={`toolbar-tab sessions-tab ${index === 0 ? 'active' : ''}`}
              key={tab}
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

        {sessionTable.map((row) => (
          <div
            className="table-row sessions-table-grid sessions-table-row"
            key={row.title}
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
            <button className="row-menu-button" type="button">
              ⋮
            </button>
          </div>
        ))}

        <div className="sessions-footer">
          <span>1–8 / 24 件を表示</span>
          <div className="sessions-pagination">
            <button className="pagination-button" type="button">
              ‹
            </button>
            <button className="pagination-button active" type="button">
              1
            </button>
            <button className="pagination-button" type="button">
              2
            </button>
            <button className="pagination-button" type="button">
              3
            </button>
            <button className="pagination-button" type="button">
              ›
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
