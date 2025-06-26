import { ThemeProvider } from '@/components/theme/provider'
import { Toaster } from '@/components/ui/sonner'
import { ConfigModal } from '../config-modal'
import { type ConfigPromise, ConfigProvider } from './config-provider'

export default function RootProviders({
  children,
  configPromise
}: { children: React.ReactNode; configPromise: ConfigPromise }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
    >
      <ConfigProvider configPromise={configPromise}>
        {children}
        <Toaster position="top-right" />
        <ConfigModal />
      </ConfigProvider>
    </ThemeProvider>
  )
}
