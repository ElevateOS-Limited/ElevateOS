'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Plus, RotateCcw } from 'lucide-react'

type Deck = { id: string; name: string; description?: string; _count?: { cards: number } }
type Card = { id: string; front: string; back: string; tags: string[]; deckId: string }
type Review = { card: Card }

export default function FlashcardsPage() {
  const [decks, setDecks] = useState<Deck[]>([])
  const [deckId, setDeckId] = useState<string>('')
  const [cards, setCards] = useState<Card[]>([])
  const [due, setDue] = useState<Review[]>([])
  const [showBack, setShowBack] = useState(false)
  const [index, setIndex] = useState(0)
  const [newDeckName, setNewDeckName] = useState('')
  const [newCardFront, setNewCardFront] = useState('')
  const [newCardBack, setNewCardBack] = useState('')
  const current = due[index]

  const loadDecks = useCallback(async () => {
    const res = await fetch('/api/flashcards/decks')
    const data = await res.json()
    setDecks(data)
    setDeckId((currentDeckId) => currentDeckId || data[0]?.id || '')
  }, [])

  const loadCards = async (id: string) => {
    const [cardsRes, dueRes] = await Promise.all([
      fetch(`/api/flashcards/cards?deckId=${id}`),
      fetch(`/api/flashcards/review?deckId=${id}`),
    ])
    setCards(await cardsRes.json())
    setDue(await dueRes.json())
    setIndex(0)
    setShowBack(false)
  }

  useEffect(() => { loadDecks() }, [loadDecks])
  useEffect(() => { if (deckId) loadCards(deckId) }, [deckId])

  const progress = useMemo(() => (due.length ? `${Math.min(index + 1, due.length)}/${due.length}` : '0/0'), [due.length, index])

  return (
    <div className="max-w-7xl mx-auto grid md:grid-cols-[350px_1fr] gap-4">
      <div className="bg-white dark:bg-gray-900 border rounded-xl p-4 space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold">Decks</h2>
          <button
            onClick={async () => {
              const name = newDeckName.trim() || 'New Deck'
              await fetch('/api/flashcards/decks', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) })
              setNewDeckName('')
              await loadDecks()
            }}
            className="p-2 border rounded-lg"
          ><Plus className="w-4 h-4" /></button>
        </div>
        <input
          value={newDeckName}
          onChange={(e) => setNewDeckName(e.target.value)}
          placeholder="New deck name"
          className="w-full border rounded-lg px-3 py-2 bg-transparent"
        />
        <div className="space-y-1">
          {decks.map((d) => (
            <button key={d.id} onClick={() => setDeckId(d.id)} className={`w-full text-left p-2 rounded-lg border ${deckId === d.id ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-900/20' : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <p className="font-medium">{d.name}</p>
              <p className="text-xs text-gray-500">{d._count?.cards || 0} cards</p>
            </button>
          ))}
        </div>
        {deckId && (
          <div className="space-y-2 pt-1 border-t border-gray-200 dark:border-gray-700">
            <input
              value={newCardFront}
              onChange={(e) => setNewCardFront(e.target.value)}
              placeholder="Card front"
              className="w-full border rounded-lg px-3 py-2 bg-transparent"
            />
            <textarea
              value={newCardBack}
              onChange={(e) => setNewCardBack(e.target.value)}
              placeholder="Card back"
              rows={3}
              className="w-full border rounded-lg px-3 py-2 bg-transparent"
            />
            <button
              onClick={async () => {
                const front = newCardFront.trim()
                if (!front) return
                await fetch('/api/flashcards/cards', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ deckId, front, back: newCardBack.trim() }),
                })
                setNewCardFront('')
                setNewCardBack('')
                await loadCards(deckId)
              }}
              className="w-full px-3 py-2 rounded-lg bg-indigo-600 text-white"
            >Add Card</button>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-gray-900 border rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Review Queue</h2>
          <span className="text-sm text-gray-500">{progress}</span>
        </div>
        {!current ? (
          <p className="text-gray-500">No due cards. Add cards or come back later.</p>
        ) : (
          <>
            <div className="border rounded-xl p-6 min-h-[220px]">
              <p className="text-sm text-gray-500 mb-2">Front</p>
              <p className="text-lg font-medium">{current.card.front}</p>
              {showBack && (
                <>
                  <p className="text-sm text-gray-500 mt-6 mb-2">Back</p>
                  <p className="text-base">{current.card.back}</p>
                </>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={() => setShowBack((v) => !v)} className="px-3 py-2 rounded-lg border">{showBack ? 'Hide Answer' : 'Show Answer'}</button>
              {[2,3,4,5].map((q) => (
                <button
                  key={q}
                  onClick={async () => {
                    await fetch('/api/flashcards/review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ cardId: current.card.id, quality: q }) })
                    await loadCards(deckId)
                  }}
                  className="px-3 py-2 rounded-lg bg-indigo-600 text-white"
                >Score {q}</button>
              ))}
              <button onClick={() => { setShowBack(false); setIndex((i) => Math.min(i + 1, due.length - 1)) }} className="px-3 py-2 rounded-lg border inline-flex items-center gap-1"><RotateCcw className="w-4 h-4" /> Next</button>
            </div>
          </>
        )}

        <div className="mt-6">
          <h3 className="font-medium mb-2">Cards in deck</h3>
          <div className="space-y-2 max-h-64 overflow-auto">
            {cards.map((c) => (
              <div key={c.id} className="border rounded-lg p-2">
                <p className="font-medium">{c.front}</p>
                <p className="text-sm text-gray-500">{c.back}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
