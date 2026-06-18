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
      <div className="page-grid home-grid">
        <article className="soft-card hero-card">
          <div className="hero-title-row">
            <div>
              <p className="page-section-title">次のセッション</p>
              <h2>株式会社A カジュアル面談</h2>
            </div>
            <span className="blue-badge">30分後</span>
          </div>
          <div className="next-session-panel">
            <div className="next-session-time">14:00</div>
            <div>
              <strong>Google Meet</strong>
              <p>60分 / 相手: 田中さん</p>
            </div>
          </div>
        </article>

        <article className="soft-card compact-card">
          <div className="section-head">
            <p className="page-section-title">準備状況</p>
            <span className="mini-badge">{preparedness}</span>
          </div>
          <ul className="simple-check-list">
            {readinessItems.map(([label, meta]) => (
              <li key={label}>
                <span>{label}</span>
                <strong>{meta}</strong>
              </li>
            ))}
          </ul>
        </article>

        <article className="soft-card compact-card">
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

        <article className="soft-card compact-card">
          <p className="page-section-title">AIからのおすすめ</p>
          <ul className="recommend-list">
            <li>面談の企業情報を整理しました</li>
            <li>次回の質問候補を6件用意しました</li>
            <li>あなたの強みを数字つきで話せるよう整えます</li>
          </ul>
        </article>

        <article className="soft-card span-2">
          <div className="section-head">
            <h3>最近のセッション</h3>
            <button className="text-link" type="button">
              すべて見る
            </button>
          </div>
          <div className="recent-row">
            {recentSessions.map(([title, date]) => (
              <div className="recent-session-chip" key={title}>
                <span className="mini-icon" />
                <strong>{title}</strong>
                <span>{date}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
