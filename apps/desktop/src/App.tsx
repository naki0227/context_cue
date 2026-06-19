import { DashboardShell } from '@/features/dashboard/components/dashboard-shell';
import { useDashboardController } from '@/features/dashboard/hooks/use-dashboard-controller';
import { SideOverlayWindow } from '@/features/overlay/components/side-overlay-window';
import { TopOverlayWindow } from '@/features/overlay/components/top-overlay-window';
import { useWindowView } from '@/features/overlay/hooks/use-window-view';
import { listeningBarIds } from '@/features/overlay/lib/content';

export function App() {
  const controller = useDashboardController();
  const { sideOverlayWindow, topOverlayWindow } = useWindowView();

  if (topOverlayWindow) {
    return (
      <TopOverlayWindow
        confirmItems={controller.confirmItems}
        flowPoints={controller.flowPoints}
        listeningBarIds={listeningBarIds}
        nextTalkCandidates={controller.nextTalkCandidates}
        overlayTopic={controller.overlayTopic}
        overlayPreferences={controller.overlayPreferences}
        sessionRunning={controller.appState.session.status === 'running'}
      />
    );
  }

  if (sideOverlayWindow) {
    return (
      <SideOverlayWindow
        listeningBarIds={listeningBarIds}
        memoItems={controller.memoItems}
        overlayPreferences={controller.overlayPreferences}
        transcriptPreview={controller.transcriptPreview}
      />
    );
  }

  return <DashboardShell controller={controller} />;
}
