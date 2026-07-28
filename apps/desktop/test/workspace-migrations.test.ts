import { STARTER_TEMPLATE_LIBRARY_VERSION } from '@/features/dashboard/lib/starter-templates';
import { migrateWorkspaceSnapshot } from '@/features/dashboard/lib/workspace-migrations';
import { workspaceSnapshotSchema } from '@/lib/schemas/workspace-state';
import { createEmptyWorkspace } from '@/lib/state/workspace-defaults';

describe('workspace migrations', () => {
  it('installs the starter template library into a legacy workspace once', () => {
    const current = createEmptyWorkspace();
    const { templateLibraryVersion: _version, ...legacy } = current;
    const parsedLegacy = workspaceSnapshotSchema.parse({
      ...legacy,
      templates: [],
    });

    const migrated = migrateWorkspaceSnapshot(parsedLegacy);

    expect(migrated.templateLibraryVersion).toBe(
      STARTER_TEMPLATE_LIBRARY_VERSION,
    );
    expect(migrated.templates).toHaveLength(6);
    expect(migrated.templates.map((template) => template.title)).toContain(
      '会議・議事メモ',
    );
  });

  it('does not restore templates deleted after the migration', () => {
    const migrated = migrateWorkspaceSnapshot(
      workspaceSnapshotSchema.parse(createEmptyWorkspace()),
    );
    const deleted = { ...migrated, templates: [] };

    expect(migrateWorkspaceSnapshot(deleted)).toBe(deleted);
    expect(migrateWorkspaceSnapshot(deleted).templates).toEqual([]);
  });
});
