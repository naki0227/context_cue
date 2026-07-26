import type { KnowledgeRecord } from '@/features/dashboard/lib/workspace-types';

export const USER_PROFILE_ID = 'knowledge-user-profile';

export type UserProfileInput = {
  activities: string;
  displayName: string;
  role: string;
  usageScenes: string;
};

const FIELD_LABELS: Record<keyof UserProfileInput, string> = {
  displayName: '呼ばれたい名前',
  role: '現在の所属・役割',
  activities: '今取り組んでいること',
  usageScenes: 'よく使う場面',
};

export const KNOWLEDGE_ORGANIZER_PROMPT = `あなたは、会話中に本人が事実を思い出すための個人ナレッジを整理する編集者です。
入力された事実だけを使い、回答の代作や情報の捏造はしないでください。

必須ルール:
1. 入力にない事実・数字・固有名詞を補わない
2. 不明点は「未確認」と書く
3. 推測は「本人の解釈」と明記する
4. パスワード、APIキー、秘密鍵、口座、本人確認番号を除外する
5. 第三者の不要な個人情報を匿名化する
6. 数字には出典または確度を付ける
7. 完成回答ではなく、短い事実メモとして整理する

出力項目:
- タイトル
- 分類
- 更新日
- 出典
- 確度
- 機密度
- 利用場面
- 事実
- 自分の役割・判断
- 根拠・数字
- 学び・次の行動
- 話してよい範囲
- 確認質問（最大5個）`;

export function buildUserProfileRecord(
  input: UserProfileInput,
  updatedAt = new Date().toLocaleDateString('ja-JP'),
): KnowledgeRecord {
  return {
    id: USER_PROFILE_ID,
    title: '基本プロフィール',
    tag: '基本情報',
    updatedAt,
    source: 'manual',
    content: (Object.keys(FIELD_LABELS) as (keyof UserProfileInput)[]).map(
      (key) => `${FIELD_LABELS[key]}: ${normalizeField(input[key])}`,
    ),
  };
}

export function readUserProfile(
  knowledgeItems: KnowledgeRecord[],
): UserProfileInput {
  const profile = knowledgeItems.find((item) => item.id === USER_PROFILE_ID);
  const entries = new Map(
    profile?.content.map((line) => {
      const separator = line.indexOf(':');
      return separator < 0
        ? [line.trim(), '']
        : [line.slice(0, separator).trim(), line.slice(separator + 1).trim()];
    }) ?? [],
  );

  return {
    displayName: entries.get(FIELD_LABELS.displayName) ?? '',
    role: entries.get(FIELD_LABELS.role) ?? '',
    activities: entries.get(FIELD_LABELS.activities) ?? '',
    usageScenes: entries.get(FIELD_LABELS.usageScenes) ?? '',
  };
}

export function getUserDisplayName(knowledgeItems: KnowledgeRecord[]) {
  return readUserProfile(knowledgeItems).displayName || 'User';
}

function normalizeField(value: string) {
  return value.trim().replaceAll(/\s+/g, ' ').slice(0, 240);
}
