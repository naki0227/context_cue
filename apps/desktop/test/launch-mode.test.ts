import { parseLaunchMode } from '@/lib/config/launch-mode';
import {
  createEmptyWorkspace,
  createInitialWorkspace,
  workspacePersistKey,
} from '@/lib/state/workspace-defaults';

describe('launch mode', () => {
  it('defaults to the user mode unless demo is explicit', () => {
    expect(parseLaunchMode(undefined)).toBe('user');
    expect(parseLaunchMode('unexpected')).toBe('user');
    expect(parseLaunchMode('demo')).toBe('demo');
  });

  it('starts user mode without sample records', () => {
    expect(createInitialWorkspace('user')).toEqual(createEmptyWorkspace());
  });

  it('starts demo mode with sample records', () => {
    const workspace = createInitialWorkspace('demo');

    expect(workspace.sessions.length).toBeGreaterThan(0);
    expect(workspace.people.length).toBeGreaterThan(0);
  });

  it('separates user and demo browser persistence keys', () => {
    expect(workspacePersistKey('user')).not.toBe(workspacePersistKey('demo'));
  });
});
