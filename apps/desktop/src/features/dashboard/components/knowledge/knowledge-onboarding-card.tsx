import { useRef, useState } from 'react';
import { UserAvatar } from '@/features/dashboard/components/user-avatar';
import {
  buildUserProfileRecord,
  KNOWLEDGE_ORGANIZER_PROMPT,
  type UserProfileInput,
} from '@/features/dashboard/lib/knowledge-profile';
import { prepareAvatarImage } from '@/features/dashboard/lib/user-avatar';
import type { KnowledgeRecord } from '@/features/dashboard/lib/workspace-types';
import { isDemoMode } from '@/lib/config/launch-mode';

type KnowledgeOnboardingCardProps = {
  initialProfile: UserProfileInput;
  onAddExample: (item: Partial<KnowledgeRecord>) => void;
  onSave: (item: KnowledgeRecord) => void;
};

const examples: Partial<KnowledgeRecord>[] = [
  {
    title: '経験・エピソード',
    tag: '経験',
    content: [
      '状況:',
      '課題:',
      '自分の役割:',
      '行動:',
      '結果・根拠:',
      '学び:',
      '話してよい範囲:',
    ],
  },
  {
    title: '強みと根拠',
    tag: 'スキル',
    content: ['強み:', '具体例:', '成果:', '数字の出典・確度:', '注意点:'],
  },
  {
    title: 'NG・注意事項',
    tag: '注意',
    content: ['話してはいけない情報:', '未確認の数字:', '避けたい表現:'],
  },
];

export function KnowledgeOnboardingCard({
  initialProfile,
  onAddExample,
  onSave,
}: KnowledgeOnboardingCardProps) {
  const [profile, setProfile] = useState(initialProfile);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'failed'>(
    'idle',
  );
  const [avatarError, setAvatarError] = useState('');
  const [avatarBusy, setAvatarBusy] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  function patch(key: keyof UserProfileInput, value: string) {
    setProfile((current) => ({ ...current, [key]: value }));
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(KNOWLEDGE_ORGANIZER_PROMPT);
      setCopyStatus('copied');
    } catch {
      setCopyStatus('failed');
    }
  }

  async function selectAvatar(file: File | undefined) {
    if (!file) {
      return;
    }

    setAvatarBusy(true);
    setAvatarError('');
    try {
      patch('avatarDataUrl', await prepareAvatarImage(file));
    } catch (error) {
      setAvatarError(
        error instanceof Error ? error.message : '画像を設定できませんでした。',
      );
    } finally {
      setAvatarBusy(false);
      if (avatarInputRef.current) {
        avatarInputRef.current.value = '';
      }
    }
  }

  return (
    <section className="soft-card knowledge-onboarding-card">
      <div className="knowledge-onboarding-intro">
        <div>
          <p className="eyebrow">はじめに</p>
          <h2>あなたの基礎情報を登録</h2>
          <p>
            ローカルに保存され、会話中の候補検索に使います。秘密鍵や本人確認番号は入力しないでください。
          </p>
        </div>
        <button
          className="secondary-button"
          onClick={() => void copyPrompt()}
          type="button"
        >
          {copyStatus === 'copied'
            ? 'コピーしました'
            : copyStatus === 'failed'
              ? 'コピーできませんでした'
              : 'AI整理プロンプトをコピー'}
        </button>
      </div>

      {!isDemoMode ? (
        <div className="knowledge-avatar-editor">
          <UserAvatar
            className="knowledge-profile-avatar"
            imageDataUrl={profile.avatarDataUrl}
          />
          <div>
            <strong>プロフィール画像</strong>
            <p>端末内に保存され、バックアップとJSON書き出しにも含まれます。</p>
            <div className="knowledge-avatar-actions">
              <button
                className="secondary-button"
                disabled={avatarBusy}
                onClick={() => avatarInputRef.current?.click()}
                type="button"
              >
                {avatarBusy ? '画像を処理中...' : '画像を選択'}
              </button>
              {profile.avatarDataUrl ? (
                <button
                  className="text-link"
                  onClick={() => patch('avatarDataUrl', '')}
                  type="button"
                >
                  画像を削除
                </button>
              ) : null}
            </div>
            {avatarError ? (
              <p className="form-error" role="alert">
                {avatarError}
              </p>
            ) : null}
          </div>
          <input
            accept="image/png,image/jpeg,image/webp"
            data-testid="user-avatar-input"
            onChange={(event) => void selectAvatar(event.target.files?.[0])}
            ref={avatarInputRef}
            type="file"
          />
        </div>
      ) : null}

      <div className="knowledge-profile-fields">
        <label>
          <span>呼ばれたい名前</span>
          <input
            maxLength={80}
            onChange={(event) => patch('displayName', event.target.value)}
            placeholder="例: 伊吹"
            value={profile.displayName}
          />
        </label>
        <label>
          <span>現在の所属・役割</span>
          <input
            maxLength={240}
            onChange={(event) => patch('role', event.target.value)}
            placeholder="例: 大学生 / 個人開発者"
            value={profile.role}
          />
        </label>
        <label>
          <span>今取り組んでいること</span>
          <input
            maxLength={240}
            onChange={(event) => patch('activities', event.target.value)}
            placeholder="例: Web開発、研究、就職活動"
            value={profile.activities}
          />
        </label>
        <label>
          <span>よく使う場面</span>
          <input
            maxLength={240}
            onChange={(event) => patch('usageScenes', event.target.value)}
            placeholder="例: 会議、1on1、カジュアル面談"
            value={profile.usageScenes}
          />
        </label>
      </div>

      <div className="knowledge-onboarding-actions">
        <button
          className="primary-button primary-button-v2"
          disabled={!profile.displayName.trim()}
          onClick={() => onSave(buildUserProfileRecord(profile))}
          type="button"
        >
          基礎情報を保存
        </button>
        <div className="knowledge-example-actions">
          <span>入力例から追加:</span>
          {examples.map((example) => (
            <button
              className="text-link"
              key={example.title}
              onClick={() => onAddExample(example)}
              type="button"
            >
              {example.title}
            </button>
          ))}
        </div>
      </div>

      <details className="knowledge-prompt-preview">
        <summary>AI整理プロンプトの内容を見る</summary>
        <pre>{KNOWLEDGE_ORGANIZER_PROMPT}</pre>
      </details>
    </section>
  );
}
