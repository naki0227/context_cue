import {
  createStarterTemplates,
  STARTER_TEMPLATE_LIBRARY_VERSION,
} from '@/features/dashboard/lib/starter-templates';
import type { WorkspaceSnapshot } from '@/lib/schemas/workspace-state';

export function migrateWorkspaceSnapshot(
  snapshot: WorkspaceSnapshot,
): WorkspaceSnapshot {
  if (snapshot.templateLibraryVersion >= STARTER_TEMPLATE_LIBRARY_VERSION) {
    return snapshot;
  }

  const existingIds = new Set(
    snapshot.templates.map((template) => template.id),
  );
  const missingStarters = createStarterTemplates().filter(
    (template) => !existingIds.has(template.id),
  );

  return {
    ...snapshot,
    templateLibraryVersion: STARTER_TEMPLATE_LIBRARY_VERSION,
    templates: [...missingStarters, ...snapshot.templates],
  };
}
