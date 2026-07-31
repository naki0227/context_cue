import { z } from 'zod';

export const audioDeviceSchema = z.object({
  id: z.string(),
  name: z.string(),
  isDefault: z.boolean(),
});

export const sttStatusSchema = z.object({
  modelId: z.string(),
  modelName: z.string(),
  modelInstalled: z.boolean(),
  modelSizeBytes: z.number().int().nonnegative(),
  modelDownloadBytes: z.number().int().nonnegative(),
  systemMemoryBytes: z.number().int().nonnegative(),
  selectionReason: z.string(),
  devices: z.array(audioDeviceSchema),
  selectedDeviceId: z.string().nullable(),
  recording: z.boolean(),
  message: z.string(),
});

export const sttModelProgressSchema = z.object({
  completedBytes: z.number().int().nonnegative(),
  totalBytes: z.number().int().nonnegative(),
  percent: z.number().int().min(0).max(100),
  done: z.boolean(),
});

export type SttStatus = z.infer<typeof sttStatusSchema>;
export type SttModelProgress = z.infer<typeof sttModelProgressSchema>;
