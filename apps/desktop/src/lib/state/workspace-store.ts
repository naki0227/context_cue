import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createBrowserPersistStorage } from '@/lib/state/persist-storage';

export type SessionDraft = {
  date: string;
  memo: string;
  partner: string;
  recording: string;
  recordingTone: string;
  status: string;
  statusTone: string;
  title: string;
  type: string;
  typeTone: string;
};

export type PersonDraft = {
  mail: string;
  name: string;
  role: string;
  shortRole: string;
  updatedAt: string;
};

export type ProjectDraft = {
  category: string;
  icon: string;
  issues: number;
  progress: string;
  sessions: number;
  subtitle: string;
  title: string;
  tone: string;
  updatedAt: string;
};

export type ReviewDraft = {
  date: string;
  meta: string;
  title: string;
  type: string;
};

export type KnowledgeDraft = {
  content: string[];
  id: string;
  tag: string;
  title: string;
  updatedAt: string;
};

type WorkspaceState = {
  draftKnowledgeItems: KnowledgeDraft[];
  draftPeople: PersonDraft[];
  draftProjects: ProjectDraft[];
  draftReviews: ReviewDraft[];
  draftSessions: SessionDraft[];
  peopleExtraChecks: Record<string, string[]>;
  projectExtraActions: Record<string, Array<[string, string, string]>>;
  addKnowledgeDraft: (item: KnowledgeDraft) => void;
  addPersonDraft: (person: PersonDraft) => void;
  addProjectAction: (title: string, action: [string, string, string]) => void;
  addProjectDraft: (project: ProjectDraft) => void;
  addReviewDraft: (review: ReviewDraft) => void;
  addSessionDraft: (session: SessionDraft) => void;
  appendPeopleCheck: (name: string, value: string) => void;
};

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set) => ({
      draftKnowledgeItems: [],
      draftPeople: [],
      draftProjects: [],
      draftReviews: [],
      draftSessions: [],
      peopleExtraChecks: {},
      projectExtraActions: {},
      addKnowledgeDraft: (item) =>
        set((state) => ({
          draftKnowledgeItems: [
            item,
            ...state.draftKnowledgeItems.filter(
              (current) => current.id !== item.id,
            ),
          ],
        })),
      addPersonDraft: (person) =>
        set((state) => ({
          draftPeople: [
            person,
            ...state.draftPeople.filter(
              (current) => current.name !== person.name,
            ),
          ],
        })),
      addProjectAction: (title, action) =>
        set((state) => ({
          projectExtraActions: {
            ...state.projectExtraActions,
            [title]: [...(state.projectExtraActions[title] ?? []), action],
          },
        })),
      addProjectDraft: (project) =>
        set((state) => ({
          draftProjects: [
            project,
            ...state.draftProjects.filter(
              (current) => current.title !== project.title,
            ),
          ],
        })),
      addReviewDraft: (review) =>
        set((state) => ({
          draftReviews: [
            review,
            ...state.draftReviews.filter(
              (current) => current.title !== review.title,
            ),
          ],
        })),
      addSessionDraft: (session) =>
        set((state) => ({
          draftSessions: [
            session,
            ...state.draftSessions.filter(
              (current) => current.title !== session.title,
            ),
          ],
        })),
      appendPeopleCheck: (name, value) =>
        set((state) => ({
          peopleExtraChecks: {
            ...state.peopleExtraChecks,
            [name]: [...(state.peopleExtraChecks[name] ?? []), value],
          },
        })),
    }),
    {
      name: 'context-cue-workspace-v1',
      storage: createBrowserPersistStorage(),
    },
  ),
);
