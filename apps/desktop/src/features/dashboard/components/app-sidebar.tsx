import { type PageId, sidebarItems } from '@/features/dashboard/lib/content';

type AppSidebarProps = {
  activePage: PageId;
  onChangePage: (page: PageId) => void;
};

export function AppSidebar({ activePage, onChangePage }: AppSidebarProps) {
  return (
    <aside className="sidebar-card">
      <div className="sidebar-brand">
        <div className="brand-badge">CO</div>
        <div>
          <strong>Context Overlay</strong>
          <p>Local-first OSS</p>
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
            {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-user">
        <div className="user-avatar" />
        <div>
          <strong>User</strong>
          <p>Open Source Edition</p>
        </div>
      </div>
    </aside>
  );
}
