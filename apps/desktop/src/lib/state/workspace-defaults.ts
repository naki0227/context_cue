import { createSeedWorkspace } from '@/features/dashboard/lib/workspace-seed';
import { type LaunchMode, launchMode } from '@/lib/config/launch-mode';
import type { WorkspaceCollections } from '@/lib/state/workspace-store-types';

export function createEmptyWorkspace(): WorkspaceCollections {
  return {
    sessions: [],
    people: [],
    projects: [],
    reviews: [],
    knowledgeItems: [],
    templates: [],
  };
}

export function createInitialWorkspace(
  mode: LaunchMode = launchMode,
): WorkspaceCollections {
  return mode === 'demo' ? createSeedWorkspace() : createEmptyWorkspace();
}

export function workspacePersistKey(mode: LaunchMode = launchMode) {
  return `context-cue-workspace-v3-${mode}`;
}
