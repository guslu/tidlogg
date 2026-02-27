import { z } from "zod";

export const workspaceSwitchSchema = z.object({ workspaceId: z.string().cuid() });

export const projectSchema = z.object({
  name: z.string().min(2).max(120),
  clientId: z.string().cuid().optional().nullable(),
  billableRate: z.coerce.number().min(0).max(100000).optional().nullable()
});

export const clientSchema = z.object({ name: z.string().min(2).max(120) });

export const tagSchema = z.object({ name: z.string().min(1).max(40), color: z.string().optional().nullable() });

export const timerStartSchema = z.object({
  workspaceId: z.string().cuid(),
  projectId: z.string().cuid(),
  description: z.string().max(500).default("")
});

export const timerStopSchema = z.object({ workspaceId: z.string().cuid() });

export const entrySchema = z.object({
  workspaceId: z.string().cuid(),
  projectId: z.string().cuid(),
  description: z.string().max(500).default(""),
  startedAt: z.coerce.date(),
  endedAt: z.coerce.date(),
  tagIds: z.array(z.string().cuid()).default([])
}).refine((value) => value.endedAt > value.startedAt, "End time must be after start time");

export const reportQuerySchema = z.object({
  workspaceId: z.string().cuid(),
  from: z.coerce.date(),
  to: z.coerce.date(),
  projectId: z.string().cuid().optional(),
  userId: z.string().cuid().optional()
});
