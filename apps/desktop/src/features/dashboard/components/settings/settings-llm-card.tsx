import type { SettingsPageProps } from '@/features/dashboard/components/settings/settings-types';

type SettingsLlmCardProps = Pick<
  SettingsPageProps,
  'ollama' | 'ollamaCancelPull' | 'ollamaPullModel' | 'ollamaRefresh'
>;

export function SettingsLlmCard({
  ollama,
  ollamaCancelPull,
  ollamaPullModel,
  ollamaRefresh,
}: SettingsLlmCardProps) {
  const stateLabel = ollama.status.recommendedModelInstalled
    ? '利用可能'
    : ollama.status.running
      ? 'モデル未取得'
      : '停止中';
  const installed = ollama.status.models.find(
    (model) => model.name === ollama.status.recommendedModel,
  );

  return (
    <article className="soft-card settings-panel-card settings-llm-card">
      <div className="settings-card-heading">
        <div>
          <h3>ローカルAI</h3>
          <p className="settings-card-description">
            会話内容は端末内のOllamaだけへ送ります。
          </p>
        </div>
        <span
          className={`runtime-status-pill ${ollama.status.recommendedModelInstalled ? 'ready' : ''}`}
        >
          {stateLabel}
        </span>
      </div>

      <dl className="runtime-details">
        <div>
          <dt>推奨モデル</dt>
          <dd>{ollama.status.recommendedModel}</dd>
        </div>
        <div>
          <dt>サイズ</dt>
          <dd>{installed ? formatBytes(installed.sizeBytes) : '約7.2 GB'}</dd>
        </div>
      </dl>
      <p className="settings-card-description">{ollama.status.message}</p>

      {ollama.progress ? (
        <div className="model-pull-progress" aria-live="polite">
          <div>
            <span>{ollama.progress.status}</span>
            <strong>{ollama.progress.percent}%</strong>
          </div>
          <progress max={100} value={ollama.progress.percent} />
        </div>
      ) : null}

      <div className="settings-data-actions">
        <button
          className="outline-button small"
          disabled={ollama.isChecking || ollama.isPulling}
          onClick={ollamaRefresh}
          type="button"
        >
          状態を再確認
        </button>
        {!ollama.status.recommendedModelInstalled ? (
          <button
            className="primary-button small"
            disabled={!ollama.status.running || ollama.isPulling}
            onClick={ollamaPullModel}
            type="button"
          >
            {ollama.isPulling ? '取得中' : 'モデルを取得'}
          </button>
        ) : null}
        {ollama.isPulling ? (
          <button
            className="outline-button small"
            onClick={ollamaCancelPull}
            type="button"
          >
            中止
          </button>
        ) : null}
      </div>
    </article>
  );
}

function formatBytes(bytes: number) {
  return `${(bytes / 1_000_000_000).toFixed(1)} GB`;
}
