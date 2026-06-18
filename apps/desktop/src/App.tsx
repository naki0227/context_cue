import { useEffect } from 'react';
import { useAppStore } from '@/lib/state/app-store';
import { invokeCommand } from '@/lib/tauri/commands';
import { attachAppEvents } from '@/lib/tauri/events';

function formatConnectionStatus(isReady: boolean, label: string) {
  return `${label}: ${isReady ? 'ready' : 'offline'}`;
}

export function App() {
  const {
    appState,
    consent,
    setConsentField,
    setAppState,
    startSessionLocally,
    stopSessionLocally,
  } = useAppStore();

  useEffect(() => {
    invokeCommand('get_app_state')
      .then((state) => setAppState(state))
      .catch(() => undefined);

    return attachAppEvents(useAppStore.getState());
  }, [setAppState]);

  const canStart =
    consent.participantConsent &&
    consent.noCovertUse &&
    consent.shareSafeUnderstood &&
    appState.session.status !== 'running';

  return (
    <main className="app-shell">
      <section className="hero">
        <div>
          <p className="eyebrow">Context Cue / How to Talk</p>
          <h1>Consent-based conversation recall, locally.</h1>
          <p className="lede">
            Mock transcript, adaptive inference, and a lightweight overlay
            scaffold are wired in so we can iterate on the real UX quickly.
          </p>
        </div>
        <aside className="status-card">
          <p>
            {formatConnectionStatus(appState.connections.ollamaReady, 'LLM')}
          </p>
          <p>{formatConnectionStatus(appState.connections.sttReady, 'STT')}</p>
          <p>Mode: {appState.adaptiveInference.mode}</p>
          <p>
            Question score:{' '}
            {appState.adaptiveInference.questionScore.toFixed(2)}
          </p>
        </aside>
      </section>

      <section className="grid">
        <article className="panel">
          <h2>Consent Gate</h2>
          <label>
            <input
              checked={consent.participantConsent}
              onChange={(event) =>
                setConsentField('participantConsent', event.target.checked)
              }
              type="checkbox"
            />
            All participants agreed to transcription and AI assistance.
          </label>
          <label>
            <input
              checked={consent.noCovertUse}
              onChange={(event) =>
                setConsentField('noCovertUse', event.target.checked)
              }
              type="checkbox"
            />
            I will not use this tool for covert assistance or answer
            outsourcing.
          </label>
          <label>
            <input
              checked={consent.shareSafeUnderstood}
              onChange={(event) =>
                setConsentField('shareSafeUnderstood', event.target.checked)
              }
              type="checkbox"
            />
            I understand Share Safe Mode is not stealth mode.
          </label>

          <div className="actions">
            <button
              disabled={!canStart}
              onClick={async () => {
                startSessionLocally();
                const state = await invokeCommand('start_session', {
                  consent,
                });
                setAppState(state);
              }}
              type="button"
            >
              Start Session
            </button>
            <button
              disabled={appState.session.status !== 'running'}
              onClick={async () => {
                stopSessionLocally();
                const state = await invokeCommand('stop_session');
                setAppState(state);
              }}
              type="button"
            >
              Stop Session
            </button>
            <button
              onClick={async () => {
                const state = await invokeCommand('toggle_share_safe_mode');
                setAppState(state);
              }}
              type="button"
            >
              Toggle Share Safe Mode
            </button>
          </div>
        </article>

        <article className="panel">
          <h2>Current Cue</h2>
          <div className="cue-block">
            <p className="rec-banner">
              REC / AI Assist Active / Consent Confirmed
            </p>
            <p>
              <strong>Topic:</strong> {appState.contextCue.topic}
            </p>
            <p>
              <strong>Intent:</strong> {appState.contextCue.intent}
            </p>
            <p>
              <strong>Notes:</strong>{' '}
              {appState.contextCue.relatedNotes.join(' / ') || 'None'}
            </p>
            <p>
              <strong>Points:</strong>{' '}
              {appState.contextCue.suggestedPoints.join(' / ') || 'None'}
            </p>
            <p>
              <strong>Ask:</strong>{' '}
              {appState.contextCue.questionsToAsk.join(' / ') || 'None'}
            </p>
            <p>
              <strong>Caution:</strong> {appState.contextCue.caution}
            </p>
          </div>
        </article>

        <article className="panel">
          <h2>Rolling Summary</h2>
          <p>{appState.rollingSummary.currentTopic}</p>
          <ul>
            {appState.rollingSummary.importantPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <p>
            Open questions:{' '}
            {appState.rollingSummary.openQuestions.join(' / ') || 'None'}
          </p>
        </article>

        <article className="panel">
          <h2>Transcript</h2>
          <ul className="transcript-list">
            {appState.transcript.map((chunk) => (
              <li key={chunk.id}>
                <span>{chunk.text}</span>
                <small>{chunk.source}</small>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </main>
  );
}
