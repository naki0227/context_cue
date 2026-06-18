import { z } from 'zod';

export const transcriptChunkSchema = z.object({
  id: z.string(),
  source: z.string(),
  text: z.string(),
});

export const rollingSummarySchema = z.object({
  currentTopic: z.string(),
  importantPoints: z.array(z.string()),
  openQuestions: z.array(z.string()),
});

export const contextCueSchema = z.object({
  topic: z.string(),
  intent: z.string(),
  relatedNotes: z.array(z.string()),
  suggestedPoints: z.array(z.string()),
  questionsToAsk: z.array(z.string()),
  caution: z.string(),
});

export const appStateSchema = z.object({
  session: z.object({
    status: z.enum(['idle', 'running', 'stopped']),
    shareSafeMode: z.boolean(),
  }),
  connections: z.object({
    ollamaReady: z.boolean(),
    sttReady: z.boolean(),
  }),
  adaptiveInference: z.object({
    mode: z.enum(['light', 'deep']),
    questionScore: z.number(),
  }),
  rollingSummary: rollingSummarySchema,
  contextCue: contextCueSchema,
  transcript: z.array(transcriptChunkSchema),
});

export type AppState = z.infer<typeof appStateSchema>;

export const consentSchema = z.object({
  participantConsent: z.boolean(),
  noCovertUse: z.boolean(),
  shareSafeUnderstood: z.boolean(),
});

export type ConsentState = z.infer<typeof consentSchema>;
