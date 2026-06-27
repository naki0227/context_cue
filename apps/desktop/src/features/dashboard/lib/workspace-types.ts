export type SessionType =
  | '面接'
  | '面談'
  | '会議'
  | 'GD'
  | '1on1'
  | '授業'
  | 'その他';

export type SessionTone =
  | 'green'
  | 'blue'
  | 'violet'
  | 'orange'
  | 'gold'
  | 'gray'
  | 'neutral';

export type SessionStatus = '予定' | '完了' | '進行中';

export type SessionRecord = {
  dateLabel: string;
  durationMinutes: number;
  id: string;
  location: string;
  memo: string;
  partner: string;
  peopleIds: string[];
  platform: string;
  projectIds: string[];
  recording: string;
  recordingTone: SessionTone;
  reviewId?: string;
  startAt: string;
  status: SessionStatus;
  statusTone: SessionTone;
  title: string;
  type: SessionType;
  typeTone: SessionTone;
};

export type PersonHistoryRecord = {
  date: string;
  duration: string;
  id: string;
  title: string;
  type: SessionType;
};

export type PersonRoleTag =
  | '面談官・採用担当'
  | '社員・先輩'
  | 'メンバー・同僚'
  | 'その他';

export type PersonRecord = {
  checks: string[];
  history: PersonHistoryRecord[];
  id: string;
  lastContactLabel: string;
  mail: string;
  memo: string[];
  name: string;
  profile: string[];
  role: string;
  shortRole: PersonRoleTag;
  updatedAt: string;
};

export type ProjectCategory = '企業' | 'プロジェクト' | '課題';
export type ProjectIcon = 'company' | 'chart' | 'people' | 'target';
export type ProjectTone = 'violet' | 'green' | 'orange' | 'blue';

export type ProjectLinkedSession = {
  date: string;
  id: string;
  title: string;
  type: SessionType;
};

export type ProjectAction = {
  dueDate: string;
  id: string;
  priority: '高' | '中' | '低';
  title: string;
};

export type ProjectRecord = {
  actions: ProjectAction[];
  category: ProjectCategory;
  connections: string[];
  icon: ProjectIcon;
  id: string;
  issues: number;
  linkedSessions: ProjectLinkedSession[];
  overview: string;
  points: string[];
  progress: number;
  sessions: number;
  statusLabel: string;
  subtitle: string;
  title: string;
  tone: ProjectTone;
  updatedAt: string;
};

export type ReviewAction = {
  date: string;
  id: string;
  owner: string;
  title: string;
};

export type ReviewRecord = {
  actions: ReviewAction[];
  date: string;
  id: string;
  improvements: string[];
  insights: string[];
  memo: string[];
  meta: string;
  summary: string[];
  title: string;
  transcript: string[];
  type: Exclude<SessionType, '授業'>;
};

export type KnowledgeSource = 'manual' | 'imported-sample' | 'imported-file';

export type KnowledgeRecord = {
  content: string[];
  id: string;
  source: KnowledgeSource;
  sourceDocumentId?: string;
  tag: string;
  title: string;
  updatedAt: string;
};

export type TemplateTone = 'blue' | 'slate' | 'green' | 'orange' | 'violet';
export type TemplateIcon =
  | 'doc'
  | 'question'
  | 'chat'
  | 'list'
  | 'edit'
  | 'building';

export type TemplateRecord = {
  body: string[];
  description: string;
  icon: TemplateIcon;
  id: string;
  tag: '事前準備' | '想定質問' | '振り返り' | '議事メモ' | 'その他';
  title: string;
  tone: TemplateTone;
  updatedAt: string;
};
