import type { SettingsPageProps } from '@/features/dashboard/components/settings/settings-types';

type SettingsDataCardProps = Pick<
  SettingsPageProps,
  'dataActionNotice' | 'deleteAllLocalData' | 'exportAllData'
>;

export function SettingsDataCard({
  dataActionNotice,
  deleteAllLocalData,
  exportAllData,
}: SettingsDataCardProps) {
  return (
    <article className="soft-card settings-panel-card settings-mini-card">
      <h3>ローカルデータ</h3>
      <p className="settings-card-description">
        データは端末内に保存されます。定期的にエクスポートできます。
      </p>
      <div className="settings-data-actions">
        <button
          className="outline-button small"
          onClick={exportAllData}
          type="button"
        >
          すべて書き出す
        </button>
        <button
          className="danger-button small"
          onClick={deleteAllLocalData}
          type="button"
        >
          すべて削除
        </button>
      </div>
      {dataActionNotice ? (
        <p className="settings-action-notice" role="status">
          {dataActionNotice}
        </p>
      ) : null}
    </article>
  );
}
