import type {
  PersonHistoryRecord,
  PersonRecord,
  ProjectLinkedSession,
  ProjectRecord,
  SessionRecord,
} from '@/features/dashboard/lib/workspace-types';

export function buildPersonSessionHistory(
  sessions: SessionRecord[],
  personId: string,
): PersonHistoryRecord[] {
  return sessions
    .filter((session) => session.peopleIds.includes(personId))
    .map((session) => ({
      id: session.id,
      title: session.title,
      type: session.type,
      date: session.dateLabel,
      duration: `${session.durationMinutes}分`,
    }));
}

export function buildProjectLinkedSessions(
  sessions: SessionRecord[],
  projectId: string,
): ProjectLinkedSession[] {
  return sessions
    .filter((session) => session.projectIds.includes(projectId))
    .map((session) => ({
      id: session.id,
      title: session.title,
      type: session.type,
      date: session.dateLabel,
    }));
}

export function buildReviewRelatedSession(
  sessions: SessionRecord[],
  reviewId: string,
) {
  return sessions.find((session) => session.reviewId === reviewId) ?? null;
}

export function resolvePersonIdsByNames(
  people: PersonRecord[],
  rawValue: string,
): string[] {
  return rawValue
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const matched = people.find(
        (person) => person.id === entry || person.name === entry,
      );
      return matched?.id ?? entry;
    });
}

export function resolveProjectIdsByTitles(
  projects: ProjectRecord[],
  rawValue: string,
): string[] {
  return rawValue
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const matched = projects.find(
        (project) => project.id === entry || project.title === entry,
      );
      return matched?.id ?? entry;
    });
}

export function listPersonNames(
  people: PersonRecord[],
  personIds: string[],
): string {
  return personIds
    .map(
      (personId) =>
        people.find((person) => person.id === personId)?.name ?? personId,
    )
    .join(', ');
}

export function listProjectTitles(
  projects: ProjectRecord[],
  projectIds: string[],
): string {
  return projectIds
    .map(
      (projectId) =>
        projects.find((project) => project.id === projectId)?.title ??
        projectId,
    )
    .join(', ');
}
