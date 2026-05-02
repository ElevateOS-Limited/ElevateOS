'use client'

import { useEffect, useState } from 'react'

export default function WeakAreasPage() {
  const [items, setItems] = useState<any[]>([])

  useEffect(() => {
    fetch('/api/question-bank').then((r)=>r.json()).then((qs)=>{
      const by: Record<string,{correct:number,total:number}> = {}
      qs.forEach((q:any)=>{ const key=`${q.subject} / ${q.topic}`; by[key]=by[key]||{correct:0,total:0} })
      setItems(Object.entries(by).map(([k,v])=>({label:k, accuracy:v.total?Math.round((v.correct/v.total)*100):0})))
    })
  }, [])

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-3xl font-bold">Weak Areas</h1>
      <div className="space-y-2">
        {items.length ? items.map((i)=> (
          <div key={i.label} className="bg-white border rounded-lg p-3 flex items-center justify-between">
            <span>{i.label}</span>
            <span className="text-sm text-gray-600">Accuracy: {i.accuracy}%</span>
          </div>
        )) : <p className="text-gray-500">No data yet. Do practice sessions to surface weak areas.</p>}
      </div>
    </div>
  )
}
