import { z } from 'zod'

export const leadInterestValues = ['student', 'parent', 'tutor', 'other'] as const
export const leadStatusValues = ['new', 'contacted', 'qualified', 'converted', 'closed'] as const
export const tutoringTaskStatusValues = ['assigned', 'submitted', 'reviewed', 'overdue', 'completed'] as const
export const tutoringPriorityValues = ['low', 'medium', 'high'] as const
export const tutoringDeliveryChannelValues = ['in_app', 'email', 'line', 'wechat'] as const
export const tutoringDeliveryStatusValues = ['draft', 'queued', 'sent', 'archived'] as const
export const tutoringRoleValues = ['STUDENT', 'USER', 'TUTOR', 'PARENT', 'ADMIN', 'OWNER'] as const

export type LeadInterest = (typeof leadInterestValues)[number]
export type LeadStatus = (typeof leadStatusValues)[number]
export type TutoringTaskStatus = (typeof tutoringTaskStatusValues)[number]
export type TutoringPriority = (typeof tutoringPriorityValues)[number]
export type TutoringDeliveryChannel = (typeof tutoringDeliveryChannelValues)[number]
export type TutoringDeliveryStatus = (typeof tutoringDeliveryStatusValues)[number]
export type TutoringRole = (typeof tutoringRoleValues)[number]

const textList = z.array(z.string().trim().min(1).max(120)).default([])

export const leadCreateSchema = z.object({
  email: z.string().trim().email(),
  roleInterest: z.enum(leadInterestValues),
  source: z.string().trim().max(120).optional(),
  campaign: z.string().trim().max(120).optional(),
  message: z.string().trim().max(2000).optional(),
})

export const leadUpdateSchema = z.object({
  status: z.enum(leadStatusValues),
  notes: z.string().trim().max(4000).optional(),
})

export const userRoleUpdateSchema = z.object({
  userId: z.string().trim().min(1),
  role: z.enum(tutoringRoleValues),
  plan: z.string().trim().max(64).optional(),
})

export const taskCreateSchema = z.object({
  studentId: z.string().trim().min(1),
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().min(5).max(4000),
  subject: z.string().trim().min(1).max(120),
  topic: z.string().trim().min(1).max(120),
  dueAt: z.string().trim().datetime().optional(),
  priority: z.enum(tutoringPriorityValues).default('medium'),
  weakTopics: textList,
  resourceTitles: textList,
})

export const taskUpdateSchema = z.object({
  title: z.string().trim().min(2).max(160).optional(),
  description: z.string().trim().min(5).max(4000).optional(),
  subject: z.string().trim().min(1).max(120).optional(),
  topic: z.string().trim().min(1).max(120).optional(),
  dueAt: z.string().trim().datetime().nullable().optional(),
  priority: z.enum(tutoringPriorityValues).optional(),
  status: z.enum(tutoringTaskStatusValues).optional(),
  completionNote: z.string().trim().max(4000).optional(),
  weakTopics: textList.optional(),
})

export const submissionCreateSchema = z.object({
  taskId: z.string().trim().min(1),
  textResponse: z.string().trim().max(8000).optional(),
  externalLink: z.string().trim().url().optional(),
  notes: z.string().trim().max(2000).optional(),
})

export const feedbackCreateSchema = z.object({
  taskId: z.string().trim().min(1),
  submissionId: z.string().trim().min(1).optional(),
  summary: z.string().trim().min(3).max(4000),
  strengths: textList,
  weaknesses: textList,
  nextSteps: z.string().trim().min(3).max(4000),
  score: z.number().int().min(0).max(100).optional(),
  weakTopicTags: textList,
})

export const sessionNoteCreateSchema = z.object({
  studentId: z.string().trim().min(1),
  tutorUserId: z.string().trim().min(1).optional(),
  sessionDate: z.string().trim().datetime().optional(),
  subject: z.string().trim().max(120).optional(),
  topicsCovered: textList,
  homeworkAssigned: textList,
  weakTopics: textList,
  nextSteps: textList,
  summary: z.string().trim().min(3).max(6000),
  rawNotes: z.string().trim().max(12000).optional(),
})

export const parentReportCreateSchema = z.object({
  studentId: z.string().trim().min(1),
  sessionNoteId: z.string().trim().min(1).optional(),
  periodStart: z.string().trim().datetime().optional(),
  periodEnd: z.string().trim().datetime().optional(),
  topicsCovered: textList,
  strengths: textList,
  weaknesses: textList,
  homeworkAssigned: textList,
  progressNote: z.string().trim().min(3).max(6000),
  generatedText: z.string().trim().min(3).max(6000).optional(),
  channel: z.enum(tutoringDeliveryChannelValues).default('in_app'),
  deliveryStatus: z.enum(tutoringDeliveryStatusValues).default('draft'),
})

export const tutoringSessionSummarySchema = z.object({
  studentName: z.string().trim().min(1).max(120),
  gradeLevel: z.string().trim().max(64).optional(),
  curriculum: z.string().trim().max(64).optional(),
  subject: z.string().trim().max(120).optional(),
  sessionDate: z.string().trim().datetime().optional(),
  topicsCovered: textList,
  homeworkAssigned: textList,
  weakTopics: textList,
  rawNotes: z.string().trim().max(12000).optional(),
})

export const tutoringParentSummaryDraftSchema = z.object({
  studentName: z.string().trim().min(1).max(120),
  gradeLevel: z.string().trim().max(64).optional(),
  curriculum: z.string().trim().max(64).optional(),
  topicsCovered: textList,
  strengths: textList,
  weaknesses: textList,
  homeworkAssigned: textList,
  progressNote: z.string().trim().min(3).max(6000),
  weakTopics: textList,
})

export type LeadCreateInput = z.infer<typeof leadCreateSchema>
export type TaskCreateInput = z.infer<typeof taskCreateSchema>
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>
export type SubmissionCreateInput = z.infer<typeof submissionCreateSchema>
export type FeedbackCreateInput = z.infer<typeof feedbackCreateSchema>
export type SessionNoteCreateInput = z.infer<typeof sessionNoteCreateSchema>
export type ParentReportCreateInput = z.infer<typeof parentReportCreateSchema>
export type TutoringSessionSummaryInput = z.infer<typeof tutoringSessionSummarySchema>
export type TutoringParentSummaryDraftInput = z.infer<typeof tutoringParentSummaryDraftSchema>
