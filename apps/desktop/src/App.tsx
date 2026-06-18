import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '@/lib/state/app-store';
import { invokeCommand } from '@/lib/tauri/commands';
import { attachAppEvents } from '@/lib/tauri/events';

function formatConnectionStatus(isReady: boolean, label: string) {
  return `${label}: ${isReady ? '接続済み' : '未接続'}`;
}

function formatMode(mode: 'light' | 'deep') {
  return mode === 'deep' ? '深い推論' : '軽量モード';
}

const MAX_IMPORT_FILE_SIZE = 512 * 1024;

function isImportableKnowledgeFile(file: File) {
  const normalizedName = file.name.toLowerCase();
  return normalizedName.endsWith('.md') || normalizedName.endsWith('.txt');
}

function stripExtension(fileName: string) {
  return fileName.replace(/\.[^/.]+$/, '');
}

function readFileText(file: File) {
  if (typeof file.text === 'function') {
    return file.text();
  }

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(file);
  });
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [knowledgeImportNotice, setKnowledgeImportNotice] = useState('');

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
          <h2>個人ナレッジ管理</h2>
          <p>
            アプリに明示的に追加したファイルだけを参照対象にします。`.md` /
            `.txt` のみ対応し、内容はこの端末内で処理します。
          </p>
          <input
            accept=".md,.txt,text/plain,text/markdown"
            data-testid="profile-file-input"
            multiple
            onChange={async (event) => {
              const files = Array.from(event.target.files ?? []);
              const importableFiles = files.filter(isImportableKnowledgeFile);
              const oversizedFiles = importableFiles.filter(
                (file) => file.size > MAX_IMPORT_FILE_SIZE,
              );

              if (files.length === 0) {
                return;
              }

              if (importableFiles.length === 0) {
                setKnowledgeImportNotice(
                  '.md または .txt ファイルを選択してください。',
                );
                event.target.value = '';
                return;
              }

              if (oversizedFiles.length > 0) {
                setKnowledgeImportNotice(
                  '1ファイル 512KB 以内で追加してください。',
                );
                event.target.value = '';
                return;
              }

              const documents = await Promise.all(
                importableFiles.map(async (file) => ({
                  title: stripExtension(file.name),
                  content: await readFileText(file),
                })),
              );

              try {
                const previousCount = appState.importedDocuments.length;
                const state = await invokeCommand(
                  'import_profile_documents_from_files',
                  {
                    documents,
                  },
                );
                setAppState(state);
                setKnowledgeImportNotice(
                  `${state.importedDocuments.length - previousCount}件のファイルを追加しました。`,
                );
              } catch {
                setKnowledgeImportNotice(
                  'ファイルの読込に失敗しました。もう一度お試しください。',
                );
              }
              event.target.value = '';
            }}
            ref={fileInputRef}
            style={{ display: 'none' }}
            type="file"
          />
          <div className="actions">
            <button
              onClick={() => {
                fileInputRef.current?.click();
              }}
              type="button"
            >
              ファイルを選んで追加
            </button>
            <button
              onClick={async () => {
                const state = await invokeCommand('import_profile_documents');
                setAppState(state);
                setKnowledgeImportNotice(
                  'サンプル個人ナレッジを読み込みました。',
                );
              }}
              type="button"
            >
              サンプル個人ナレッジを追加
            </button>
            <button
              disabled={appState.importedDocuments.length === 0}
              onClick={async () => {
                const state = await invokeCommand('clear_profile_documents');
                setAppState(state);
                setKnowledgeImportNotice(
                  '追加済みの個人ナレッジを削除しました。',
                );
              }}
              type="button"
            >
              すべて削除
            </button>
          </div>
          <p>{knowledgeImportNotice || '未追加の状態です。'}</p>
          <p>追加済みファイル数: {appState.importedDocuments.length}</p>
          <ul className="transcript-list">
            {appState.importedDocuments.length === 0 ? (
              <li>まだ追加された個人ナレッジはありません。</li>
            ) : (
              appState.importedDocuments.map((document) => (
                <li key={document.id}>
                  <span>
                    {document.title} ({document.sourceType})
                  </span>
                  <div className="actions">
                    <button
                      onClick={async () => {
                        const state = await invokeCommand(
                          'remove_profile_document',
                          {
                            documentId: document.id,
                          },
                        );
                        setAppState(state);
                      }}
                      type="button"
                    >
                      削除
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>
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
