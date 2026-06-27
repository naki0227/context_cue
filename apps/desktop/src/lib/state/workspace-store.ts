import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  buildImportedKnowledgeContent,
  createSeedWorkspace,
} from '@/features/dashboard/lib/workspace-seed';
import type {
  KnowledgeRecord,
  PersonRecord,
  ProjectAction,
  ProjectRecord,
  ReviewRecord,
  SessionRecord,
  TemplateRecord,
} from '@/features/dashboard/lib/workspace-types';
import type { WorkspaceSnapshot } from '@/lib/schemas/workspace-state';
import { createBrowserPersistStorage } from '@/lib/state/persist-storage';

type ImportedKnowledgeInput = {
  content?: string;
  documentId: string;
  source: KnowledgeRecord['source'];
  title: string;
};

type WorkspaceState = {
  knowledgeItems: KnowledgeRecord[];
  people: PersonRecord[];
  projects: ProjectRecord[];
  reviews: ReviewRecord[];
  sessions: SessionRecord[];
  templates: TemplateRecord[];
  replaceWorkspace: (snapshot: WorkspaceSnapshot) => void;
  addKnowledgeItem: (item?: Partial<KnowledgeRecord>) => string;
  addPerson: (item?: Partial<PersonRecord>) => string;
  addProject: (item?: Partial<ProjectRecord>) => string;
  addReview: (item?: Partial<ReviewRecord>) => string;
  addSession: (item?: Partial<SessionRecord>) => string;
  addTemplate: (item?: Partial<TemplateRecord>) => string;
  removeKnowledgeItem: (id: string) => void;
  removePerson: (id: string) => void;
  removeProject: (id: string) => void;
  removeReview: (id: string) => void;
  removeSession: (id: string) => void;
  removeTemplate: (id: string) => void;
  syncImportedKnowledgeItems: (items: ImportedKnowledgeInput[]) => void;
  updateKnowledgeItem: (id: string, patch: Partial<KnowledgeRecord>) => void;
  updatePerson: (id: string, patch: Partial<PersonRecord>) => void;
  updateProject: (id: string, patch: Partial<ProjectRecord>) => void;
  updateProjectActions: (id: string, actions: ProjectAction[]) => void;
  updateReview: (id: string, patch: Partial<ReviewRecord>) => void;
  updateSession: (id: string, patch: Partial<SessionRecord>) => void;
  updateTemplate: (id: string, patch: Partial<TemplateRecord>) => void;
};

const seedWorkspace = createSeedWorkspace();

function stampNow() {
  return new Date().toLocaleDateString('ja-JP');
}

function upsertById<T extends { id: string }>(
  items: T[],
  id: string,
  patch: Partial<T>,
) {
  return items.map((item) => (item.id === id ? { ...item, ...patch } : item));
}

function removeById<T extends { id: string }>(items: T[], id: string) {
  return items.filter((item) => item.id !== id);
}

export function createWorkspaceSnapshot(
  state: Pick<
    WorkspaceState,
    | 'sessions'
    | 'people'
    | 'projects'
    | 'reviews'
    | 'knowledgeItems'
    | 'templates'
  >,
): WorkspaceSnapshot {
  return {
    sessions: state.sessions,
    people: state.people,
    projects: state.projects,
    reviews: state.reviews,
    knowledgeItems: state.knowledgeItems,
    templates: state.templates,
  };
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      sessions: seedWorkspace.sessions,
      people: seedWorkspace.people,
      projects: seedWorkspace.projects,
      reviews: seedWorkspace.reviews,
      knowledgeItems: seedWorkspace.knowledgeItems,
      templates: seedWorkspace.templates,
      replaceWorkspace: (snapshot) =>
        set({
          sessions: snapshot.sessions as SessionRecord[],
          people: snapshot.people as PersonRecord[],
          projects: snapshot.projects as ProjectRecord[],
          reviews: snapshot.reviews as ReviewRecord[],
          knowledgeItems: snapshot.knowledgeItems as KnowledgeRecord[],
          templates: snapshot.templates as TemplateRecord[],
        }),

      addSession: (item) => {
        const id = item?.id ?? `session-${crypto.randomUUID()}`;
        const nextItem: SessionRecord = {
          id,
          title: item?.title ?? `新しいセッション ${get().sessions.length + 1}`,
          type: item?.type ?? '面談',
          typeTone: item?.typeTone ?? 'green',
          dateLabel: item?.dateLabel ?? '未設定',
          startAt: item?.startAt ?? new Date().toISOString(),
          partner: item?.partner ?? '相手未設定',
          location: item?.location ?? 'オンライン',
          platform: item?.platform ?? 'オンライン',
          durationMinutes: item?.durationMinutes ?? 30,
          peopleIds: item?.peopleIds ?? [],
          projectIds: item?.projectIds ?? [],
          recording: item?.recording ?? '',
          recordingTone: item?.recordingTone ?? 'neutral',
          reviewId: item?.reviewId,
          status: item?.status ?? '予定',
          statusTone: item?.statusTone ?? 'blue',
          memo: item?.memo ?? '会話の目的と確認したいことをここに整理します。',
        };
        set((state) => ({ sessions: [nextItem, ...state.sessions] }));
        return id;
      },

      updateSession: (id, patch) =>
        set((state) => ({ sessions: upsertById(state.sessions, id, patch) })),
      removeSession: (id) =>
        set((state) => ({ sessions: removeById(state.sessions, id) })),

      addPerson: (item) => {
        const id = item?.id ?? `person-${crypto.randomUUID()}`;
        const nextItem: PersonRecord = {
          id,
          name: item?.name ?? `新しい人物 ${get().people.length + 1}`,
          role: item?.role ?? '役職未設定',
          shortRole: item?.shortRole ?? 'その他',
          mail: item?.mail ?? `person-${get().people.length + 1}@local.example`,
          updatedAt: item?.updatedAt ?? stampNow(),
          lastContactLabel: item?.lastContactLabel ?? '未接触',
          profile: item?.profile ?? ['プロフィールをここに入力してください。'],
          checks: item?.checks ?? ['次回確認したいことを追加してください。'],
          memo: item?.memo ?? ['印象や注意点をここに残します。'],
          history: item?.history ?? [],
        };
        set((state) => ({ people: [nextItem, ...state.people] }));
        return id;
      },

      updatePerson: (id, patch) =>
        set((state) => ({ people: upsertById(state.people, id, patch) })),
      removePerson: (id) =>
        set((state) => ({ people: removeById(state.people, id) })),

      addProject: (item) => {
        const id = item?.id ?? `project-${crypto.randomUUID()}`;
        const nextItem: ProjectRecord = {
          id,
          title:
            item?.title ?? `新しいプロジェクト ${get().projects.length + 1}`,
          category: item?.category ?? 'プロジェクト',
          subtitle: item?.subtitle ?? '概要未設定',
          progress: item?.progress ?? 10,
          sessions: item?.sessions ?? 0,
          issues: item?.issues ?? 0,
          updatedAt: item?.updatedAt ?? '今',
          tone: item?.tone ?? 'green',
          icon: item?.icon ?? 'chart',
          statusLabel: item?.statusLabel ?? '進行中',
          overview: item?.overview ?? '概要を入力してください。',
          linkedSessions: item?.linkedSessions ?? [],
          points: item?.points ?? ['重要なポイントを追加してください。'],
          actions: item?.actions ?? [],
          connections: item?.connections ?? [
            '担当者や関係性を追加してください。',
          ],
        };
        set((state) => ({ projects: [nextItem, ...state.projects] }));
        return id;
      },

      updateProject: (id, patch) =>
        set((state) => ({ projects: upsertById(state.projects, id, patch) })),
      updateProjectActions: (id, actions) =>
        set((state) => ({
          projects: state.projects.map((item) =>
            item.id === id ? { ...item, actions } : item,
          ),
        })),
      removeProject: (id) =>
        set((state) => ({ projects: removeById(state.projects, id) })),

      addReview: (item) => {
        const id = item?.id ?? `review-${crypto.randomUUID()}`;
        const nextItem: ReviewRecord = {
          id,
          title: item?.title ?? `新しい振り返り ${get().reviews.length + 1}`,
          date: item?.date ?? stampNow(),
          meta: item?.meta ?? '未設定 / 30分 / ローカル',
          type: item?.type ?? 'その他',
          summary: item?.summary ?? ['良かった点を追加してください。'],
          transcript: item?.transcript ?? [
            'トランスクリプトを追加してください。',
          ],
          insights: item?.insights ?? ['気づきや背景を追加してください。'],
          improvements: item?.improvements ?? ['改善点を追加してください。'],
          memo: item?.memo ?? ['次回に向けたメモを追加してください。'],
          actions: item?.actions ?? [],
        };
        set((state) => ({ reviews: [nextItem, ...state.reviews] }));
        return id;
      },

      updateReview: (id, patch) =>
        set((state) => ({ reviews: upsertById(state.reviews, id, patch) })),
      removeReview: (id) =>
        set((state) => ({ reviews: removeById(state.reviews, id) })),

      addKnowledgeItem: (item) => {
        const id = item?.id ?? `knowledge-${crypto.randomUUID()}`;
        const nextItem: KnowledgeRecord = {
          id,
          title:
            item?.title ?? `新しいナレッジ ${get().knowledgeItems.length + 1}`,
          tag: item?.tag ?? '下書き',
          updatedAt: item?.updatedAt ?? stampNow(),
          source: item?.source ?? 'manual',
          sourceDocumentId: item?.sourceDocumentId,
          content: item?.content ?? ['内容を入力してください。'],
        };
        set((state) => ({
          knowledgeItems: [
            nextItem,
            ...state.knowledgeItems.filter((current) => current.id !== id),
          ],
        }));
        return id;
      },

      updateKnowledgeItem: (id, patch) =>
        set((state) => ({
          knowledgeItems: upsertById(state.knowledgeItems, id, patch),
        })),
      removeKnowledgeItem: (id) =>
        set((state) => ({
          knowledgeItems: removeById(state.knowledgeItems, id),
        })),
      syncImportedKnowledgeItems: (items) =>
        set((state) => {
          const importedIds = new Set(items.map((item) => item.documentId));
          const preservedManualItems = state.knowledgeItems.filter(
            (item) =>
              item.source === 'manual' ||
              (item.sourceDocumentId &&
                item.source === 'imported-file' &&
                importedIds.has(item.sourceDocumentId)) ||
              (item.sourceDocumentId &&
                item.source === 'imported-sample' &&
                importedIds.has(item.sourceDocumentId)),
          );

          const mappedImportedItems = items.map((item) => {
            const existing = state.knowledgeItems.find(
              (current) => current.sourceDocumentId === item.documentId,
            );

            return {
              id: existing?.id ?? `knowledge-import-${item.documentId}`,
              sourceDocumentId: item.documentId,
              title: item.title,
              tag:
                item.source === 'imported-sample'
                  ? 'サンプル'
                  : 'ローカルファイル',
              updatedAt: stampNow(),
              source: item.source,
              content:
                item.content || !existing
                  ? buildImportedKnowledgeContent(item.title, item.content)
                  : existing.content,
            } satisfies KnowledgeRecord;
          });

          const manualOnlyItems = preservedManualItems.filter(
            (item) => item.source === 'manual',
          );

          return {
            knowledgeItems: [...mappedImportedItems, ...manualOnlyItems],
          };
        }),

      addTemplate: (item) => {
        const id = item?.id ?? `template-${crypto.randomUUID()}`;
        const nextItem: TemplateRecord = {
          id,
          title:
            item?.title ?? `新しいテンプレート ${get().templates.length + 1}`,
          description:
            item?.description ?? 'テンプレートの説明を入力してください。',
          tag: item?.tag ?? 'その他',
          icon: item?.icon ?? 'doc',
          tone: item?.tone ?? 'blue',
          updatedAt: item?.updatedAt ?? stampNow(),
          body: item?.body ?? ['テンプレート本文を入力してください。'],
        };
        set((state) => ({ templates: [nextItem, ...state.templates] }));
        return id;
      },

      updateTemplate: (id, patch) =>
        set((state) => ({ templates: upsertById(state.templates, id, patch) })),
      removeTemplate: (id) =>
        set((state) => ({ templates: removeById(state.templates, id) })),
    }),
    {
      name: 'context-cue-workspace-v2',
      storage: createBrowserPersistStorage(),
    },
  ),
);
