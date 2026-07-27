import { AppSidebar } from '@/features/dashboard/components/app-sidebar';
import type { DashboardController } from '@/features/dashboard/hooks/use-dashboard-controller';
import type { PageId } from '@/features/dashboard/lib/content';
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
      return <HomePage onOpenPage={controller.setActivePage} />;
    case 'sessions':
      return <SessionsPage />;
    case 'people':
      return <PeoplePage />;
    case 'projects':
      return <ProjectsPage />;
    case 'knowledge':
      return (
        <KnowledgePage
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
          dataActionNotice={controller.dataActionNotice}
          deleteAllLocalData={controller.deleteAllLocalData}
          exportAllData={controller.exportAllData}
          ollama={controller.ollama}
          ollamaCancelPull={controller.ollamaCancelPull}
          ollamaPullModel={controller.ollamaPullModel}
          ollamaRefresh={controller.ollamaRefresh}
          overlayPreferences={controller.overlayPreferences}
          savePreferences={controller.savePreferences}
          setConsentField={controller.setConsentField}
          setOverlayPreference={controller.setOverlayPreference}
          setSavePreference={controller.setSavePreference}
          sideOverlayVisible={controller.sideOverlayVisible}
          startSession={controller.startSession}
          stt={controller.stt}
          sttCancelDownload={controller.sttCancelDownload}
          sttDownloadModel={controller.sttDownloadModel}
          sttRefresh={controller.sttRefresh}
          stopSession={controller.stopSession}
          toggleOverlaySection={controller.toggleOverlaySection}
          toggleShareSafeMode={controller.toggleShareSafeMode}
          topOverlayVisible={controller.topOverlayVisible}
        />
      );
  }
}

export function DashboardShell({ controller }: DashboardShellProps) {
  return (
    <main className="workspace-shell">
      <section className="dashboard-grid">
        <AppSidebar
          activePage={controller.activePage}
          onChangePage={controller.setActivePage}
        />

        <div className="dashboard-main">
          {controller.runtimeError ? (
            <aside className="runtime-error-banner" role="alert">
              <span>{controller.runtimeError}</span>
              <button onClick={controller.clearRuntimeError} type="button">
                閉じる
              </button>
            </aside>
          ) : null}
          {renderPage(controller, controller.activePage)}
        </div>
      </section>
    </main>
  );
}
