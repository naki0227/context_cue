import { DashboardShell } from '@/features/dashboard/components/dashboard-shell';
import { useDashboardController } from '@/features/dashboard/hooks/use-dashboard-controller';
import { SideOverlayWindow } from '@/features/overlay/components/side-overlay-window';
import { TopOverlayWindow } from '@/features/overlay/components/top-overlay-window';
import { useWindowView } from '@/features/overlay/hooks/use-window-view';
import { listeningBarIds } from '@/features/overlay/lib/content';
import { useLaunchModeGuard } from '@/lib/tauri/use-launch-mode-guard';

export function App() {
  const launchModeGuard = useLaunchModeGuard();
  const controller = useDashboardController(launchModeGuard.matches);
  const { sideOverlayWindow, topOverlayWindow } = useWindowView();

  if (!launchModeGuard.ready) {
    return <main className="launch-guard-screen">起動準備中...</main>;
  }

  if (!launchModeGuard.matches) {
    return (
      <main className="launch-guard-screen">
        <strong>起動モードが切り替わりました</strong>
        <p>古いアプリウィンドウを閉じて、もう一度起動してください。</p>
      </main>
    );
  }

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
