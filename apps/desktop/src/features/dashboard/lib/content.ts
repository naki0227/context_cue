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
  {
    title: '株式会社A カジュアル面談',
    type: '面談',
    date: '今日 14:00',
    partner: '田中さん / Google Meet',
    recording: '録画中',
    status: '完了',
    memo: '志望動機と今後のキャリアについて深掘り',
    typeTone: 'green',
    recordingTone: 'blue',
    statusTone: 'green',
  },
  {
    title: '研究室ミーティング',
    type: '会議',
    date: '今日 16:00',
    partner: '研究室 / 302会議室',
    recording: '',
    status: '予定',
    memo: '進捗共有と今後の方針確認',
    typeTone: 'green',
    recordingTone: 'neutral',
    statusTone: 'blue',
  },
  {
    title: 'GD練習（模擬）',
    type: 'GD',
    date: '今日 18:00',
    partner: '就活仲間 / オンライン',
    recording: '',
    status: '予定',
    memo: 'テーマ: 新しい教育サービスの提案',
    typeTone: 'violet',
    recordingTone: 'neutral',
    statusTone: 'blue',
  },
  {
    title: '株式会社B 一次面接',
    type: '面接',
    date: '2024/05/20 10:00',
    partner: '人事部 / Zoom',
    recording: '',
    status: '完了',
    memo: '自己紹介、ガクチカ、志望動機',
    typeTone: 'orange',
    recordingTone: 'neutral',
    statusTone: 'green',
  },
  {
    title: '先輩との1on1',
    type: '1on1',
    date: '2024/05/18 15:30',
    partner: '佐藤さん / カフェ',
    recording: '',
    status: '完了',
    memo: 'キャリアの悩み相談とアドバイス',
    typeTone: 'gold',
    recordingTone: 'neutral',
    statusTone: 'green',
  },
  {
    title: '株式会社C 最終面接',
    type: '面接',
    date: '2024/05/15 14:00',
    partner: '役員 / Google Meet',
    recording: '',
    status: '完了',
    memo: '逆質問、入社後のミッションについて',
    typeTone: 'orange',
    recordingTone: 'neutral',
    statusTone: 'green',
  },
  {
    title: 'TOEIC対策授業 Day3',
    type: '授業',
    date: '2024/05/12 09:00',
    partner: 'オンライン授業 / Zoom',
    recording: '',
    status: '完了',
    memo: 'Part 5、6の演習と解説',
    typeTone: 'violet',
    recordingTone: 'neutral',
    statusTone: 'green',
  },
  {
    title: 'インターン選考説明会',
    type: 'その他',
    date: '2024/05/10 11:00',
    partner: '株式会社D / オンライン',
    recording: '',
    status: '完了',
    memo: 'インターンの概要と選考フロー',
    typeTone: 'gray',
    recordingTone: 'neutral',
    statusTone: 'green',
  },
];

export const peopleList = [
  {
    name: '田中 一郎',
    role: '株式会社A 人事部 採用担当',
    shortRole: '面談官・採用担当',
    mail: 'ichiro.tanaka@company-a.com',
    updatedAt: '2024/05/12',
  },
  {
    name: '佐藤 花子',
    role: '事業開発部 エンジニア',
    shortRole: '社員・先輩',
    mail: 'hanako.sato@company-a.com',
    updatedAt: '2024/05/08',
  },
  {
    name: '山本 健太',
    role: '研究室 先輩',
    shortRole: '社員・先輩',
    mail: 'kenta.yamamoto@example.com',
    updatedAt: '2024/05/05',
  },
  {
    name: '鈴木 葵',
    role: '就活エージェント',
    shortRole: 'その他',
    mail: 'aoi.suzuki@career.jp',
    updatedAt: '2024/04/28',
  },
  {
    name: '高橋 太郎',
    role: '株式会社C 役員',
    shortRole: '面談官・採用担当',
    mail: 'taro.takahashi@company-c.com',
    updatedAt: '2024/04/20',
  },
  {
    name: '伊藤 翔',
    role: 'プロダクトマネージャー',
    shortRole: 'メンバー・同僚',
    mail: 'sho.ito@product.example',
    updatedAt: '2024/04/12',
  },
  {
    name: '中村 美咲',
    role: 'データサイエンティスト',
    shortRole: 'メンバー・同僚',
    mail: 'misaki.nakamura@lab.example',
    updatedAt: '2024/04/10',
  },
  {
    name: '渡辺 悠斗',
    role: '営業部 リーダー',
    shortRole: 'その他',
    mail: 'yuto.watanabe@sales.example',
    updatedAt: '2024/04/05',
  },
];

export const projectCards = [
  {
    title: '株式会社カジュアル酒場',
    category: '企業',
    subtitle: '居酒屋業 / 飲食サービス',
    progress: '60%',
    sessions: 12,
    issues: 8,
    updatedAt: '今日 14:00',
    tone: 'violet',
    icon: 'company',
  },
  {
    title: '新規事業プロジェクト',
    category: 'プロジェクト',
    subtitle: '新規事業開発',
    progress: '70%',
    sessions: 15,
    issues: 10,
    updatedAt: '今日 09:30',
    tone: 'green',
    icon: 'chart',
  },
  {
    title: '株式会社Aコンサルティング',
    category: '企業',
    subtitle: '経営コンサルティング',
    progress: '40%',
    sessions: 9,
    issues: 6,
    updatedAt: '昨日 18:45',
    tone: 'violet',
    icon: 'company',
  },
  {
    title: '採用強化プロジェクト',
    category: 'プロジェクト',
    subtitle: '人事・採用支援',
    progress: '50%',
    sessions: 8,
    issues: 5,
    updatedAt: '昨日 16:20',
    tone: 'green',
    icon: 'people',
  },
  {
    title: '株式会社Bサービス',
    category: '企業',
    subtitle: 'ITサービス / SaaS',
    progress: '30%',
    sessions: 7,
    issues: 4,
    updatedAt: '2024/05/11',
    tone: 'violet',
    icon: 'company',
  },
  {
    title: 'マーケティング改善プロジェクト',
    category: 'プロジェクト',
    subtitle: 'マーケティング支援',
    progress: '20%',
    sessions: 6,
    issues: 3,
    updatedAt: '2024/05/10',
    tone: 'green',
    icon: 'target',
  },
  {
    title: '株式会社Cテクノロジー',
    category: '企業',
    subtitle: 'ソフトウェア開発',
    progress: '10%',
    sessions: 5,
    issues: 2,
    updatedAt: '2024/05/08',
    tone: 'violet',
    icon: 'company',
  },
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
