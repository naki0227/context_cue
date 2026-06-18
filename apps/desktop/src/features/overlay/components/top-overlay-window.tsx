type TopOverlayWindowProps = {
  confirmItems: string[];
  flowPoints: string[];
  listeningBarIds: string[];
  nextTalkCandidates: string[];
  overlayTopic: string;
  sessionRunning: boolean;
};

export function TopOverlayWindow({
  confirmItems,
  flowPoints,
  listeningBarIds,
  nextTalkCandidates,
  overlayTopic,
  sessionRunning,
}: TopOverlayWindowProps) {
  return (
    <main className="top-overlay-shell">
      <section className="top-overlay-card" data-tauri-drag-region>
        <header className="top-overlay-header">
          <div className="top-overlay-title">
            <span className="top-overlay-status-dot" />
            <span>AI Assistant</span>
          </div>
          <div className="top-overlay-listening">
            <div className="mini-listening-bars" aria-hidden="true">
              {listeningBarIds.slice(0, 6).map((barId) => (
                <span key={barId} />
              ))}
            </div>
            <span>{sessionRunning ? 'Listening...' : 'Listening...'}</span>
          </div>
        </header>

        <div className="top-overlay-grid">
          <article className="overlay-panel blue compact">
            <p className="overlay-label">質問</p>
            <p className="overlay-body">{overlayTopic}</p>
          </article>
          <article className="overlay-panel violet compact">
            <p className="overlay-label">回答の要点</p>
            <ul>
              {flowPoints.slice(0, 4).map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
          <article className="overlay-panel gold compact">
            <p className="overlay-label">話す際のヒント</p>
            <ul>
              {nextTalkCandidates.slice(0, 3).map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
          <article className="overlay-panel green compact">
            <p className="overlay-label">想定追加質問</p>
            <ul>
              {confirmItems.slice(0, 3).map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </main>
  );
}
