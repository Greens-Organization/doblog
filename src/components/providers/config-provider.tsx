'use client'

import type { getConfig } from '@/actions/blog/config'
import { type ReactNode, createContext, use, useContext } from 'react'

interface Context {
  config: { name: string; description: string; logo: string }
  blogCreated: boolean
  hasAdmin: boolean
  hasError: boolean
}

const context = createContext<Context | null>(null)

export type ConfigPromise = ReturnType<typeof getConfig>

interface ConfigProviderProps {
  children: ReactNode
  configPromise: ConfigPromise
}

export function ConfigProvider({
  children,
  configPromise
}: ConfigProviderProps) {
  const configRes = use(configPromise)

  const hasError = !configRes.success
  const blogCreated = configRes.success || configRes.status !== 428
  const hasAdmin = configRes.success || configRes.status !== 412

  const config = configRes.success
    ? configRes.data
    : { name: '', logo: '', description: '' }

  return (
    <context.Provider
      value={{
        blogCreated: blogCreated,
        hasAdmin: hasAdmin,
        hasError: hasError,
        config: config
      }}
    >
      {children}
    </context.Provider>
  )
}

export function useConfig() {
  const ctx = useContext(context)

  if (ctx === null) throw new Error('call useConfig inside ConfigProvider')

  return ctx
}
