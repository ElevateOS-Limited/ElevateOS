'use client'

import { useEffect, useMemo, useState } from 'react'
import { Download, Library, Link2, UploadCloud } from 'lucide-react'
import { useTutoringUi } from './TutoringDashboardShell'
import { useTutoringWorkspace } from './useTutoringWorkspace'
import {
  demoTutoringWorkspace,
  getTutoringStudentsForPov,
  accessTierLabel,
  isParentPov,
  isStudentPov,
  isTutorPov,
  resourceKindLabel,
  tutoringSectionMeta,
  type TutoringAccessTier,
  type TutoringResourceKind,
} from './tutoring-data'

const accessTierOrder: TutoringAccessTier[] = ['free', 'ai_premium', 'tutoring_premium', 'tutor_only']
const resourceKindOrder: TutoringResourceKind[] = ['lesson_file', 'question_bank', 'model_answer', 'tutor_resource']

export default function TutoringResourcesPage() {
  const { activePov } = useTutoringUi()
  const { data, isLoading, error } = useTutoringWorkspace()
  const resources = data?.resources ?? demoTutoringWorkspace.resources
  const parentView = isParentPov(activePov)
  const studentView = isStudentPov(activePov)
  const tutorView = isTutorPov(activePov)
  const students = data?.students ?? demoTutoringWorkspace.students
  const visibleStudents = getTutoringStudentsForPov(students, activePov)
  const visibleStudentIds = useMemo(() => new Set(visibleStudents.map((student) => student.id)), [visibleStudents])
  const [selectedResourceId, setSelectedResourceId] = useState<string>('')
  const [kindFilter, setKindFilter] = useState<TutoringResourceKind | 'all'>('all')
  const [tierFilter, setTierFilter] = useState<TutoringAccessTier | 'all'>('all')

  useEffect(() => {
    if (!selectedResourceId && resources[0]?.id) {
      setSelectedResourceId(resources[0].id)
    }
  }, [resources, selectedResourceId])

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      const kindMatches = kindFilter === 'all' || resource.kind === kindFilter
      const tierMatches = tierFilter === 'all' || resource.accessTier === tierFilter
      const studentMatches = tutorView || !resource.studentId || visibleStudentIds.has(resource.studentId)
      return kindMatches && tierMatches && studentMatches
    })
  }, [resources, kindFilter, tierFilter, tutorView, visibleStudentIds])

  const selectedResource = useMemo(
    () => filteredResources.find((resource) => resource.id === selectedResourceId) ?? filteredResources[0] ?? null,
    [filteredResources, selectedResourceId],
  )

  const summary = useMemo(() => {
    if (studentView) {
      return [
        { label: 'Resources', value: resources.length },
        { label: 'Lesson files', value: resources.filter((resource) => resource.kind === 'lesson_file').length },
        { label: 'Practice sets', value: resources.filter((resource) => resource.kind === 'question_bank').length },
      ]
    }

    return [
      { label: 'Resources', value: resources.length },
      { label: 'Lesson files', value: resources.filter((resource) => resource.kind === 'lesson_file').length },
      { label: 'Tutor-only', value: resources.filter((resource) => resource.accessTier === 'tutor_only').length },
    ]
  }, [resources, studentView])

  if (isLoading && !data) {
    return <div className="rounded-[1.25rem] border border-slate-900/10 bg-white p-6 text-sm text-slate-500 shadow-sm">Loading resources…</div>
  }

  if (error) {
    return <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">Unable to load tutoring resources.</div>
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.02fr_.98fr]">
      <section className="space-y-4">
        <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-[#f8f5ef] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">
            <Library className="h-3.5 w-3.5" />
            {tutoringSectionMeta.resources.title}
          </div>
          <h1 className="font-display mt-4 text-3xl tracking-tight text-slate-950">
            {parentView ? 'Resources visible to families and students' : studentView ? 'Study files and practice banks' : 'Lesson files, question banks, and tutor notes'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
            {parentView
              ? 'Parents only need a high-level view of what is supporting the current week.'
              : studentView
                ? 'Students can open the files tied to their work, with a lighter view focused on what is due next.'
                : 'Tutors can switch between lesson files, practice banks, model answers, and tutor notes without leaving the dashboard.'}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {summary.map((item) => (
              <div key={item.label} className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setKindFilter('all')}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${kindFilter === 'all' ? 'border-[#3B82F6] bg-[#EFF6FF] text-[#3B82F6]' : 'border-slate-900/10 bg-white text-slate-600 hover:bg-[#f8f5ef]'}`}
          >
            All kinds
          </button>
          {resourceKindOrder.map((kind) => (
            <button
              key={kind}
              type="button"
              onClick={() => setKindFilter(kind)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${kindFilter === kind ? 'border-[#3B82F6] bg-[#EFF6FF] text-[#3B82F6]' : 'border-slate-900/10 bg-white text-slate-600 hover:bg-[#f8f5ef]'}`}
            >
              {resourceKindLabel(kind)}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setTierFilter('all')}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${tierFilter === 'all' ? 'border-[#3B82F6] bg-[#EFF6FF] text-[#3B82F6]' : 'border-slate-900/10 bg-white text-slate-600 hover:bg-[#f8f5ef]'}`}
          >
            All access
          </button>
          {accessTierOrder.map((tier) => (
            <button
              key={tier}
              type="button"
              onClick={() => setTierFilter(tier)}
              className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${tierFilter === tier ? 'border-[#3B82F6] bg-[#EFF6FF] text-[#3B82F6]' : 'border-slate-900/10 bg-white text-slate-600 hover:bg-[#f8f5ef]'}`}
            >
              {accessTierLabel(tier)}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredResources.map((resource) => {
            const selected = resource.id === selectedResource?.id

            return (
              <button
                key={resource.id}
                type="button"
                onClick={() => setSelectedResourceId(resource.id)}
                className={[
                  'w-full rounded-[1.25rem] border p-4 text-left transition-all',
                  selected ? 'border-[#3B82F6] bg-[#EFF6FF] shadow-sm' : 'border-slate-900/10 bg-white hover:-translate-y-0.5 hover:shadow-md',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{resource.title}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      {resourceKindLabel(resource.kind)} · {resource.subject} · {resource.topic}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-900/10 bg-[#f8f5ef] px-3 py-1 text-xs font-semibold text-slate-700">
                    {accessTierLabel(resource.accessTier)}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-slate-600">{resource.summary}</p>
              </button>
            )
          })}
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-[1.5rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2c06d]">Resource detail</p>
          {selectedResource ? (
            <div className="mt-4 space-y-4">
              <div>
                <p className="text-2xl font-semibold">{selectedResource.title}</p>
                <p className="mt-1 text-sm text-white/65">
                  {selectedResource.subject} · {selectedResource.topic}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Kind</p>
                  <p className="mt-2 text-sm font-semibold">{resourceKindLabel(selectedResource.kind)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Access</p>
                  <p className="mt-2 text-sm font-semibold">{accessTierLabel(selectedResource.accessTier)}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/75">
                {selectedResource.summary}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Uploaded by</p>
                  <p className="mt-2 text-sm font-semibold">{selectedResource.uploadedBy}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/45">Linked task</p>
                  <p className="mt-2 text-sm font-semibold">{selectedResource.taskId || 'None'}</p>
                </div>
              </div>

              {selectedResource.fileName ? (
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/75">
                  File: {selectedResource.fileName}
                </div>
              ) : null}

              {selectedResource.externalLink ? (
                <a
                  href={selectedResource.externalLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-[0.9rem] bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-95"
                >
                  Open linked file
                  <Link2 className="h-4 w-4" />
                </a>
              ) : (
                <button type="button" className="inline-flex items-center gap-2 rounded-[0.9rem] bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:opacity-95">
                  Download
                  <Download className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">Select a resource to inspect the file, access tier, and linked task.</div>
          )}
        </div>

        <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            <UploadCloud className="h-4 w-4" />
            Upload flow
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {parentView
              ? 'Families do not upload here, but this panel shows the same structure used to add lesson files, answer keys, or study notes.'
              : studentView
                ? 'Students can browse and open files here. Uploads stay with the tutor.'
                : 'Keep uploads simple: choose the access tier, link the task, and store the file in one place.'}
          </p>
          {tutorView ? (
            <div className="mt-4 rounded-[1rem] border border-slate-900/10 bg-[#f8f5ef] p-4 text-sm leading-7 text-slate-600">
              Choose a file, pick who can see it, and link it to the task before saving.
            </div>
          ) : (
            <div className="mt-4 rounded-[1rem] border border-slate-900/10 bg-[#f8f5ef] p-4 text-sm leading-7 text-slate-600">
              Open a file to review the next session plan.
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
