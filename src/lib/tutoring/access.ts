import { normalizeRole } from '@/lib/auth/roles'
import { prisma } from '@/lib/prisma'

export type TutoringSessionLike = {
  user?: {
    id?: string | null
    role?: string | null
  } | null
}

function uniqueStrings(values: string[]) {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)))
}

export async function getAccessibleTutoringStudentIds(session: TutoringSessionLike): Promise<string[]> {
  const userId = session.user?.id?.trim() || ''
  const role = normalizeRole(session.user?.role || null)

  if (!userId || !role) return []

  if (role === 'OWNER' || role === 'ADMIN') {
    const studentRows = await prisma.user.findMany({
      where: {
        OR: [{ studentProfile: { isNot: null } }, { tutoringTasksOwned: { some: {} } }],
      },
      select: { id: true },
      orderBy: { name: 'asc' },
    })
    return studentRows.map((student) => student.id)
  }

  if (role === 'STUDENT' || role === 'USER') {
    return [userId]
  }

  if (role === 'PARENT') {
    const links = await prisma.tutoringStudentParent.findMany({
      where: { parentUserId: userId },
      select: { studentUserId: true },
      orderBy: { createdAt: 'asc' },
    })
    return uniqueStrings(links.map((link) => link.studentUserId))
  }

  if (role === 'TUTOR') {
    const links = await prisma.tutoringStudentTutor.findMany({
      where: { tutorUserId: userId },
      select: { studentUserId: true },
      orderBy: { createdAt: 'asc' },
    })
    return uniqueStrings(links.map((link) => link.studentUserId))
  }

  return []
}

export async function canAccessTutoringStudent(session: TutoringSessionLike, studentUserId: string) {
  const accessibleStudentIds = await getAccessibleTutoringStudentIds(session)
  return accessibleStudentIds.includes(studentUserId.trim())
}

export async function getPrimaryTutoringStudentId(session: TutoringSessionLike, requestedStudentId?: string | null) {
  const accessibleStudentIds = await getAccessibleTutoringStudentIds(session)
  const candidate = requestedStudentId?.trim() || ''

  if (candidate && (accessibleStudentIds.length === 0 || accessibleStudentIds.includes(candidate))) {
    return candidate
  }

  return accessibleStudentIds[0] || null
}
