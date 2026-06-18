import { sessionTable } from '@/features/dashboard/lib/content';
import { OverlayPreview } from '@/features/overlay/components/overlay-preview';

type SessionsPageProps = {
  confirmItems: string[];
  flowPoints: string[];
  nextTalkCandidates: string[];
  overlayTopic: string;
  sessionStatus: string;
  sideOverlayVisible: boolean;
  topOverlayVisible: boolean;
};

export function SessionsPage(props: SessionsPageProps) {
  return (
    <div className="page-layout">
      <div className="toolbar-row">
        <div className="tab-row">
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
              className={`toolbar-tab ${index === 0 ? 'active' : ''}`}
              key={tab}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="toolbar-actions">
          <input className="search-input" placeholder="検索" type="text" />
          <button className="primary-button" type="button">
            ＋ 新しいセッション
          </button>
        </div>
      </div>

      <article className="soft-card page-table-card">
        <div className="table-head table-five">
          <span>タイトル</span>
          <span>タイプ</span>
          <span>日時</span>
          <span>相手 / 場所</span>
          <span>ステータス</span>
        </div>
        {sessionTable.map((row) => (
          <div className="table-row table-five" key={row[0]}>
            <strong>{row[0]}</strong>
            <span>{row[1]}</span>
            <span>{row[2]}</span>
            <span>{row[3]}</span>
            <span className="status-bubble">{row[4]}</span>
          </div>
        ))}
      </article>

      <OverlayPreview {...props} />
    </div>
  );
}
