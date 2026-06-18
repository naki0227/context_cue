import { useEffect } from 'react';

export type WindowView = 'dashboard' | 'overlay-top' | 'overlay-side';

function getWindowView(): WindowView {
  if (typeof window === 'undefined') {
    return 'dashboard';
  }

  const view = new URLSearchParams(window.location.search).get('view');
  if (view === 'overlay-top' || view === 'overlay-side') {
    return view;
  }

  return 'dashboard';
}

export function useWindowView() {
  const windowView = getWindowView();

  useEffect(() => {
    document.body.dataset.view =
      windowView === 'dashboard' ? 'dashboard' : 'overlay';
    document.body.dataset.overlayKind = windowView;

    return () => {
      delete document.body.dataset.view;
      delete document.body.dataset.overlayKind;
    };
  }, [windowView]);

  return {
    sideOverlayWindow: windowView === 'overlay-side',
    topOverlayWindow: windowView === 'overlay-top',
    windowView,
  };
}
