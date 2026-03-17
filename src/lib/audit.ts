import { prisma } from '@/lib/prisma'

interface WriteAuditInput {
  actorUserId: string
  resourceType: string
  resourceId: string
  action: 'create' | 'update' | 'delete'
  result: 'success' | 'not_found' | 'forbidden' | 'error'
  details?: Record<string, unknown>
}

export async function writeAuditLog(input: WriteAuditInput) {
  try {
    await prisma.eventLog.create({
      data: {
        userId: input.actorUserId,
        eventType: 'write_audit',
        meta: {
          actorUserId: input.actorUserId,
          resourceType: input.resourceType,
          resourceId: input.resourceId,
          action: input.action,
          result: input.result,
          details: input.details ?? null,
          at: new Date().toISOString(),
        },
      },
    })
  } catch (error) {
    // Audit logging must not block the primary write path.
    console.error('write_audit_failed', {
      actorUserId: input.actorUserId,
      resourceType: input.resourceType,
      resourceId: input.resourceId,
      action: input.action,
      result: input.result,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
