import { z } from 'zod';

export const sessionRecordSchema = z.object({
  dateLabel: z.string(),
  durationMinutes: z.number(),
  id: z.string(),
  location: z.string(),
  memo: z.string(),
  partner: z.string(),
  platform: z.string(),
  recording: z.string(),
  recordingTone: z.string(),
  startAt: z.string(),
  status: z.string(),
  statusTone: z.string(),
  title: z.string(),
  type: z.string(),
  typeTone: z.string(),
});

export const personHistoryRecordSchema = z.object({
  date: z.string(),
  duration: z.string(),
  id: z.string(),
  title: z.string(),
  type: z.string(),
});

export const personRecordSchema = z.object({
  checks: z.array(z.string()),
  history: z.array(personHistoryRecordSchema),
  id: z.string(),
  lastContactLabel: z.string(),
  mail: z.string(),
  memo: z.array(z.string()),
  name: z.string(),
  profile: z.array(z.string()),
  role: z.string(),
  shortRole: z.string(),
  updatedAt: z.string(),
});

export const projectLinkedSessionSchema = z.object({
  date: z.string(),
  id: z.string(),
  title: z.string(),
  type: z.string(),
});

export const projectActionSchema = z.object({
  dueDate: z.string(),
  id: z.string(),
  priority: z.string(),
  title: z.string(),
});

export const projectRecordSchema = z.object({
  actions: z.array(projectActionSchema),
  category: z.string(),
  connections: z.array(z.string()),
  icon: z.string(),
  id: z.string(),
  issues: z.number(),
  linkedSessions: z.array(projectLinkedSessionSchema),
  overview: z.string(),
  points: z.array(z.string()),
  progress: z.number(),
  sessions: z.number(),
  statusLabel: z.string(),
  subtitle: z.string(),
  title: z.string(),
  tone: z.string(),
  updatedAt: z.string(),
});

export const reviewActionSchema = z.object({
  date: z.string(),
  id: z.string(),
  owner: z.string(),
  title: z.string(),
});

export const reviewRecordSchema = z.object({
  actions: z.array(reviewActionSchema),
  date: z.string(),
  id: z.string(),
  improvements: z.array(z.string()),
  insights: z.array(z.string()),
  memo: z.array(z.string()),
  meta: z.string(),
  summary: z.array(z.string()),
  title: z.string(),
  transcript: z.array(z.string()),
  type: z.string(),
});

export const knowledgeRecordSchema = z.object({
  content: z.array(z.string()),
  id: z.string(),
  source: z.string(),
  sourceDocumentId: z.string().optional(),
  tag: z.string(),
  title: z.string(),
  updatedAt: z.string(),
});

export const templateRecordSchema = z.object({
  body: z.array(z.string()),
  description: z.string(),
  icon: z.string(),
  id: z.string(),
  tag: z.string(),
  title: z.string(),
  tone: z.string(),
  updatedAt: z.string(),
});

export const workspaceSnapshotSchema = z.object({
  knowledgeItems: z.array(knowledgeRecordSchema),
  people: z.array(personRecordSchema),
  projects: z.array(projectRecordSchema),
  reviews: z.array(reviewRecordSchema),
  sessions: z.array(sessionRecordSchema),
  templates: z.array(templateRecordSchema),
});

export type WorkspaceSnapshot = z.infer<typeof workspaceSnapshotSchema>;
