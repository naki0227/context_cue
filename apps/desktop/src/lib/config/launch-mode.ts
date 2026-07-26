export type LaunchMode = 'demo' | 'user';

export function parseLaunchMode(value: string | undefined): LaunchMode {
  return value === 'demo' ? 'demo' : 'user';
}

export const launchMode = parseLaunchMode(
  import.meta.env.VITE_CONTEXT_CUE_LAUNCH_MODE,
);

export const isDemoMode = launchMode === 'demo';
