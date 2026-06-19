import type { CSSProperties } from 'react';
import type { OverlayPreferences } from '@/lib/state/app-store';

type TopOverlayWindowProps = {
  confirmItems: string[];
  flowPoints: string[];
  listeningBarIds: string[];
  nextTalkCandidates: string[];
  overlayPreferences: OverlayPreferences;
  overlayTopic: string;
  sessionRunning: boolean;
};

function buildTopOverlayStyle(
  overlayPreferences: OverlayPreferences,
): CSSProperties {
  const isLightTheme = overlayPreferences.theme === 'light';
  const textColor = isLightTheme
    ? 'rgba(20, 31, 52, 0.94)'
    : 'rgba(255,255,255,0.96)';
  const background = isLightTheme
    ? `rgba(255,255,255,${overlayPreferences.opacity / 100})`
    : `rgba(20,26,36,${Math.max(0.42, overlayPreferences.opacity / 135)})`;

  return {
    background,
    borderRadius: `${overlayPreferences.cornerRadius + 16}px`,
    boxShadow: `0 24px ${overlayPreferences.shadow}px rgba(0, 0, 0, ${
      isLightTheme ? 0.12 : 0.22
    })`,
    color: textColor,
    fontSize: `${overlayPreferences.fontSize}px`,
    maxHeight: `${overlayPreferences.height}px`,
  };
}

export function TopOverlayWindow({
  confirmItems,
  flowPoints,
  listeningBarIds,
  nextTalkCandidates,
  overlayPreferences,
  overlayTopic,
  sessionRunning,
}: TopOverlayWindowProps) {
  const showAssistant = overlayPreferences.sections.assistant;
  const showSummary = overlayPreferences.sections.summary;
  const showSuggestions = overlayPreferences.sections.suggestions;

  return (
    <main className="top-overlay-shell">
      <section
        className={`top-overlay-card ${
          overlayPreferences.theme === 'light' ? 'light' : 'dark'
        }`}
        data-tauri-drag-region
        style={buildTopOverlayStyle(overlayPreferences)}
      >
        <header className="top-overlay-header">
          <div className="top-overlay-title">
            <span
              className="top-overlay-status-dot"
              style={{ background: overlayPreferences.accentColor }}
            />
            <span>AI Assistant</span>
          </div>
          <div
            className="top-overlay-listening"
            style={{ color: overlayPreferences.accentColor }}
          >
            <div className="mini-listening-bars" aria-hidden="true">
              {listeningBarIds.slice(0, 6).map((barId) => (
                <span
                  key={barId}
                  style={{ backgroundColor: overlayPreferences.accentColor }}
                />
              ))}
            </div>
            <span>{sessionRunning ? 'Listening...' : 'Standby...'}</span>
          </div>
        </header>

        <div className="top-overlay-grid">
          {showAssistant ? (
            <article className="overlay-panel blue compact">
              <p className="overlay-label">質問</p>
              <p className="overlay-body">{overlayTopic}</p>
            </article>
          ) : null}

          {showSummary ? (
            <article className="overlay-panel violet compact">
              <p className="overlay-label">回答の要点</p>
              <ul>
                {flowPoints.slice(0, 4).map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ) : null}

          {showSuggestions ? (
            <article className="overlay-panel gold compact">
              <p className="overlay-label">話す際のヒント</p>
              <ul>
                {nextTalkCandidates.slice(0, 3).map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ) : null}

          {showSuggestions || overlayPreferences.sections.related ? (
            <article className="overlay-panel green compact">
              <p className="overlay-label">
                {overlayPreferences.sections.related
                  ? '関連して確認したいこと'
                  : '想定追加質問'}
              </p>
              <ul>
                {confirmItems.slice(0, 3).map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ) : null}
        </div>
      </section>
    </main>
  );
}
