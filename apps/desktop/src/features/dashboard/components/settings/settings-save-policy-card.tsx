import type { SettingsPageProps } from '@/features/dashboard/components/settings/settings-types';

type SettingsSavePolicyCardProps = Pick<
  SettingsPageProps,
  'savePreferences' | 'setSavePreference'
>;

const saveItems = [
  {
    key: 'transcript',
    title: '文字起こしを保存',
    description: 'セッション終了後に発言テキストをReviewへ残します。',
  },
  {
    key: 'summary',
    title: '要約を保存',
    description: '現在の話題、重要な要点、未解決事項を残します。',
  },
  {
    key: 'aiOutput',
    title: 'AI提案を保存',
    description: '関連メモ、提案、確認事項、注意点を残します。',
  },
] as const;

export function SettingsSavePolicyCard({
  savePreferences,
  setSavePreference,
}: SettingsSavePolicyCardProps) {
  return (
    <article className="soft-card settings-panel-card">
      <h3>保存ポリシー</h3>
      <p className="settings-card-description">
        生音声は常に保存しません。以下はすべて既定でOFFです。
      </p>
      <div className="settings-toggle-list">
        {saveItems.map((item) => (
          <div className="settings-toggle-row" key={item.key}>
            <div>
              <strong>{item.title}</strong>
              <p>{item.description}</p>
            </div>
            <button
              aria-label={item.title}
              aria-pressed={savePreferences[item.key]}
              className={`switch ${savePreferences[item.key] ? 'on' : ''}`}
              onClick={() =>
                setSavePreference(item.key, !savePreferences[item.key])
              }
              type="button"
            >
              <span />
            </button>
          </div>
        ))}
      </div>
    </article>
  );
}
