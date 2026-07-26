import { useEffect, useState } from 'react';
import { launchMode } from '@/lib/config/launch-mode';
import { getRuntimeLaunchMode } from '@/lib/tauri/commands';

export function useLaunchModeGuard() {
  const [ready, setReady] = useState(false);
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    let active = true;

    getRuntimeLaunchMode()
      .then((runtimeMode) => {
        if (active) {
          setMatches(runtimeMode === launchMode);
          setReady(true);
        }
      })
      .catch(() => {
        if (active) {
          setReady(true);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return { matches, ready };
}
