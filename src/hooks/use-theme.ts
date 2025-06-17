'use client'

import { useTheme as useNextTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function useTheme() {
  const { theme, setTheme } = useNextTheme()
  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light')

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  const switchTheme = () => {
    switch (theme) {
      case 'light':
        setTheme('dark')
        break
      case 'dark':
        setTheme('light')
        break
      case 'system':
        setTheme(systemTheme === 'light' ? 'dark' : 'light')
        break
      default:
        break
    }
  }

  const toggleTheme = () => {
    if (!document.startViewTransition) switchTheme()

    if (document.startViewTransition) {
      document.startViewTransition(switchTheme)
    }
  }

  return { toggleTheme, theme, setTheme }
}
