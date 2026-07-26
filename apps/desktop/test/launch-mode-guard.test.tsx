import { renderHook, waitFor } from '@testing-library/react';
import { getRuntimeLaunchMode } from '@/lib/tauri/commands';
import { useLaunchModeGuard } from '@/lib/tauri/use-launch-mode-guard';

vi.mock('@/lib/tauri/commands', () => ({
  getRuntimeLaunchMode: vi.fn(),
}));

const getRuntimeLaunchModeMock = vi.mocked(getRuntimeLaunchMode);

describe('useLaunchModeGuard', () => {
  it('allows a matching frontend and runtime mode', async () => {
    getRuntimeLaunchModeMock.mockResolvedValue('demo');

    const { result } = renderHook(() => useLaunchModeGuard());

    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.matches).toBe(true);
  });

  it('blocks a stale window connected to another mode', async () => {
    getRuntimeLaunchModeMock.mockResolvedValue('resume');

    const { result } = renderHook(() => useLaunchModeGuard());

    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.matches).toBe(false);
  });
});
