'use client'

import { useEffect } from 'react'

interface KeyboardShortcutsProps {
  onQuickAdd?: () => void
  onSearch?: () => void
  onEscape?: () => void
}

/**
 * Global keyboard shortcuts handler
 *
 * Shortcuts:
 * - Ctrl/Cmd + K: Quick add task
 * - Ctrl/Cmd + /: Search
 * - Escape: Close dialogs
 */
export function KeyboardShortcuts({
  onQuickAdd,
  onSearch,
  onEscape,
}: KeyboardShortcutsProps) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modKey = isMac ? event.metaKey : event.ctrlKey

      // Ctrl/Cmd + K: Quick add task
      if (modKey && event.key === 'k') {
        event.preventDefault()
        onQuickAdd?.()
      }

      // Ctrl/Cmd + /: Search
      if (modKey && event.key === '/') {
        event.preventDefault()
        onSearch?.()
      }

      // Escape: Close dialogs
      if (event.key === 'Escape') {
        onEscape?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onQuickAdd, onSearch, onEscape])

  return null // This component doesn't render anything
}

/**
 * Hook for keyboard shortcuts in components
 */
export function useKeyboardShortcut(
  key: string,
  callback: () => void,
  options: { ctrl?: boolean; shift?: boolean; alt?: boolean } = {}
) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0
      const modKey = isMac ? event.metaKey : event.ctrlKey

      const matchesKey = event.key.toLowerCase() === key.toLowerCase()
      const matchesCtrl = options.ctrl ? modKey : true
      const matchesShift = options.shift ? event.shiftKey : true
      const matchesAlt = options.alt ? event.altKey : true

      if (matchesKey && matchesCtrl && matchesShift && matchesAlt) {
        event.preventDefault()
        callback()
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [key, callback, options])
}
