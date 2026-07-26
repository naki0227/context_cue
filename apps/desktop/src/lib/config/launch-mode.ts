export type LaunchMode = 'demo' | 'new' | 'resume';
export type StorageProfile = 'demo' | 'user';

export function parseLaunchMode(value: string | undefined): LaunchMode {
  if (value === 'demo' || value === 'new') {
    return value;
  }

  return 'resume';
}

export const launchMode = parseLaunchMode(
  import.meta.env.VITE_CONTEXT_CUE_LAUNCH_MODE,
);

export const isDemoMode = launchMode === 'demo';
export const isNewMode = launchMode === 'new';

export function storageProfile(mode: LaunchMode = launchMode): StorageProfile {
  return mode === 'demo' ? 'demo' : 'user';
}
