import { useEffect } from 'react';
import { useAppStore } from '@/lib/state/app-store';
import { invokeCommand } from '@/lib/tauri/commands';
import { attachAppEvents } from '@/lib/tauri/events';

function formatConnectionStatus(isReady: boolean, label: string) {
  return `${label}: ${isReady ? '接続済み' : '未接続'}`;
}

function formatMode(mode: 'light' | 'deep') {
  return mode === 'deep' ? '深い推論' : '軽量モード';
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
          <h1>同意にもとづく会話支援を、ローカルで。</h1>
          <p className="lede">
            モック文字起こし、適応的な推論制御、軽量オーバーレイを組み合わせて、
            会話中の想起支援体験をすばやく検証できるようにしています。
          </p>
        </div>
        <aside className="status-card">
          <p>
            {formatConnectionStatus(appState.connections.ollamaReady, 'LLM')}
          </p>
          <p>{formatConnectionStatus(appState.connections.sttReady, 'STT')}</p>
          <p>推論モード: {formatMode(appState.adaptiveInference.mode)}</p>
          <p>
            質問スコア: {appState.adaptiveInference.questionScore.toFixed(2)}
          </p>
        </aside>
      </section>

      <section className="grid">
        <article className="panel">
          <h2>同意確認</h2>
          <label>
            <input
              checked={consent.participantConsent}
              onChange={(event) =>
                setConsentField('participantConsent', event.target.checked)
              }
              type="checkbox"
            />
            参加者全員が文字起こしと AI 補助の利用に同意しています。
          </label>
          <label>
            <input
              checked={consent.noCovertUse}
              onChange={(event) =>
                setConsentField('noCovertUse', event.target.checked)
              }
              type="checkbox"
            />
            このツールを隠れた補助や回答代行のためには使用しません。
          </label>
          <label>
            <input
              checked={consent.shareSafeUnderstood}
              onChange={(event) =>
                setConsentField('shareSafeUnderstood', event.target.checked)
              }
              type="checkbox"
            />
            Share Safe Mode がステルス用途ではないことを理解しています。
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
              セッション開始
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
              セッション停止
            </button>
            <button
              onClick={async () => {
                const state = await invokeCommand('toggle_share_safe_mode');
                setAppState(state);
              }}
              type="button"
            >
              Share Safe Mode 切り替え
            </button>
          </div>
        </article>

        <article className="panel">
          <h2>現在の提示内容</h2>
          <div className="cue-block">
            <p className="rec-banner">録音中 / AI 補助有効 / 同意確認済み</p>
            <p>
              <strong>話題:</strong> {appState.contextCue.topic}
            </p>
            <p>
              <strong>意図:</strong> {appState.contextCue.intent}
            </p>
            <p>
              <strong>関連メモ:</strong>{' '}
              {appState.contextCue.relatedNotes.join(' / ') || 'なし'}
            </p>
            <p>
              <strong>話すとよい要点:</strong>{' '}
              {appState.contextCue.suggestedPoints.join(' / ') || 'なし'}
            </p>
            <p>
              <strong>確認したいこと:</strong>{' '}
              {appState.contextCue.questionsToAsk.join(' / ') || 'なし'}
            </p>
            <p>
              <strong>注意:</strong> {appState.contextCue.caution}
            </p>
          </div>
        </article>

        <article className="panel">
          <h2>直近サマリー</h2>
          <p>{appState.rollingSummary.currentTopic}</p>
          <ul>
            {appState.rollingSummary.importantPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <p>
            未解決の問い:{' '}
            {appState.rollingSummary.openQuestions.join(' / ') || 'なし'}
          </p>
        </article>

        <article className="panel">
          <h2>文字起こし</h2>
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
