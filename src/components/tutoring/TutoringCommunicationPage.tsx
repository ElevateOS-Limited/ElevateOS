'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, MessageSquare, Send } from 'lucide-react'
import { useTutoringUi } from './TutoringDashboardShell'
import { tutoringThreads } from './tutoring-data'

export default function TutoringCommunicationPage() {
  const { activePov } = useTutoringUi()
  const [selectedThreadId, setSelectedThreadId] = useState(tutoringThreads[0].id)
  const [draft, setDraft] = useState('')
  const parentView = activePov === 'Parent POV'
  const visibleThreads = parentView ? tutoringThreads.filter((thread) => thread.channel === 'Parent') : tutoringThreads
  const selectedThread = useMemo(
    () => visibleThreads.find((thread) => thread.id === selectedThreadId) ?? visibleThreads[0],
    [selectedThreadId, visibleThreads],
  )

  const queueLabel = parentView ? 'Parent updates' : 'Queue summary'
  const helperLabel = parentView ? 'Reply in parent-friendly language and keep the next step clear.' : 'Replies are local-only in this MVP, but the route is real so each sidebar action can own its own workflow page.'

  return (
    <div className="grid gap-4 xl:grid-cols-[1.05fr_.95fr]">
      <section className="space-y-4">
        <div className="rounded-[1.5rem] border border-slate-900/10 bg-white p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-[#f8f5ef] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#9a5b00]">
            <MessageSquare className="h-3.5 w-3.5" />
            Communication
          </div>
          <h1 className="font-display mt-4 text-3xl tracking-tight text-slate-950">
            {parentView ? 'Parent updates and follow-ups' : 'Threads that need a reply'}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
            {parentView
              ? 'Only household-facing messages are shown here so a parent can review progress without tutor-only noise.'
              : 'Keep parent, tutor, and student conversations in one place. Active view: Tutor POV.'}
          </p>
        </div>

        <div className="space-y-3">
          {visibleThreads.map((thread) => (
            <button
              key={thread.id}
              type="button"
              onClick={() => setSelectedThreadId(thread.id)}
              className={[
                'w-full rounded-[1.25rem] border p-4 text-left transition-all',
                selectedThread?.id === thread.id ? 'border-[#3B82F6] bg-[#EFF6FF] shadow-sm' : 'border-slate-900/10 bg-white hover:-translate-y-0.5 hover:shadow-md',
              ].join(' ')}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-950">{thread.studentName}</p>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{parentView ? 'Family update' : `${thread.channel} · ${thread.subject}`}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{thread.updatedAt}</p>
                    {thread.unread ? <p className="mt-1 text-xs font-semibold text-[#d97706]">Unread</p> : null}
                </div>
              </div>
              <p className="mt-3 text-sm leading-7 text-slate-600">{thread.lastMessage}</p>
            </button>
          ))}
        </div>
      </section>

      <aside className="space-y-4">
        <div className="rounded-[1.25rem] border border-slate-900/10 bg-white p-5 shadow-sm">
          {selectedThread ? (
            <div className="space-y-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{parentView ? 'Parent thread' : 'Selected thread'}</div>
                <p className="mt-2 text-lg font-semibold text-slate-950">{selectedThread.studentName}</p>
                <p className="text-sm text-slate-500">{parentView ? selectedThread.subject : `${selectedThread.channel} · ${selectedThread.subject}`}</p>
              </div>

              <div className="rounded-[1rem] bg-[#f8f5ef] p-4 text-sm leading-7 text-slate-700">{selectedThread.detail}</div>

              <div className="rounded-[1rem] border border-slate-900/10 p-4 text-sm leading-7 text-slate-700">
                <span className="font-semibold text-slate-950">Latest message:</span> {selectedThread.lastMessage}
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{parentView ? 'Parent reply' : 'Draft reply'}</span>
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  rows={5}
                  placeholder={parentView ? 'Write a clear family update...' : 'Write a concise reply for the parent or student...'}
                  className="w-full rounded-[1rem] border border-slate-900/10 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-[#3B82F6]"
                />
              </label>

              <div className="flex flex-wrap gap-2">
                {(parentView
                  ? ['Thanks for checking in', 'I’ll send a recap after the session', 'We will review this next time']
                  : ['Thanks for the update', 'I’ll send the recap tonight', 'Let’s review this in the next session']
                ).map((snippet) => (
                  <button key={snippet} type="button" onClick={() => setDraft(snippet)} className="rounded-full border border-slate-900/10 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-[#f8f5ef]">
                    {snippet}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <button type="button" className="inline-flex flex-1 items-center justify-center gap-2 rounded-[0.9rem] bg-[#3B82F6] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#60A5FA]">
                  <Send className="h-4 w-4" />
                  {parentView ? 'Send parent update' : 'Send reply'}
                </button>
                <Link href="/dashboard/recaps" className="inline-flex flex-1 items-center justify-center gap-2 rounded-[0.9rem] border border-slate-900/10 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-[#f8f5ef]">
                  <ArrowRight className="h-4 w-4" />
                  {parentView ? 'Review recap' : 'View recap'}
                </Link>
              </div>
            </div>
          ) : null}
        </div>

        <div className="rounded-[1.25rem] border border-slate-900/10 bg-slate-950 p-5 text-white shadow-lg shadow-slate-950/10">
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#f2c06d]">{queueLabel}</div>
          <div className="mt-4 grid grid-cols-3 gap-3 text-center">
            {[
              ['Unread', visibleThreads.filter((thread) => thread.unread).length],
              [parentView ? 'Families' : 'Parent', visibleThreads.filter((thread) => thread.channel === 'Parent').length],
              [parentView ? 'Visible' : 'Need reply', visibleThreads.length],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded-[1rem] border border-white/10 bg-white/5 p-3">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/55">{label}</p>
                <p className="mt-1 text-2xl font-semibold">{value as number}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm leading-7 text-white/75">
            {helperLabel}
          </p>
        </div>
      </aside>
    </div>
  )
}
