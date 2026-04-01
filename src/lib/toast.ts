export type AppToastType = 'success' | 'error'

export type AppToastDetail = {
  id: string
  type: AppToastType
  message: string
}

export const APP_TOAST_EVENT = 'app-toast'

function emitToast(type: AppToastType, message: string) {
  if (typeof window === 'undefined') return

  const id =
    typeof window.crypto?.randomUUID === 'function'
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`

  window.dispatchEvent(
    new CustomEvent<AppToastDetail>(APP_TOAST_EVENT, {
      detail: { id, type, message },
    })
  )
}

const toast = {
  success(message: string) {
    emitToast('success', message)
  },
  error(message: string) {
    emitToast('error', message)
  },
}

export default toast
