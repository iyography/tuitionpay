import { ParentSidebar } from '@/components/layout/parent-sidebar'

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <ParentSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
