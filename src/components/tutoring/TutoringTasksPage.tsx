'use client'

import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react'
import { CheckCircle2, FileText, Paperclip, Send, Sparkles } from 'lucide-react'
import { useTutoringUi } from './TutoringDashboardShell'
import { useTutoringWorkspace } from './useTutoringWorkspace'
import {
  demoTutoringWorkspace,
  getTutoringStudentsForPov,
  formatDateLabel,
  formatDateTimeLabel,
  isParentPov,
  isStudentPov,
  isTutorPov,
  taskStatusClasses,
  taskStatusLabel,
  tutoringSectionMeta,
} from './tutoring-data'

export default function TutoringTasksPage() {
  const { activePov } = useTutoringUi()
  const { data, isLoading, error } = useTutoringWorkspace()
  const parentView = isParentPov(activePov)
  const studentView = isStudentPov(activePov)
  const tutorView = isTutorPov(activePov)
  const students = data?.students ?? demoTutoringWorkspace.students
  const visibleStudents = getTutoringStudentsForPov(students, activePov)
  const visibleStudentIds = new Set(visibleStudents.map((student) => student.id))
  const tasks = (data?.tasks ?? demoTutoringWorkspace.tasks).filter((task) => tutorView || visibleStudentIds.has(task.studentId))
  const submissions = (data?.submissions ?? demoTutoringWorkspace.submissions).filter((submission) => tutorView || visibleStudentIds.has(submission.studentId))
  const resources = (data?.resources ?? demoTutoringWorkspace.resources).filter((resource) => tutorView || !resource.studentId || visibleStudentIds.has(resource.studentId))
  const feedback = (data?.feedback ?? demoTutoringWorkspace.feedback).filter((item) => tutorView || visibleStudentIds.has(item.studentId))
  const [selectedTaskId, setSelectedTaskId] = useState<string>('')
  const [submissionText, setSubmissionText] = useState('')
  const [submissionLink, setSubmissionLink] = useState('')
  const [submissionFileName, setSubmissionFileName] = useState('')
  const [submittedTaskId, setSubmittedTaskId] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedTaskId && tasks[0]?.id) {
      setSelectedTaskId(tasks[0].id)
    }
  }, [selectedTaskId, tasks])

  const selectedTask = tasks.find((task) => task.id === selectedTaskId) ?? tasks[0] ?? null
  const selectedSubmission = selectedTask ? submissions.find((submission) => submission.taskId === selectedTask.id) ?? null : null
  const selectedFeedback = selectedTask ? feedback.find((item) => item.taskId === selectedTask.id) ?? null : null
  const selectedResources = selectedTask ? resources.filter((resource) => resource.taskId === selectedTask.id) : []

  useEffect(() => {
    if (!selectedTask) return
    const currentSubmission = submissions.find((submission) => submission.taskId === selectedTask.id)
    setSubmissionText(currentSubmission?.textResponse || '')
    setSubmissionLink(currentSubmission?.externalLink || '')
    setSubmissionFileName(currentSubmission?.fileName || '')
    setSubmittedTaskId(currentSubmission?.taskId || null)
  }, [selectedTask, submissions])

  const summary = [
    { label: 'Assigned', value: tasks.filter((task) => task.status === 'assigned').length },
    { label: 'Submitted', value: tasks.filter((task) => task.status === 'submitted').length },
    { label: 'Reviewed', value: tasks.filter((task) => task.status === 'reviewed' || task.status === 'completed').length },
    { label: 'Overdue', value: tasks.filter((task) => task.status === 'overdue').length },
  ]

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    setSubmissionFileName(file?.name || '')
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!selectedTask) return
    setSubmittedTaskId(selectedTask.id)
  }

  if (isLoading && !data) {
    return <div className="rounded-[1.25rem] border border-slate-900/10 bg-white p-6 text-sm text-slate-500 shadow-sm">Loading tasks…</div>
  }

  if (error) {
    return <div className="rounded-[1.25rem] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-800">Unable to load tutoring tasks.</div>
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[1.02fr_.98fr]">
      <section className="space-y-4">
        <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-[#f8f5ef] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">
            <FileText className="h-3.5 w-3.5" />
            {tutoringSectionMeta.tasks.title}
          </div>
          <h1 className="font-display mt-4 text-3xl tracking-tight text-slate-950">
            {parentView ? 'Family assignments and due dates' : studentView ? 'Today’s assignments and uploads' : 'Weekly assignments and submissions'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
            {parentView
              ? 'Parents can see what has been assigned, what is due next, and whether any work still needs to be submitted.'
              : 'Keep the week narrow: task instructions, source files, and a single clear submission path stay on the same screen.'}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {summary.map((item) => (
              <div key={item.label} className="rounded-[1.25rem] border border-slate-900/10 bg-[#f8f5ef] p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                <p className="mt-2 text-3xl font-semibold text-slate-950">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {tasks.map((task) => {
            const selected = task.id === selectedTask?.id
            const submission = submissions.find((item) => item.taskId === task.id) ?? null

            return (
              <button
                key={task.id}
                type="button"
                onClick={() => setSelectedTaskId(task.id)}
                className={[
                  'w-full rounded-[1.25rem] border p-4 text-left transition-all',
                  selected ? 'border-[#3B82F6] bg-[#EFF6FF] shadow-sm' : 'border-slate-900/10 bg-white hover:-translate-y-0.5 hover:shadow-md',
                ].join(' ')}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{task.title}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
                      {task.studentName} · {task.subject} · {task.topic}
                    </p>
                  </div>
                  <span className={['rounded-full border px-3 py-1 text-xs font-semibold', taskStatusClasses(task.status)].join(' ')}>
                    {taskStatusLabel(task.status)}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-4 text-sm text-slate-600">
                  <span>Due {formatDateLabel(task.dueAt)}</span>
                  <span>{task.resourceTitles.length} resources</span>
                  <span>{submission ? 'Submission received' : 'Awaiting upload'}</span>
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-[1.5rem] border border-slate-900/10 bg-slate-950 p-6 text-white shadow-lg shadow-slate-950/10">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#f2c06d]">Task detail</p>
          {selectedTask ? (
            <div className="mt-4 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-2xl font-semibold">{selectedTask.title}</p>
                  <p className="mt-1 text-sm text-white/65">
                    {selectedTask.studentName} · {selectedTask.subject} · {selectedTask.topic}
                  </p>
                </div>
                <div className={`rounded-full border px-3 py-1 text-xs font-semibold ${taskStatusClasses(selectedTask.status)}`}>
                  {taskStatusLabel(selectedTask.status)}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/55">Due date</p>
                  <p className="mt-2 text-sm font-semibold">{formatDateTimeLabel(selectedTask.dueAt)}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/55">Assigned by</p>
                  <p className="mt-2 text-sm font-semibold">{selectedTask.assignedBy}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/75">
                {selectedTask.instructions}
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold">Resources</p>
                  <span className="text-xs uppercase tracking-[0.18em] text-white/45">{selectedResources.length} linked</span>
                </div>
                <div className="mt-3 space-y-2">
                  {(selectedResources.length ? selectedResources : selectedTask.resourceTitles).map((resource, index) => (
                    <div key={typeof resource === 'string' ? resource : resource.id ?? index} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span>{typeof resource === 'string' ? resource : resource.title}</span>
                        <Paperclip className="h-4 w-4 text-white/45" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedFeedback ? (
                <div className="rounded-2xl border border-emerald-400/20 bg-emerald-500/10 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-emerald-200">
                    <Sparkles className="h-4 w-4" />
                    Latest review
                  </div>
                  <p className="mt-2 text-sm leading-7 text-white/75">{selectedFeedback.comments}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.18em] text-white/45">Score {selectedFeedback.score}</p>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">Select a task to see its instructions and submission history.</div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="rounded-[1.5rem] border border-slate-900/10 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            <Send className="h-4 w-4" />
            Submission flow
          </div>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            {parentView
              ? 'This is the same upload path a student would use, shown here so tutors and parents can see the state clearly.'
              : 'Drop in a text response, attach a file, or add an optional link. The state below shows whether a submission already exists.'}
          </p>

          <label className="mt-4 block">
            <span className="mb-2 block text-sm font-medium text-slate-700">Response</span>
            <textarea
              value={submissionText}
              onChange={(event) => setSubmissionText(event.target.value)}
              rows={6}
              placeholder="Write the answer, summary, or correction here..."
              className="w-full rounded-[1rem] border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-[#3B82F6]"
            />
          </label>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">Optional link</span>
              <input
                value={submissionLink}
                onChange={(event) => setSubmissionLink(event.target.value)}
                type="url"
                placeholder="https://..."
                className="w-full rounded-[1rem] border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-[#3B82F6]"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-slate-700">File upload</span>
              <input
                type="file"
                onChange={handleFileChange}
                className="w-full rounded-[1rem] border border-slate-900/10 bg-white px-4 py-[0.72rem] text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-slate-950 file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-white"
              />
            </label>
          </div>

          <div className="mt-4 rounded-[1rem] border border-slate-900/10 bg-[#f8f5ef] p-4 text-sm leading-7 text-slate-600">
            {submittedTaskId === selectedTask?.id
              ? 'Submission saved locally for now.'
              : selectedSubmission
                ? `Last submission: ${formatDateTimeLabel(selectedSubmission.submittedAt)}`
                : 'No submission yet for this task.'}
            {submissionFileName ? <div className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">Attached file: {submissionFileName}</div> : null}
          </div>

          <div className="mt-4 flex gap-2">
            <button type="submit" className="inline-flex flex-1 items-center justify-center gap-2 rounded-[0.9rem] bg-[#3B82F6] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#60A5FA]">
              <CheckCircle2 className="h-4 w-4" />
              {submittedTaskId === selectedTask?.id ? 'Update submission' : 'Submit work'}
            </button>
            <button
              type="button"
              onClick={() => {
                setSubmissionText('')
                setSubmissionLink('')
                setSubmissionFileName('')
              }}
              className="inline-flex items-center justify-center rounded-[0.9rem] border border-slate-900/10 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-[#f8f5ef]"
            >
              Clear
            </button>
          </div>
        </form>
      </aside>
    </div>
  )
}
