import { type PageId, sidebarItems } from '@/features/dashboard/lib/content';

type AppSidebarProps = {
  activePage: PageId;
  onChangePage: (page: PageId) => void;
};

export function AppSidebar({ activePage, onChangePage }: AppSidebarProps) {
  function navIconClass(page: PageId) {
    switch (page) {
      case 'home':
        return 'home';
      case 'sessions':
        return 'sessions';
      case 'people':
        return 'people';
      case 'projects':
        return 'projects';
      case 'knowledge':
        return 'knowledge';
      case 'templates':
        return 'templates';
      case 'review':
        return 'review';
      case 'settings':
        return 'settings';
    }
  }

  return (
    <aside className="sidebar-card">
      <div className="sidebar-brand sidebar-brand-v2">
        <div className="brand-badge brand-badge-v2">CO</div>
        <div>
          <strong>Context Overlay</strong>
        </div>
      </div>

      <nav className="sidebar-nav">
        {sidebarItems.map((item) => (
          <button
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            key={item.id}
            onClick={() => onChangePage(item.id)}
            type="button"
          >
            <span className={`nav-icon nav-icon-${navIconClass(item.id)}`} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar user-avatar-v2" />
        <div>
          <strong>User</strong>
          <p>Open Source Edition</p>
        </div>
      </div>
    </aside>
  );
}
