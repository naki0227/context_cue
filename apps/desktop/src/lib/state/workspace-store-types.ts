import type { SessionArchive } from '@/features/dashboard/lib/session-archive';
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

export type ImportedKnowledgeInput = {
  content?: string;
  documentId: string;
  source: KnowledgeRecord['source'];
  title: string;
};

export type WorkspaceState = {
  knowledgeItems: KnowledgeRecord[];
  people: PersonRecord[];
  projects: ProjectRecord[];
  reviews: ReviewRecord[];
  sessions: SessionRecord[];
  templateLibraryVersion: number;
  templates: TemplateRecord[];
  archiveCompletedSession: (archive: SessionArchive) => void;
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

export type WorkspaceCollections = Pick<
  WorkspaceState,
  | 'sessions'
  | 'people'
  | 'projects'
  | 'reviews'
  | 'knowledgeItems'
  | 'templateLibraryVersion'
  | 'templates'
>;
