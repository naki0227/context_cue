import { parseLaunchMode, storageProfile } from '@/lib/config/launch-mode';
import {
  createEmptyWorkspace,
  createInitialWorkspace,
} from '@/lib/state/workspace-defaults';

describe('launch mode', () => {
  it('defaults to resume unless demo or new is explicit', () => {
    expect(parseLaunchMode(undefined)).toBe('resume');
    expect(parseLaunchMode('unexpected')).toBe('resume');
    expect(parseLaunchMode('user')).toBe('resume');
    expect(parseLaunchMode('demo')).toBe('demo');
    expect(parseLaunchMode('new')).toBe('new');
  });

  it('starts new and resume modes without bundled sample records', () => {
    expect(createInitialWorkspace('new')).toEqual(createEmptyWorkspace());
    expect(createInitialWorkspace('resume')).toEqual(createEmptyWorkspace());
  });

  it('starts demo mode with sample records', () => {
    const workspace = createInitialWorkspace('demo');

    expect(workspace.sessions.length).toBeGreaterThan(0);
    expect(workspace.people.length).toBeGreaterThan(0);
  });

  it('shares user settings between new and resume but isolates demo', () => {
    expect(storageProfile('new')).toBe(storageProfile('resume'));
    expect(storageProfile('resume')).not.toBe(storageProfile('demo'));
  });
});
