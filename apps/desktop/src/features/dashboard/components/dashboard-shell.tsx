import { AppSidebar } from '@/features/dashboard/components/app-sidebar';
import type { DashboardController } from '@/features/dashboard/hooks/use-dashboard-controller';
import { getPageTitle, type PageId } from '@/features/dashboard/lib/content';
import { HomePage } from '@/features/dashboard/pages/home-page';
import { KnowledgePage } from '@/features/dashboard/pages/knowledge-page';
import { PeoplePage } from '@/features/dashboard/pages/people-page';
import { ProjectsPage } from '@/features/dashboard/pages/projects-page';
import { ReviewPage } from '@/features/dashboard/pages/review-page';
import { SessionsPage } from '@/features/dashboard/pages/sessions-page';
import { SettingsPage } from '@/features/dashboard/pages/settings-page';
import { TemplatesPage } from '@/features/dashboard/pages/templates-page';

type DashboardShellProps = {
  controller: DashboardController;
};

function renderPage(controller: DashboardController, activePage: PageId) {
  switch (activePage) {
    case 'home':
      return (
        <HomePage
          onOpenPage={controller.setActivePage}
          preparedness={controller.preparedness}
        />
      );
    case 'sessions':
      return <SessionsPage />;
    case 'people':
      return <PeoplePage />;
    case 'projects':
      return <ProjectsPage />;
    case 'knowledge':
      return (
        <KnowledgePage
          appState={controller.appState}
          fileInputRef={controller.fileInputRef}
          importLocalFiles={controller.importLocalFiles}
          importSampleKnowledge={controller.importSampleKnowledge}
          knowledgeImportNotice={controller.knowledgeImportNotice}
          removeProfileDocument={controller.removeProfileDocument}
        />
      );
    case 'templates':
      return <TemplatesPage />;
    case 'review':
      return <ReviewPage />;
    case 'settings':
      return (
        <SettingsPage
          appState={controller.appState}
          canStart={controller.canStart}
          clearProfileDocuments={controller.clearProfileDocuments}
          consent={controller.consent}
          overlayPreferences={controller.overlayPreferences}
          setConsentField={controller.setConsentField}
          setOverlayPreference={controller.setOverlayPreference}
          sideOverlayVisible={controller.sideOverlayVisible}
          startSession={controller.startSession}
          stopSession={controller.stopSession}
          toggleOverlaySection={controller.toggleOverlaySection}
          toggleShareSafeMode={controller.toggleShareSafeMode}
          topOverlayVisible={controller.topOverlayVisible}
        />
      );
  }
}

export function DashboardShell({ controller }: DashboardShellProps) {
  const title = getPageTitle(controller.activePage);
  const showPageHeader = controller.activePage === 'knowledge';

  return (
    <main className="workspace-shell">
      <section className="dashboard-grid">
        <AppSidebar
          activePage={controller.activePage}
          onChangePage={controller.setActivePage}
        />

        <div className="dashboard-main">
          {showPageHeader ? (
            <header className="page-header">
              <div>
                <h1>{title}</h1>
                <p>
                  画像の構成に合わせて、一覧と詳細を見やすく整理しています。
                </p>
              </div>
            </header>
          ) : null}

          {renderPage(controller, controller.activePage)}
        </div>
      </section>
    </main>
  );
}
