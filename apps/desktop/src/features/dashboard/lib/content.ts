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
