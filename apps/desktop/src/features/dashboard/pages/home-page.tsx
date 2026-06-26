import { useMemo } from 'react';
import {
  formatPreparedness,
  type PageId,
} from '@/features/dashboard/lib/content';
import { useWorkspaceStore } from '@/lib/state/workspace-store';

type HomePageProps = {
  onOpenPage: (page: PageId) => void;
};

export function HomePage({ onOpenPage }: HomePageProps) {
  const sessions = useWorkspaceStore((state) => state.sessions);
  const knowledgeItems = useWorkspaceStore((state) => state.knowledgeItems);
  const templates = useWorkspaceStore((state) => state.templates);
  const reviews = useWorkspaceStore((state) => state.reviews);

  const nextSession = useMemo(() => {
    return (
      sessions.find(
        (item) => item.status === '予定' || item.status === '進行中',
      ) ?? sessions[0]
    );
  }, [sessions]);

  const todaySchedule = useMemo(() => {
    return sessions.filter(
      (item) =>
        item.dateLabel.includes('今日') ||
        item.status === '予定' ||
        item.status === '進行中',
    );
  }, [sessions]);

  const recentSessions = useMemo(() => {
    return sessions.filter((item) => item.status === '完了').slice(0, 3);
  }, [sessions]);

  const readinessItems = useMemo(() => {
    const briefCount = templates.filter(
      (item) => item.tag === '事前準備',
    ).length;
    const questionCount = templates.filter(
      (item) => item.tag === '想定質問',
    ).length;
    const knowledgeCount = knowledgeItems.length;
    const reviewActionCount = reviews.reduce(
      (total, item) => total + item.actions.length,
      0,
    );

    return [
      { label: '事前ブリーフ', meta: `${briefCount}件`, tone: 'done' },
      { label: '想定質問', meta: `${questionCount}件`, tone: 'active' },
      { label: '自分の情報を整理', meta: `${knowledgeCount}件`, tone: 'idle' },
      {
        label: '確認したいこと',
        meta: `${reviewActionCount}件`,
        tone: 'arrow',
      },
    ];
  }, [knowledgeItems.length, reviews, templates]);

  const preparedness = formatPreparedness(
    readinessItems.filter((item) => item.meta !== '0件').length,
  );

  const readinessPageMap: Record<string, PageId> = {
    事前ブリーフ: 'templates',
    想定質問: 'templates',
    自分の情報を整理: 'knowledge',
    確認したいこと: 'review',
  };

  return (
    <div className="page-layout home-page-v2">
      <header className="home-page-header">
        <div>
          <h1>おはようございます、User さん</h1>
          <p>次のセッションに向けた準備と最近の流れをまとめています。</p>
        </div>
      </header>

      <div className="page-grid home-grid home-grid-polished home-grid-v2">
        {nextSession ? (
          <button
            className="soft-card hero-card next-session-card next-session-card-v2"
            onClick={() => onOpenPage('sessions')}
            type="button"
          >
            <p className="page-section-title home-section-title">
              次のセッション
            </p>
            <div className="next-session-header-v2">
              <strong className="next-session-time-plain">
                {nextSession.dateLabel.split(' ').at(-1) ??
                  nextSession.dateLabel}
              </strong>
              <span className="blue-badge">
                {nextSession.status === '進行中' ? '進行中' : '予定'}
              </span>
            </div>
            <div className="next-session-panel next-session-panel-v2">
              <div className="next-session-icon next-session-icon-v2">
                <span className="calendar-glyph" />
              </div>
              <div className="next-session-main next-session-main-v2">
                <strong className="next-session-title-v2">
                  {nextSession.title}
                </strong>
                <div className="next-session-meta-row">
                  <span className="channel-logo" />
                  <span className="meeting-channel-v2">
                    {nextSession.platform}
                  </span>
                  <span className="duration-icon" />
                  <span className="meeting-duration">
                    {nextSession.durationMinutes}分
                  </span>
                </div>
              </div>
            </div>
          </button>
        ) : null}

        <article className="soft-card compact-card home-status-card home-status-card-v2">
          <div className="section-head home-card-head">
            <p className="page-section-title home-section-title">準備状況</p>
            <span className="mini-badge">{preparedness}</span>
          </div>
          <ul className="simple-check-list readiness-list readiness-list-v2">
            {readinessItems.map((item) => (
              <li key={item.label}>
                <button
                  className="home-inline-button"
                  onClick={() => onOpenPage(readinessPageMap[item.label])}
                  type="button"
                >
                  <span className={`readiness-marker marker-${item.tone}`} />
                  <span className="check-label">{item.label}</span>
                  <strong>{item.meta}</strong>
                </button>
              </li>
            ))}
          </ul>
        </article>

        <article className="soft-card compact-card home-schedule-card home-panel-v2">
          <p className="page-section-title home-section-title">今日の予定</p>
          <ul className="agenda-list agenda-list-v2">
            {todaySchedule.slice(0, 2).map((item) => (
              <li key={item.id}>
                <button
                  className="home-inline-button"
                  onClick={() => onOpenPage('sessions')}
                  type="button"
                >
                  <strong>
                    {item.dateLabel.split(' ').at(-1) ?? item.dateLabel}
                  </strong>
                  <span>{item.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </article>

        <article className="soft-card compact-card home-recommend-card home-panel-v2">
          <p className="page-section-title home-section-title">
            AIからのおすすめ
          </p>
          <ul className="recommend-list recommend-list-v2">
            <li>
              <button
                className="home-inline-button"
                onClick={() => onOpenPage('templates')}
                type="button"
              >
                事前準備テンプレートを {templates.length} 件管理しています
              </button>
            </li>
            <li>
              <button
                className="home-inline-button"
                onClick={() => onOpenPage('review')}
                type="button"
              >
                振り返りは {reviews.length} 件、次回アクションを再利用できます
              </button>
            </li>
            <li>
              <button
                className="home-inline-button"
                onClick={() => onOpenPage('knowledge')}
                type="button"
              >
                ナレッジは {knowledgeItems.length} 件保存されています
              </button>
            </li>
          </ul>
        </article>

        <article className="soft-card span-2 recent-sessions-card recent-sessions-card-v2">
          <div className="section-head home-card-head">
            <h3>最近のセッション</h3>
            <button
              className="text-link"
              onClick={() => onOpenPage('sessions')}
              type="button"
            >
              すべて見る
            </button>
          </div>
          <div className="recent-row recent-row-home recent-row-home-v2">
            {recentSessions.map((session) => (
              <button
                className="recent-session-chip recent-session-chip-home recent-session-chip-v2"
                key={session.id}
                onClick={() => onOpenPage('review')}
                type="button"
              >
                <span className="mini-icon mini-icon-v2 icon-document" />
                <div className="recent-session-copy">
                  <strong>{session.title}</strong>
                  <span>{session.dateLabel}</span>
                </div>
                <span
                  className={`recent-session-status tone-${session.statusTone}`}
                >
                  {session.status}
                </span>
              </button>
            ))}
          </div>
        </article>
      </div>
    </div>
  );
}
