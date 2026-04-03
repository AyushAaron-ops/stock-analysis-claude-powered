import { useState, useCallback } from 'react'

let toast_id = 0

export function use_toast() {
  const [toasts, set_toasts] = useState([])

  const add_toast = useCallback((message, type = 'info', duration = 3500) => {
    const id = ++toast_id
    set_toasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      set_toasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const toast = {
    success: (msg) => add_toast(msg, 'success'),
    error:   (msg) => add_toast(msg, 'error', 5000),
    info:    (msg) => add_toast(msg, 'info'),
  }

  return { toasts, toast }
}
