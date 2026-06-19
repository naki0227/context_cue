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
    <div className="page-layout">
      <header className="home-page-header">
        <div>
          <h1>おはようございます、User さん</h1>
          <p>次のセッションに向けた準備と最近の流れをまとめています。</p>
        </div>
      </header>

      <div className="page-grid home-grid home-grid-polished">
        <article className="soft-card hero-card next-session-card">
          <div className="hero-title-row home-card-head">
            <div>
              <p className="page-section-title">次のセッション</p>
              <h2>株式会社A カジュアル面談</h2>
            </div>
            <span className="blue-badge">30分後</span>
          </div>
          <div className="next-session-panel next-session-panel-rich">
            <div className="next-session-icon" />
            <div className="next-session-main">
              <div className="next-session-time-row">
                <strong className="next-session-time">14:00</strong>
                <span className="meeting-channel">Google Meet</span>
              </div>
              <strong>株式会社A カジュアル面談</strong>
              <p>相手: 田中さん / 60分</p>
            </div>
          </div>
        </article>

        <article className="soft-card compact-card home-status-card">
          <div className="section-head home-card-head">
            <p className="page-section-title">準備状況</p>
            <span className="mini-badge">{preparedness}</span>
          </div>
          <ul className="simple-check-list readiness-list">
            {readinessItems.map(([label, meta]) => (
              <li key={label}>
                <span className="check-label">{label}</span>
                <strong>{meta}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="soft-card compact-card home-schedule-card">
          <p className="page-section-title">今日の予定</p>
          <ul className="agenda-list">
            {todaySchedule.slice(1).map((item) => (
              <li key={item.title}>
                <strong>{item.time}</strong>
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="soft-card compact-card home-recommend-card">
          <p className="page-section-title">AIからのおすすめ</p>
          <ul className="recommend-list">
            <li>面談の企業情報を整理しました</li>
            <li>次回の質問候補を6件用意しました</li>
            <li>あなたの強みを数字つきで話せるよう整えます</li>
          </ul>
        </article>

        <article className="soft-card span-2 recent-sessions-card">
          <div className="section-head home-card-head">
            <h3>最近のセッション</h3>
            <button className="text-link" type="button">
              すべて見る
            </button>
          </div>
          <div className="recent-row recent-row-home">
            {recentSessions.map(([title, date]) => (
              <div
                className="recent-session-chip recent-session-chip-home"
                key={title}
              >
                <span className="mini-icon" />
                <div className="recent-session-copy">
                  <strong>{title}</strong>
                  <span>{date}</span>
                </div>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
