import type { SettingsPageProps } from '@/features/dashboard/components/settings/settings-types';

type SettingsSttCardProps = Pick<
  SettingsPageProps,
  'stt' | 'sttCancelDownload' | 'sttDownloadModel' | 'sttRefresh'
>;

export function SettingsSttCard({
  stt,
  sttCancelDownload,
  sttDownloadModel,
  sttRefresh,
}: SettingsSttCardProps) {
  const stateLabel = stt.status.recording
    ? '録音中'
    : stt.status.modelInstalled
      ? '利用可能'
      : 'モデル未取得';

  return (
    <article className="soft-card settings-panel-card">
      <div className="settings-card-heading">
        <div>
          <h3>ローカル音声認識</h3>
          <p className="settings-card-description">
            マイク音声は端末内のWhisperだけで処理します。
          </p>
        </div>
        <span
          className={`runtime-status-pill ${stt.status.modelInstalled ? 'ready' : ''}`}
        >
          {stateLabel}
        </span>
      </div>

      <dl className="runtime-details">
        <div>
          <dt>モデル</dt>
          <dd>{stt.status.modelName}</dd>
        </div>
        <div>
          <dt>保存サイズ</dt>
          <dd>
            {stt.status.modelSizeBytes > 0
              ? formatBytes(stt.status.modelSizeBytes)
              : '約57 MB'}
          </dd>
        </div>
      </dl>

      <label className="settings-device-field">
        <span>入力デバイス</span>
        <select
          className="setting-select-v2 settings-device-select"
          disabled={stt.status.recording || stt.status.devices.length === 0}
          onChange={(event) => stt.setSelectedDeviceId(event.target.value)}
          value={stt.selectedDeviceId ?? ''}
        >
          <option value="">OSの標準マイク</option>
          {stt.status.devices.map((device) => (
            <option key={device.id} value={device.id}>
              {device.name}
              {device.isDefault ? '（標準）' : ''}
            </option>
          ))}
        </select>
      </label>

      <p className="settings-card-description">{stt.status.message}</p>
      {stt.progress ? (
        <div className="model-pull-progress" aria-live="polite">
          <div>
            <span>音声認識モデルを取得中</span>
            <strong>{stt.progress.percent}%</strong>
          </div>
          <progress max={100} value={stt.progress.percent} />
        </div>
      ) : null}

      <div className="settings-data-actions">
        <button
          className="outline-button small"
          disabled={stt.isChecking || stt.isDownloading}
          onClick={sttRefresh}
          type="button"
        >
          状態を再確認
        </button>
        {!stt.status.modelInstalled ? (
          <button
            className="primary-button small"
            disabled={stt.isDownloading}
            onClick={sttDownloadModel}
            type="button"
          >
            {stt.isDownloading ? '取得中' : 'モデルを取得'}
          </button>
        ) : null}
        {stt.isDownloading ? (
          <button
            className="outline-button small"
            onClick={sttCancelDownload}
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
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}
