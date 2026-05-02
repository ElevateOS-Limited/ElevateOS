'use client'

import { useQuery } from '@tanstack/react-query'
import type { TutoringWorkspaceSnapshot } from '@/lib/tutoring/mock-data'

async function fetchTutoringWorkspace(): Promise<TutoringWorkspaceSnapshot> {
  const response = await fetch('/api/tutoring/workspace', {
    credentials: 'include',
  })
  const data = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(data?.error || 'Failed to load tutoring dashboard')
  }

  return data as TutoringWorkspaceSnapshot
}

export function useTutoringWorkspace() {
  return useQuery({
    queryKey: ['tutoring-workspace'],
    queryFn: fetchTutoringWorkspace,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  })
}
