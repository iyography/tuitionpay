'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Building2,
  Users,
  DollarSign,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Crown,
  TrendingUp,
  FileText,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { href: '/master', label: 'Overview', icon: LayoutDashboard },
  { href: '/master/schools', label: 'Schools', icon: Building2 },
  { href: '/master/users', label: 'Users & Assessments', icon: Users },
  { href: '/master/revenue', label: 'Revenue & MRR', icon: TrendingUp },
  { href: '/master/payments', label: 'All Payments', icon: DollarSign },
  { href: '/master/cards', label: 'Card Catalog', icon: CreditCard },
  { href: '/master/applications', label: 'Applications', icon: FileText },
  { href: '/master/settings', label: 'Platform Settings', icon: Settings },
]

export function MasterSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside
      className={cn(
        'sticky top-0 h-screen bg-gradient-to-b from-slate-900 to-slate-800 border-r border-slate-700 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-slate-700">
          {!collapsed && (
            <Link href="/master" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600">
                <Crown className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm text-white">Master Dashboard</span>
                <span className="text-xs text-slate-400">TuitionPay Admin</span>
              </div>
            </Link>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
            className={cn('text-slate-400 hover:text-white hover:bg-slate-700', collapsed && 'mx-auto')}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href ||
                (item.href !== '/master' && pathname.startsWith(item.href))
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors',
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white'
                        : 'text-slate-400 hover:bg-slate-700 hover:text-white',
                      collapsed && 'justify-center'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-start text-slate-400 hover:text-white hover:bg-slate-700',
              collapsed && 'justify-center'
            )}
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-3" />
            {!collapsed && <span>Sign Out</span>}
          </Button>
        </div>
      </div>
    </aside>
  )
}
