import Link from 'next/link'

const codeApi = `// POST /api/ai-integrity/analyze
export async function POST(req: NextRequest) {
  const session = await requireSession(req)
  requireRole(session, ['OWNER','ADMIN','TUTOR'])

  const form = await req.formData()
  const file = form.get('file') as File
  const studentId = String(form.get('studentId') || '')
  const assignmentTitle = String(form.get('assignmentTitle') || 'Untitled')

  const storage = await putObject(file)
  const text = await extractText(file)
  const segments = segmentText(text, { minWords: 150, maxWords: 300 })

  const job = await prisma.aiDetectionJob.create({
    data: { orgId: session.orgId, studentId, documentId: storage.documentId, assignmentTitle, status: 'PROCESSING' }
  })

  await queue.add('ai-detect-segments', { jobId: job.id, orgId: session.orgId, studentId, segments })
  return NextResponse.json({ jobId: job.id })
}`

const codeSeg = `export function segmentText(input: string, cfg = { minWords:150, maxWords:300 }) {
  const paragraphs = input.split(/\n{2,}/).map(p => p.trim()).filter(Boolean)
  const out: { index:number; text:string }[] = []
  let buf: string[] = []
  let words = 0

  const flush = () => {
    if (!buf.length) return
    out.push({ index: out.length, text: buf.join('\n\n') })
    buf = []; words = 0
  }

  for (const p of paragraphs) {
    const wc = p.split(/\s+/).length
    if (words + wc > cfg.maxWords && words >= cfg.minWords) flush()
    buf.push(p)
    words += wc
  }
  flush()
  return out
}`

const codeScore = `function scoreSegment(seg, baseline?) {
  const perplexity = perplexityScore(seg.text)      // lower can imply AI-like predictability
  const burstiness = burstinessScore(seg.text)      // variance in sentence length
  const style = stylometryScore(seg.text, baseline) // TTR, passive voice, repetition, tone
  const llmJudge = llmLikelyAi(seg.text)            // secondary model probability + rationale

  // Weighted conservative model
  let p = 0.30*perplexity + 0.20*burstiness + 0.30*style + 0.20*llmJudge.probability

  // reduce false positives when signals disagree
  const disagreement = signalDisagreement([perplexity, burstiness, style, llmJudge.probability])
  if (disagreement > 0.35) p = p * 0.85

  const confidence = p > 0.8 ? 'HIGH' : p > 0.55 ? 'MODERATE' : 'LOW'
  return { probability: Math.round(p*100), confidence, rationale: llmJudge.rationale,
           signalScores: { perplexity, burstiness, stylometry: style, llmJudge: llmJudge.probability } }
}`

const prismaPatch = `model AiDetectionJob {
  id              String   @id @default(cuid())
  orgId           String
  studentId       String?
  documentId      String?
  assignmentTitle String
  status          String   // PROCESSING, COMPLETED, FAILED
  overallProb     Float?
  riskLevel       String?  // LOW, MODERATE, HIGH
  createdAt       DateTime @default(now())
  completedAt     DateTime?
  segments        AiDetectionSegment[]
  report          AiDetectionReport?
  @@index([orgId, studentId, createdAt])
}

model AiDetectionSegment {
  id            String   @id @default(cuid())
  orgId         String
  jobId         String
  segmentIndex  Int
  segmentText   String
  probability   Float
  confidence    String   // LOW, MODERATE, HIGH
  label         String   // LIKELY_HUMAN, MIXED, MOST_LIKELY_AI
  rationale     String
  signalScores  Json
  highlighted   Json?    // sentence spans with severity
  createdAt     DateTime @default(now())
  job           AiDetectionJob @relation(fields:[jobId], references:[id])
  @@index([orgId, jobId, segmentIndex])
}

model AiDetectionReport {
  id            String   @id @default(cuid())
  orgId         String
  jobId         String   @unique
  studentId     String?
  format        String   // PDF, DOCX
  artifactKey   String
  createdAt     DateTime @default(now())
  job           AiDetectionJob @relation(fields:[jobId], references:[id])
}`

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-6xl px-6 py-12 space-y-8">
        <header className="space-y-4">
          <p className="text-xs uppercase tracking-widest text-slate-400">ElevateOS demo</p>
          <h1 className="text-4xl md:text-5xl font-bold">Tutoring workflow + integrity checks</h1>
          <p className="text-slate-300 max-w-3xl">A multi-tenant workflow for tutors and schools with document-grounded generation, assessments, analytics, and academic integrity checks.</p>
          <div className="flex gap-3">
            <Link href="/dashboard" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500">Open Dashboard</Link>
            <Link href="/dashboard/settings" className="px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-900">Settings</Link>
          </div>
        </header>

        <section className="grid md:grid-cols-2 gap-4">
          {[
            'Frontend: Next.js App Router + TypeScript + Tailwind',
            'Backend: API routes + service layer + workers',
            'Data: PostgreSQL + Prisma + org-level tenant isolation',
            'Storage: S3-compatible artifacts for files/PDF/PPTX',
            'Queue: BullMQ/Redis for ingestion/generation/reporting',
            'AI: retrieval + structured generation + citation support',
            'Integrity: perplexity + burstiness + stylometry + LLM judge',
            'Reporting: PDF/DOCX exports + trend history per student',
          ].map((x) => (
            <div key={x} className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 text-sm">{x}</div>
          ))}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 space-y-3">
          <h2 className="text-2xl font-semibold">AI Detection Pipeline (Text Diagram)</h2>
          <ol className="list-decimal pl-6 text-slate-300 space-y-1 text-sm">
            <li>Upload file (PDF/DOCX/TXT) and create AiDetectionJob.</li>
            <li>Extract raw text and segment into 150–300 word logical blocks.</li>
            <li>Run per-segment signals: perplexity, burstiness, stylometry, LLM probability+reason.</li>
            <li>Fuse scores conservatively; reduce probability when signals conflict.</li>
            <li>Classify segment: Likely Human / Mixed / Most Likely AI Generated.</li>
            <li>Highlight only sentence spans above threshold (yellow=moderate, red=high).</li>
            <li>Compute overall weighted probability and document risk level.</li>
            <li>Generate PDF/DOCX report, store artifact key, attach to student profile history.</li>
          </ol>
          <p className="text-xs text-amber-300">Disclaimer: AI detection is probabilistic and should be used as one factor in academic evaluation.</p>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Prisma Additions</h2>
          <pre className="rounded-xl border border-slate-800 bg-black/40 p-4 overflow-auto text-xs"><code>{prismaPatch}</code></pre>
        </section>

        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">API Route Example</h2>
          <pre className="rounded-xl border border-slate-800 bg-black/40 p-4 overflow-auto text-xs"><code>{codeApi}</code></pre>
        </section>

        <section className="grid lg:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Text Segmentation Logic</h2>
            <pre className="rounded-xl border border-slate-800 bg-black/40 p-4 overflow-auto text-xs"><code>{codeSeg}</code></pre>
          </div>
          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Scoring Logic Pseudocode</h2>
            <pre className="rounded-xl border border-slate-800 bg-black/40 p-4 overflow-auto text-xs"><code>{codeScore}</code></pre>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
          <h2 className="text-2xl font-semibold mb-3">UI Structure: “AI Integrity Check”</h2>
          <ul className="list-disc pl-6 text-sm text-slate-300 space-y-1">
            <li>Sidebar: AI Integrity Check</li>
            <li>Upload panel: drag/drop + student + assignment selector</li>
            <li>Results split view: document left, segment table right</li>
            <li>Filters: risk level, confidence, signal thresholds</li>
            <li>Sentence highlight overlays with tooltips (probability + rationale)</li>
            <li>Export actions: PDF/DOCX report + attach to student profile</li>
            <li>Trend tab: AI-probability history chart per student</li>
          </ul>
        </section>

        <section className="grid md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h3 className="font-semibold">False Positive Mitigation</h3>
            <ul className="list-disc pl-6 mt-2 text-sm text-slate-300 space-y-1">
              <li>Conservative thresholding; no paragraph-wide red flags by default</li>
              <li>Require multi-signal agreement before high-risk label</li>
              <li>Baseline comparison with student historical writing when available</li>
              <li>Explainability for each flag (no black-box verdict)</li>
            </ul>
          </div>
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
            <h3 className="font-semibold">Ethical + Legal Positioning</h3>
            <ul className="list-disc pl-6 mt-2 text-sm text-slate-300 space-y-1">
              <li>Detection is advisory, not automatic disciplinary evidence</li>
              <li>Human review required prior to action</li>
              <li>Store only necessary text segments with retention controls</li>
              <li>Parent/student transparency notice in policy + report footer</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  )
}
