import { MasterSidebar } from '@/components/layout/master-sidebar'

export default function MasterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <MasterSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
