export const sidebarItems = [
  { id: 'home', label: 'Home' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'people', label: 'People' },
  { id: 'projects', label: 'Projects / Companies' },
  { id: 'knowledge', label: 'My Knowledge' },
  { id: 'templates', label: 'Templates' },
  { id: 'review', label: 'Review' },
  { id: 'settings', label: 'Overlay Settings' },
] as const;

export type PageId = (typeof sidebarItems)[number]['id'];

export const todaySchedule = [
  {
    time: '14:00',
    title: '株式会社A カジュアル面談',
    badge: '30分後',
    meta: 'Google Meet 60分',
  },
  {
    time: '16:00',
    title: '研究室ミーティング',
    badge: '予定',
    meta: '研究室 / 302会議室',
  },
  {
    time: '18:00',
    title: 'GD練習（模擬）',
    badge: '予定',
    meta: '就活仲間 / オンライン',
  },
];

export const readinessItems = [
  {
    label: '事前ブリーフ',
    meta: '12件',
    tone: 'done',
  },
  {
    label: '想定質問',
    meta: '8件',
    tone: 'active',
  },
  {
    label: '自社カードを整理',
    meta: '0件',
    tone: 'idle',
  },
  {
    label: '確認したいこと 5件',
    meta: '',
    tone: 'arrow',
  },
];

export const recentSessions = [
  {
    title: '株式会社B 一次面接',
    date: '2024/05/20',
    status: '完了',
    tone: 'done',
    icon: 'document',
  },
  {
    title: '研究室ミーティング',
    date: '2024/05/17',
    status: '予定',
    tone: 'scheduled',
    icon: 'calendar',
  },
  {
    title: 'GD練習（模擬）',
    date: '2024/05/16',
    status: '完了',
    tone: 'done',
    icon: 'group',
  },
];

export const sessionTable = [
  [
    '株式会社A カジュアル面談',
    '面談',
    '今日 14:00',
    '田中さん / Google Meet',
    '準備中',
  ],
  ['研究室ミーティング', '会議', '今日 16:00', '研究室 / 302会議室', '予定'],
  ['GD練習（模擬）', 'GD', '今日 18:00', '就活仲間 / オンライン', '予定'],
  ['株式会社B 一次面談', '面接', '2024/05/20', '人事部 / Zoom', '完了'],
  ['先輩との1on1', '1on1', '2024/05/18', '高橋さん / カフェ', '完了'],
  ['株式会社C 最終面接', '面接', '2024/05/15', '役員 / Google Meet', '完了'],
];

export const peopleList = [
  ['田中 一郎', '株式会社A 人事部'],
  ['佐伯 花子', '面談担当 / エンジニア'],
  ['山本 健太', '研究室 先輩'],
  ['鈴木 葵', '就活エージェント'],
  ['高橋 太郎', '株式会社C 役員'],
];

export const projectCards = [
  ['株式会社A', '選考 / 面談前', '60%'],
  ['株式会社B', '選考 / 二次面接完了', '40%'],
  ['新規機能提案プロジェクト', '進行中', '70%'],
  ['研究室プロジェクト', '進行中', '50%'],
];

export const templateCards = [
  [
    '面談準備ブリーフ',
    '相手や企業情報をもとに、事前に知っておくべき情報を整理します。',
  ],
  ['想定質問生成', 'セッションのタイプに応じた想定質問を自動生成します。'],
  ['自己紹介（30秒）', '自己紹介の軸をもとに、30秒の自己紹介を作成します。'],
  ['逆質問リスト', '面談後半でも使える逆質問をシーン別に整理します。'],
  ['面接振り返りシート', '面談後の振り返りを構造化して記録・再利用します。'],
  ['会話アジェンダ作成', '面談前に目的をもとに、アジェンダを簡易作成します。'],
];

export const reviewCards = [
  {
    title: '株式会社B 一次面談',
    date: '2024/05/20 14:00-14:45',
    left: [
      '学生時代に力を入れたことは？',
      'チームでの役割は？',
      'なぜその施策を選んだのですか？',
    ],
    right: ['具体例を交えて話せた', '月間PV改善の話題で反応がよかった'],
  },
  {
    title: '研究室ミーティング',
    date: '2024/05/17',
    left: ['自分の担当方針', '詰まりの原因', '次回までのTODO'],
    right: ['前回よりも論点が明確', '次に確認すべきことを整理できた'],
  },
];

export const knowledgeTags = [
  '自己分析',
  '経験・エピソード',
  'スキル・強み',
  '研究・プロジェクト',
  '過去の発言履歴',
  'NG表現リスト',
];

export function formatPreparedness(count: number) {
  if (count >= 4) {
    return '準備完了';
  }

  if (count >= 2) {
    return '準備中';
  }

  return '未準備';
}

export function getPageTitle(page: PageId) {
  switch (page) {
    case 'home':
      return 'おはようございます、User さん';
    case 'sessions':
      return 'Sessions';
    case 'people':
      return 'People';
    case 'projects':
      return 'Projects / Companies';
    case 'knowledge':
      return 'My Knowledge';
    case 'templates':
      return 'Templates';
    case 'review':
      return 'Review';
    case 'settings':
      return 'Overlay Settings';
  }
}
