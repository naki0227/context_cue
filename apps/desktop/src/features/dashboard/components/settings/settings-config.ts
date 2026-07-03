import type {
  OverlayPosition,
  OverlaySectionKey,
  OverlayTheme,
} from '@/lib/state/app-store';

export const accentColors = [
  '#2d5bff',
  '#6d50ef',
  '#18b3a8',
  '#f3b11c',
  '#ef476f',
  '#9aa3b7',
];

export const sectionItems: Array<{
  key: OverlaySectionKey;
  subtitle: string;
  title: string;
  tone: string;
}> = [
  {
    key: 'assistant',
    title: 'AI アシスタント',
    subtitle: '質問への回答や提案を表示します',
    tone: 'blue',
  },
  {
    key: 'summary',
    title: '議事の要点',
    subtitle: '議論の要点や結論をリアルタイムで表示します',
    tone: 'violet',
  },
  {
    key: 'suggestions',
    title: '提案・次のアクション',
    subtitle: '推奨されるアクションや次のステップを表示します',
    tone: 'gold',
  },
  {
    key: 'transcript',
    title: '転記（トランスクリプト）',
    subtitle: '会話の文字起こしを表示します',
    tone: 'green',
  },
  {
    key: 'related',
    title: '関連情報',
    subtitle: '関連するプロジェクトやナレッジを表示します',
    tone: 'slate',
  },
];

export const behaviorItems: Array<{
  description: string;
  key:
    | 'alwaysOn'
    | 'hideOnScreenShare'
    | 'keepTranscriptPanel'
    | 'startMinimized'
    | 'highlightUnread';
  title: string;
}> = [
  {
    key: 'alwaysOn',
    title: '常に表示（Always-on）',
    description: '他のアプリの上にも常にオーバーレイを表示します。',
  },
  {
    key: 'hideOnScreenShare',
    title: '画面共有中は非表示',
    description:
      '画面共有やプレゼンテーション中はオーバーレイを非表示にします。',
  },
  {
    key: 'keepTranscriptPanel',
    title: 'トランスクリプトパネルを維持',
    description: '画面が狭い場合でも、転記パネルを折りたたまずに表示します。',
  },
  {
    key: 'startMinimized',
    title: '起動時に最小化して開始',
    description: 'アプリ起動時はオーバーレイを最小化した状態で開始します。',
  },
  {
    key: 'highlightUnread',
    title: '未読の提案をハイライト',
    description: '新しい提案やアクションがある場合にハイライトで通知します。',
  },
];

export const themeOptions: OverlayTheme[] = ['dark', 'light', 'auto'];

export const themeLabels: Record<OverlayTheme, string> = {
  dark: 'ダーク',
  light: 'ライト',
  auto: '自動',
};

export const positionOptions: OverlayPosition[] = [
  '右上',
  '上部中央',
  '右寄せ',
];

export function shadowLabel(shadow: number) {
  if (shadow < 34) return '弱';
  if (shadow < 67) return '中';
  return '強';
}
