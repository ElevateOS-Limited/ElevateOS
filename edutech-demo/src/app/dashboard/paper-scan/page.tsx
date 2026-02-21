'use client'

import { useState } from 'react'
import { ScanLine, Loader2 } from 'lucide-react'

export default function PaperScanPage() {
  const [imageDataUrl, setImageDataUrl] = useState('')
  const [answerKey, setAnswerKey] = useState('{"1":"B","2":"D","3":"C"}')
  const [markingNotes, setMarkingNotes] = useState('')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const onFile = async (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setImageDataUrl(String(reader.result || ''))
    reader.readAsDataURL(file)
  }

  const run = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/papers/grade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl, answerKey: JSON.parse(answerKey), markingNotes }),
      })
      const data = await res.json()
      setResult(data)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold flex items-center gap-2"><ScanLine className="w-8 h-8 text-indigo-600" /> Paper Scanner (Right/Wrong Detection)</h1>
      <p className="text-gray-500">Upload a paper photo. AI extracts answers and marks right/wrong against your answer key.</p>

      <div className="bg-white dark:bg-gray-900 border rounded-2xl p-5 space-y-4">
        <input type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0])} />
        {imageDataUrl && <img src={imageDataUrl} alt="paper" className="max-h-72 rounded-lg border" />}

        <div>
          <label className="text-sm font-medium">Answer key JSON</label>
          <textarea value={answerKey} onChange={(e) => setAnswerKey(e.target.value)} rows={4} className="w-full mt-1 border rounded-lg p-3 bg-transparent" />
        </div>

        <div>
          <label className="text-sm font-medium">Marking notes (optional)</label>
          <input value={markingNotes} onChange={(e) => setMarkingNotes(e.target.value)} className="w-full mt-1 border rounded-lg p-3 bg-transparent" />
        </div>

        <button onClick={run} disabled={!imageDataUrl || loading} className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white disabled:opacity-50 inline-flex items-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Grading...</> : 'Scan & Grade'}
        </button>
      </div>

      {result && (
        <div className="bg-white dark:bg-gray-900 border rounded-2xl p-5">
          <h2 className="text-xl font-semibold mb-3">Result</h2>
          <pre className="text-xs overflow-auto whitespace-pre-wrap">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
