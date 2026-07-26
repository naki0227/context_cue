import { z } from 'zod';
import { contextCueSchema } from '@/lib/schemas/app-state';

export const llmModelSchema = z.object({
  name: z.string(),
  sizeBytes: z.number().int().nonnegative(),
  parameterSize: z.string(),
  quantizationLevel: z.string(),
});

export const ollamaStatusSchema = z.object({
  running: z.boolean(),
  models: z.array(llmModelSchema),
  recommendedModel: z.string(),
  recommendedModelInstalled: z.boolean(),
  message: z.string(),
});

export const pullProgressSchema = z.object({
  status: z.string(),
  completedBytes: z.number().int().nonnegative(),
  totalBytes: z.number().int().nonnegative(),
  percent: z.number().int().min(0).max(100),
  done: z.boolean(),
});

export const cueGenerationOutcomeSchema = z.object({
  cue: contextCueSchema,
  usedFallback: z.boolean(),
  warning: z.string().nullable(),
});

export type OllamaStatus = z.infer<typeof ollamaStatusSchema>;
export type PullProgress = z.infer<typeof pullProgressSchema>;

export type CueGenerationRequest = {
  transcriptRecent: string;
  rollingSummary: {
    currentTopic: string;
    importantPoints: string[];
    openQuestions: string[];
  };
  questionLikelihood: number;
  detectedIntentHint: string;
  retrievedNotes: Array<{ title: string; content: string }>;
  mode: string;
};
