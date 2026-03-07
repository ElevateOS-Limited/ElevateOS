export default function ActivitiesPrototypePage() {
  return (
    <main className="min-h-screen bg-[#0f172a] text-white px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-wider text-cyan-300">Prototype Environment</p>
          <h1 className="text-3xl md:text-4xl font-bold">Activity Recommender Tool</h1>
          <p className="text-slate-300 max-w-3xl">
            This is an isolated prototype surface for Funnel 2 exploration. It is separated from the
            production quickstart flow so we can test UX and recommendation logic safely.
          </p>
        </header>

        <section className="grid md:grid-cols-3 gap-4">
          <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <h2 className="font-semibold text-cyan-300">Student Inputs</h2>
            <p className="text-sm text-slate-300 mt-2">Grade, target majors, profile strengths, time availability.</p>
          </article>
          <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <h2 className="font-semibold text-cyan-300">Recommendation Engine</h2>
            <p className="text-sm text-slate-300 mt-2">Rank activities by fit, feasibility, evidence strength, and momentum.</p>
          </article>
          <article className="rounded-xl border border-slate-700 bg-slate-900/70 p-4">
            <h2 className="font-semibold text-cyan-300">Execution Plan</h2>
            <p className="text-sm text-slate-300 mt-2">Output top picks + 90-day action milestones and tutor review controls.</p>
          </article>
        </section>

        <section className="rounded-xl border border-slate-700 bg-slate-900/60 p-5">
          <h3 className="font-semibold">Subdomain binding</h3>
          <p className="text-sm text-slate-300 mt-2">
            Hostname <code className="bg-slate-800 px-1.5 py-0.5 rounded">activities.appdemo.thinkcollegelevel.com</code>
            is routed to this prototype surface via middleware host rewrite.
          </p>
        </section>
      </div>
    </main>
  )
}
