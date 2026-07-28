import {
  createStarterTemplates,
  STARTER_TEMPLATE_LIBRARY_VERSION,
} from '@/features/dashboard/lib/starter-templates';
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
    templateLibraryVersion: STARTER_TEMPLATE_LIBRARY_VERSION,
    templates: createStarterTemplates(),
  };
}

export function createInitialWorkspace(
  mode: LaunchMode = launchMode,
): WorkspaceCollections {
  return mode === 'demo' ? createSeedWorkspace() : createEmptyWorkspace();
}
