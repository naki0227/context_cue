import type {
  KnowledgeRecord,
  PersonRecord,
  ProjectLinkedSession,
  ProjectRecord,
  ReviewRecord,
  SessionRecord,
  TemplateRecord,
} from '@/features/dashboard/lib/workspace-types';
import type { WorkspaceSnapshot } from '@/lib/schemas/workspace-state';

type WorkspaceCollections = {
  knowledgeItems: KnowledgeRecord[];
  people: PersonRecord[];
  projects: ProjectRecord[];
  reviews: ReviewRecord[];
  sessions: SessionRecord[];
  templateLibraryVersion: number;
  templates: TemplateRecord[];
};

function uniqueIds(ids: string[], validIds: Set<string>) {
  return [...new Set(ids)].filter((id) => validIds.has(id));
}

function buildProjectSessionMap(
  sessions: SessionRecord[],
): Map<string, ProjectLinkedSession[]> {
  const sessionMap = new Map<string, ProjectLinkedSession[]>();

  for (const session of sessions) {
    for (const projectId of session.projectIds) {
      const current = sessionMap.get(projectId) ?? [];
      current.push({
        id: session.id,
        title: session.title,
        type: session.type,
        date: session.dateLabel,
      });
      sessionMap.set(projectId, current);
    }
  }

  return sessionMap;
}

export function normalizeWorkspaceCollections(
  collections: WorkspaceCollections,
): WorkspaceCollections {
  const peopleIds = new Set(collections.people.map((item) => item.id));
  const projectIds = new Set(collections.projects.map((item) => item.id));
  const reviewIds = new Set(collections.reviews.map((item) => item.id));

  const sessions = collections.sessions.map((session) => ({
    ...session,
    peopleIds: uniqueIds(session.peopleIds, peopleIds),
    projectIds: uniqueIds(session.projectIds, projectIds),
    reviewId:
      session.reviewId && reviewIds.has(session.reviewId)
        ? session.reviewId
        : undefined,
  }));

  const sessionsByProject = buildProjectSessionMap(sessions);
  const projects = collections.projects.map((project) => {
    const linkedSessions = sessionsByProject.get(project.id) ?? [];
    return {
      ...project,
      sessions: linkedSessions.length,
      linkedSessions,
    };
  });

  return {
    ...collections,
    projects,
    sessions,
  };
}

export function normalizeWorkspaceSnapshot(
  snapshot: WorkspaceSnapshot,
): WorkspaceSnapshot {
  return normalizeWorkspaceCollections(
    snapshot as unknown as WorkspaceCollections,
  ) as WorkspaceSnapshot;
}

export function detachPersonRelations(
  sessions: SessionRecord[],
  personId: string,
): SessionRecord[] {
  return sessions.map((session) => ({
    ...session,
    peopleIds: session.peopleIds.filter((id) => id !== personId),
  }));
}

export function detachProjectRelations(
  sessions: SessionRecord[],
  projectId: string,
): SessionRecord[] {
  return sessions.map((session) => ({
    ...session,
    projectIds: session.projectIds.filter((id) => id !== projectId),
  }));
}

export function detachReviewRelations(
  sessions: SessionRecord[],
  reviewId: string,
): SessionRecord[] {
  return sessions.map((session) => ({
    ...session,
    reviewId: session.reviewId === reviewId ? undefined : session.reviewId,
  }));
}
