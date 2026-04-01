'use client'

import { useEffect, useState } from 'react'
import { APP_TOAST_EVENT, type AppToastDetail } from '@/lib/toast'

export function ToastViewport() {
  const [items, setItems] = useState<AppToastDetail[]>([])

  useEffect(() => {
    const handleToast = (event: Event) => {
      const detail = (event as CustomEvent<AppToastDetail>).detail
      setItems((current) => [...current, detail])
      window.setTimeout(() => {
        setItems((current) => current.filter((item) => item.id !== detail.id))
      }, 3500)
    }

    window.addEventListener(APP_TOAST_EVENT, handleToast as EventListener)
    return () => window.removeEventListener(APP_TOAST_EVENT, handleToast as EventListener)
  }, [])

  if (items.length === 0) return null

  return (
    <div className="fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-2 px-4 sm:px-0">
      {items.map((item) => (
        <div
          key={item.id}
          className={`rounded-xl border px-4 py-3 shadow-lg backdrop-blur ${
            item.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/90 dark:text-emerald-100'
              : 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/90 dark:text-red-100'
          }`}
        >
          <p className="text-sm font-medium">{item.message}</p>
        </div>
      ))}
    </div>
  )
}
