import type { TemplateRecord } from '@/features/dashboard/lib/workspace-types';

export const STARTER_TEMPLATE_LIBRARY_VERSION = 1;

const starterTemplates: TemplateRecord[] = [
  {
    id: 'starter-conversation-brief',
    title: '会話前ブリーフ',
    description: '目的と前提を短く整理し、会話で確認することを準備します。',
    tag: '事前準備',
    icon: 'doc',
    tone: 'blue',
    updatedAt: '標準',
    body: [
      '目的',
      '相手・参加者',
      '前提情報',
      '話したいこと',
      '確認したいこと',
    ],
  },
  {
    id: 'starter-question-list',
    title: '確認質問リスト',
    description: '曖昧な点や意思決定に必要な質問を、優先順に整理します。',
    tag: '想定質問',
    icon: 'question',
    tone: 'slate',
    updatedAt: '標準',
    body: [
      '最優先の質問',
      '背景を知る質問',
      '条件を確認する質問',
      '次の行動を決める質問',
    ],
  },
  {
    id: 'starter-meeting-notes',
    title: '会議・議事メモ',
    description: '論点、決定事項、担当、期限を一つの型で記録します。',
    tag: '議事メモ',
    icon: 'edit',
    tone: 'green',
    updatedAt: '標準',
    body: ['議題', '主な意見', '決定事項', '未決事項', '担当と期限'],
  },
  {
    id: 'starter-one-on-one',
    title: '1on1準備',
    description: '近況、相談、フィードバック、次の行動を事前に整理します。',
    tag: '事前準備',
    icon: 'chat',
    tone: 'violet',
    updatedAt: '標準',
    body: [
      '近況',
      'うまくいっていること',
      '困っていること',
      '相談したいこと',
      '次の行動',
    ],
  },
  {
    id: 'starter-group-discussion',
    title: 'グループディスカッション整理',
    description: '論点と比較軸を共有し、議論を前へ進めるためのメモです。',
    tag: 'その他',
    icon: 'building',
    tone: 'orange',
    updatedAt: '標準',
    body: [
      'テーマ',
      '前提・定義',
      '現在の論点',
      '比較軸',
      '意見と根拠',
      '残り時間と結論',
    ],
  },
  {
    id: 'starter-session-review',
    title: 'セッション振り返り',
    description: '会話の成果と改善点を残し、次回の準備へつなげます。',
    tag: '振り返り',
    icon: 'list',
    tone: 'blue',
    updatedAt: '標準',
    body: [
      '達成できたこと',
      '重要な学び',
      '改善したいこと',
      '未確認事項',
      '次の行動',
    ],
  },
];

export function createStarterTemplates(): TemplateRecord[] {
  return starterTemplates.map((template) => ({
    ...template,
    body: [...template.body],
  }));
}
