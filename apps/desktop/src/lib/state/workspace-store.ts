import { create } from 'zustand';
import {
  detachPersonRelations,
  detachProjectRelations,
  detachReviewRelations,
  normalizeWorkspaceCollections,
  normalizeWorkspaceSnapshot,
} from '@/features/dashboard/lib/workspace-normalize';
import { createInitialWorkspace } from '@/lib/state/workspace-defaults';
import {
  buildImportedKnowledgeRecords,
  createKnowledgeRecord,
  createPersonRecord,
  createProjectRecord,
  createReviewRecord,
  createSessionRecord,
  createTemplateRecord,
} from '@/lib/state/workspace-store-builders';
import type { WorkspaceState } from '@/lib/state/workspace-store-types';
import {
  applyWorkspacePatch,
  mapProjectActions,
  removeById,
  replaceWorkspaceSnapshot,
  upsertById,
} from '@/lib/state/workspace-store-utils';

export type {
  ImportedKnowledgeInput,
  WorkspaceCollections,
  WorkspaceState,
} from '@/lib/state/workspace-store-types';
export { createWorkspaceSnapshot } from '@/lib/state/workspace-store-utils';

const initialWorkspace = createInitialWorkspace();

export const useWorkspaceStore = create<WorkspaceState>()((set, get) => ({
  sessions: initialWorkspace.sessions,
  people: initialWorkspace.people,
  projects: initialWorkspace.projects,
  reviews: initialWorkspace.reviews,
  knowledgeItems: initialWorkspace.knowledgeItems,
  templates: initialWorkspace.templates,

  archiveCompletedSession: ({ review, session }) =>
    set((state) =>
      applyWorkspacePatch(state, {
        reviews: review
          ? [review, ...state.reviews.filter((item) => item.id !== review.id)]
          : state.reviews,
        sessions: [
          session,
          ...state.sessions.filter((item) => item.id !== session.id),
        ],
      }),
    ),

  replaceWorkspace: (snapshot) =>
    set(
      normalizeWorkspaceCollections(
        replaceWorkspaceSnapshot(normalizeWorkspaceSnapshot(snapshot)),
      ),
    ),

  addSession: (item) => {
    const nextItem = createSessionRecord(item, get().sessions.length);
    set((state) =>
      applyWorkspacePatch(state, {
        sessions: [nextItem, ...state.sessions],
      }),
    );
    return nextItem.id;
  },
  updateSession: (id, patch) =>
    set((state) =>
      applyWorkspacePatch(state, {
        sessions: upsertById(state.sessions, id, patch),
      }),
    ),
  removeSession: (id) =>
    set((state) =>
      applyWorkspacePatch(state, {
        sessions: removeById(state.sessions, id),
      }),
    ),

  addPerson: (item) => {
    const nextItem = createPersonRecord(item, get().people.length);
    set((state) =>
      applyWorkspacePatch(state, {
        people: [nextItem, ...state.people],
      }),
    );
    return nextItem.id;
  },
  updatePerson: (id, patch) =>
    set((state) =>
      applyWorkspacePatch(state, {
        people: upsertById(state.people, id, patch),
      }),
    ),
  removePerson: (id) =>
    set((state) =>
      applyWorkspacePatch(state, {
        people: removeById(state.people, id),
        sessions: detachPersonRelations(state.sessions, id),
      }),
    ),

  addProject: (item) => {
    const nextItem = createProjectRecord(item, get().projects.length);
    set((state) =>
      applyWorkspacePatch(state, {
        projects: [nextItem, ...state.projects],
      }),
    );
    return nextItem.id;
  },
  updateProject: (id, patch) =>
    set((state) =>
      applyWorkspacePatch(state, {
        projects: upsertById(state.projects, id, patch),
      }),
    ),
  updateProjectActions: (id, actions) =>
    set((state) =>
      applyWorkspacePatch(state, {
        projects: mapProjectActions(state.projects, id, actions),
      }),
    ),
  removeProject: (id) =>
    set((state) =>
      applyWorkspacePatch(state, {
        projects: removeById(state.projects, id),
        sessions: detachProjectRelations(state.sessions, id),
      }),
    ),

  addReview: (item) => {
    const nextItem = createReviewRecord(item, get().reviews.length);
    set((state) =>
      applyWorkspacePatch(state, {
        reviews: [nextItem, ...state.reviews],
      }),
    );
    return nextItem.id;
  },
  updateReview: (id, patch) =>
    set((state) =>
      applyWorkspacePatch(state, {
        reviews: upsertById(state.reviews, id, patch),
      }),
    ),
  removeReview: (id) =>
    set((state) =>
      applyWorkspacePatch(state, {
        reviews: removeById(state.reviews, id),
        sessions: detachReviewRelations(state.sessions, id),
      }),
    ),

  addKnowledgeItem: (item) => {
    const nextItem = createKnowledgeRecord(item, get().knowledgeItems.length);
    set((state) =>
      applyWorkspacePatch(state, {
        knowledgeItems: [
          nextItem,
          ...state.knowledgeItems.filter(
            (current) => current.id !== nextItem.id,
          ),
        ],
      }),
    );
    return nextItem.id;
  },
  updateKnowledgeItem: (id, patch) =>
    set((state) =>
      applyWorkspacePatch(state, {
        knowledgeItems: upsertById(state.knowledgeItems, id, patch),
      }),
    ),
  removeKnowledgeItem: (id) =>
    set((state) =>
      applyWorkspacePatch(state, {
        knowledgeItems: removeById(state.knowledgeItems, id),
      }),
    ),
  syncImportedKnowledgeItems: (items) =>
    set((state) =>
      applyWorkspacePatch(state, {
        knowledgeItems: buildImportedKnowledgeRecords(
          items,
          state.knowledgeItems,
        ),
      }),
    ),

  addTemplate: (item) => {
    const nextItem = createTemplateRecord(item, get().templates.length);
    set((state) =>
      applyWorkspacePatch(state, {
        templates: [nextItem, ...state.templates],
      }),
    );
    return nextItem.id;
  },
  updateTemplate: (id, patch) =>
    set((state) =>
      applyWorkspacePatch(state, {
        templates: upsertById(state.templates, id, patch),
      }),
    ),
  removeTemplate: (id) =>
    set((state) =>
      applyWorkspacePatch(state, {
        templates: removeById(state.templates, id),
      }),
    ),
}));
