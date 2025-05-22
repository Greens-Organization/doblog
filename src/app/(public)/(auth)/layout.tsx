import { Header } from '@/components/header'

export default function AuthLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col h-screen">
      <Header />
      <div className="grow flex justify-center items-center">{children}</div>
    </div>
  )
}
