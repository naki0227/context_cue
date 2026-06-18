import { listeningBarIds } from '@/features/overlay/lib/content';

type OverlayPreviewProps = {
  confirmItems: string[];
  flowPoints: string[];
  nextTalkCandidates: string[];
  overlayTopic: string;
  sessionStatus: string;
  sideOverlayVisible: boolean;
  topOverlayVisible: boolean;
};

export function OverlayPreview({
  confirmItems,
  flowPoints,
  nextTalkCandidates,
  overlayTopic,
  sessionStatus,
  sideOverlayVisible,
  topOverlayVisible,
}: OverlayPreviewProps) {
  return (
    <article className="preview-surface">
      <div className="preview-topline">
        <p className="page-section-title">セッション詳細</p>
        <span className="mini-badge">
          {sessionStatus === 'running' ? '録音中' : '待機中'}
        </span>
      </div>
      <div className="meeting-shell">
        <div className="overlay-strip">
          <article className="overlay-panel blue">
            <p className="overlay-label">質問</p>
            <p className="overlay-body">{overlayTopic}</p>
          </article>
          <article className="overlay-panel violet">
            <p className="overlay-label">回答の要点</p>
            <ul>
              {flowPoints.slice(0, 4).map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
          <article className="overlay-panel gold">
            <p className="overlay-label">話す際のヒント</p>
            <ul>
              {nextTalkCandidates.slice(0, 3).map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
          <article className="overlay-panel green">
            <p className="overlay-label">想定追加質問</p>
            <ul>
              {confirmItems.slice(0, 3).map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        </div>

        <div className="meeting-stage">
          <div className="avatar-backdrop" />
          <div className="avatar-card">
            <div className="avatar-head" />
            <div className="avatar-body" />
          </div>

          <aside className="transcript-dock">
            <div className="dock-tabs">
              <button className="dock-tab active" type="button">
                文字起こし
              </button>
              <button className="dock-tab" type="button">
                要約
              </button>
            </div>

            <div className="dock-feed">
              <p className="speaker-line">
                <span className="speaker-name other">相手</span>
                学生時代に力を入れたことについて教えてください。
              </p>
              <p className="speaker-line">
                <span className="speaker-name you">あなた</span>
                はい、大学時代にUSJでのアルバイトに力を入れました。
              </p>
              <p className="speaker-line">
                <span className="speaker-name other">相手</span>
                なるほど、具体的にどのような課題があったのですか？
              </p>
            </div>

            <div className="dock-footer">
              <span>AIが聞いています...</span>
              <div className="listening-bars" aria-hidden="true">
                {listeningBarIds.map((barId) => (
                  <span key={barId} />
                ))}
              </div>
            </div>
          </aside>

          <div className="overlay-visibility-pills">
            <span className={topOverlayVisible ? 'visible' : 'hidden'}>
              上部: {topOverlayVisible ? '表示中' : '非表示'}
            </span>
            <span className={sideOverlayVisible ? 'visible' : 'hidden'}>
              右側: {sideOverlayVisible ? '表示中' : '非表示'}
            </span>
          </div>

          <div className="meeting-footer">
            <div className="meeting-meta">
              <span>14:35</span>
              <span>Meeting ID: abc-defg-hij</span>
            </div>

            <div className="meeting-controls">
              <button className="control-button" type="button" />
              <button className="control-button" type="button" />
              <button className="control-button primary" type="button" />
              <button className="control-button danger" type="button" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
