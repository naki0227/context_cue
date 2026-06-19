import {
  readinessItems,
  recentSessions,
  todaySchedule,
} from '@/features/dashboard/lib/content';

type HomePageProps = {
  preparedness: string;
};

export function HomePage({ preparedness }: HomePageProps) {
  return (
    <div className="page-layout home-page-v2">
      <header className="home-page-header">
        <div>
          <h1>おはようございます、User さん</h1>
          <p>次のセッションに向けた準備と最近の流れをまとめています。</p>
        </div>
      </header>

      <div className="page-grid home-grid home-grid-polished home-grid-v2">
        <article className="soft-card hero-card next-session-card next-session-card-v2">
          <p className="page-section-title home-section-title">
            次のセッション
          </p>
          <div className="next-session-header-v2">
            <strong className="next-session-time-plain">14:00</strong>
            <span className="blue-badge">30分後</span>
          </div>
          <div className="next-session-panel next-session-panel-v2">
            <div className="next-session-icon next-session-icon-v2">
              <span className="calendar-glyph" />
            </div>
            <div className="next-session-main next-session-main-v2">
              <strong className="next-session-title-v2">
                株式会社A カジュアル面談
              </strong>
              <div className="next-session-meta-row">
                <span className="channel-logo" />
                <span className="meeting-channel-v2">Google Meet</span>
                <span className="duration-icon" />
                <span className="meeting-duration">60分</span>
              </div>
            </div>
          </div>
        </article>

        <article className="soft-card compact-card home-status-card home-status-card-v2">
          <div className="section-head home-card-head">
            <p className="page-section-title home-section-title">準備状況</p>
            <span className="mini-badge">{preparedness}</span>
          </div>
          <ul className="simple-check-list readiness-list readiness-list-v2">
            {readinessItems.map((item) => (
              <li key={item.label}>
                <span className={`readiness-marker marker-${item.tone}`} />
                <span className="check-label">{item.label}</span>
                {item.meta ? (
                  <strong>{item.meta}</strong>
                ) : (
                  <span className="readiness-arrow">›</span>
                )}
              </li>
            ))}
          </ul>
        </article>

        <article className="soft-card compact-card home-schedule-card home-panel-v2">
          <p className="page-section-title home-section-title">今日の予定</p>
          <ul className="agenda-list agenda-list-v2">
            {todaySchedule.slice(1).map((item) => (
              <li key={item.title}>
                <strong>{item.time}</strong>
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="soft-card compact-card home-recommend-card home-panel-v2">
          <p className="page-section-title home-section-title">
            AIからのおすすめ
          </p>
          <ul className="recommend-list recommend-list-v2">
            <li>想定質問の回答候補を更新しました</li>
            <li>過去の面談記録から質問20選を追加しました</li>
            <li>あなたの強みを活かせる質問があります</li>
          </ul>
        </article>

        <article className="soft-card span-2 recent-sessions-card recent-sessions-card-v2">
          <div className="section-head home-card-head">
            <h3>最近のセッション</h3>
            <button className="text-link" type="button">
              すべて見る
            </button>
          </div>
          <div className="recent-row recent-row-home recent-row-home-v2">
            {recentSessions.map((session) => (
              <div
                className="recent-session-chip recent-session-chip-home recent-session-chip-v2"
                key={session.title}
              >
                <span
                  className={`mini-icon mini-icon-v2 icon-${session.icon}`}
                />
                <div className="recent-session-copy">
                  <strong>{session.title}</strong>
                  <span>{session.date}</span>
                </div>
                <span className={`recent-session-status tone-${session.tone}`}>
                  {session.status}
                </span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
