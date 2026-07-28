import { UserAvatar } from '@/features/dashboard/components/user-avatar';
import { type PageId, sidebarItems } from '@/features/dashboard/lib/content';
import {
  getUserDisplayName,
  readUserProfile,
} from '@/features/dashboard/lib/knowledge-profile';
import { isDemoMode, isNewMode } from '@/lib/config/launch-mode';
import { useWorkspaceStore } from '@/lib/state/workspace-store';

type AppSidebarProps = {
  activePage: PageId;
  onChangePage: (page: PageId) => void;
};

export function AppSidebar({ activePage, onChangePage }: AppSidebarProps) {
  const displayName = useWorkspaceStore((state) =>
    getUserDisplayName(state.knowledgeItems),
  );
  const avatarDataUrl = useWorkspaceStore(
    (state) => readUserProfile(state.knowledgeItems).avatarDataUrl,
  );
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
      case 'documentation':
        return 'documentation';
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

      <button
        className="sidebar-user sidebar-user-button"
        onClick={() => onChangePage('knowledge')}
        type="button"
      >
        <UserAvatar imageDataUrl={isDemoMode ? '' : avatarDataUrl} />
        <div>
          <strong>{displayName}</strong>
          <p>
            {isDemoMode
              ? 'Demo Workspace'
              : isNewMode
                ? 'New Workspace'
                : 'Open Source Edition'}
          </p>
        </div>
      </button>
    </aside>
  );
}
