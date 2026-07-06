import { normalizeWorkspaceCollections } from '@/features/dashboard/lib/workspace-normalize';
import type { WorkspaceSnapshot } from '@/lib/schemas/workspace-state';
import type {
  WorkspaceCollections,
  WorkspaceState,
} from '@/lib/state/workspace-store-types';

export function upsertById<T extends { id: string }>(
  items: T[],
  id: string,
  patch: Partial<T>,
) {
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

export function removeById<T extends { id: string }>(items: T[], id: string) {
  return items.filter((item) => item.id !== id);
}

export function pickWorkspaceCollections(state: WorkspaceCollections) {
  return {
    sessions: state.sessions,
    people: state.people,
    projects: state.projects,
    reviews: state.reviews,
    knowledgeItems: state.knowledgeItems,
    templates: state.templates,
  } satisfies WorkspaceCollections;
}

export function applyWorkspacePatch(
  state: WorkspaceCollections,
  patch: Partial<WorkspaceCollections>,
) {
  return normalizeWorkspaceCollections({
    ...pickWorkspaceCollections(state),
    ...patch,
  });
}

export function createWorkspaceSnapshot(
  state: WorkspaceCollections,
): WorkspaceSnapshot {
  return normalizeWorkspaceCollections(pickWorkspaceCollections(state));
}

export function replaceWorkspaceSnapshot(snapshot: WorkspaceSnapshot) {
  return {
    sessions: snapshot.sessions,
    people: snapshot.people,
    projects: snapshot.projects,
    reviews: snapshot.reviews,
    knowledgeItems: snapshot.knowledgeItems,
    templates: snapshot.templates,
  } as unknown as WorkspaceCollections;
}

export function mapProjectActions(
  projects: WorkspaceState['projects'],
  id: string,
  actions: WorkspaceState['projects'][number]['actions'],
) {
  return projects.map((item) => (item.id === id ? { ...item, actions } : item));
}
