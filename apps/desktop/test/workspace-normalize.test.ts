import {
  detachPersonRelations,
  detachProjectRelations,
  detachReviewRelations,
  normalizeWorkspaceSnapshot,
} from '@/features/dashboard/lib/workspace-normalize';
import { createSeedWorkspace } from '@/features/dashboard/lib/workspace-seed';

describe('workspace normalization', () => {
  it('drops dangling relation ids and refreshes project session aggregates', () => {
    const seed = createSeedWorkspace();
    const snapshot = normalizeWorkspaceSnapshot({
      ...seed,
      sessions: [
        {
          ...seed.sessions[0],
          peopleIds: ['person-recruiter-a', 'person-missing'],
          projectIds: ['project-company-a-consulting', 'project-missing'],
          reviewId: 'review-missing',
        },
      ],
    });

    expect(snapshot.sessions[0]?.peopleIds).toEqual(['person-recruiter-a']);
    expect(snapshot.sessions[0]?.projectIds).toEqual([
      'project-company-a-consulting',
    ]);
    expect(snapshot.sessions[0]?.reviewId).toBeUndefined();

    const project = snapshot.projects.find(
      (item) => item.id === 'project-company-a-consulting',
    );
    expect(project?.sessions).toBe(1);
    expect(project?.linkedSessions).toEqual([
      {
        id: seed.sessions[0]?.id ?? '',
        title: seed.sessions[0]?.title ?? '',
        type: seed.sessions[0]?.type ?? '面談',
        date: seed.sessions[0]?.dateLabel ?? '',
      },
    ]);
  });

  it('detaches deleted entities from linked sessions', () => {
    const seed = createSeedWorkspace();
    const baseSessions = seed.sessions;

    const withoutPerson = detachPersonRelations(
      baseSessions,
      'person-recruiter-a',
    );
    expect(withoutPerson[0]?.peopleIds).toEqual([]);

    const withoutProject = detachProjectRelations(
      baseSessions,
      'project-company-a-consulting',
    );
    expect(withoutProject[0]?.projectIds).toEqual([]);

    const withoutReview = detachReviewRelations(
      baseSessions,
      'review-catalyst',
    );
    expect(withoutReview[0]?.reviewId).toBeUndefined();
  });
});
