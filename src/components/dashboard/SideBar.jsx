'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useAuth } from '@/context/auth-context'
import { 
  LayoutDashboard, 
  CheckSquare, 
  Users, 
  Calendar, 
  Settings,
  PieChart,
  FileText,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['admin', 'manager', 'user']
  },
  {
    title: 'My Tasks',
    href: '/dashboard/tasks',
    icon: CheckSquare,
    roles: ['admin', 'manager', 'user']
  },
  {
    title: 'Team Tasks',
    href: '/dashboard/team-tasks',
    icon: Users,
    roles: ['admin', 'manager']
  },
  {
    title: 'Calendar',
    href: '/dashboard/calendar',
    icon: Calendar,
    roles: ['admin', 'manager', 'user']
  },
  {
    title: 'Reports',
    href: '/dashboard/reports',
    icon: PieChart,
    roles: ['admin', 'manager']
  },
  {
    title: 'Projects',
    href: '/dashboard/projects',
    icon: FileText,
    roles: ['admin', 'manager', 'user']
  },
  {
    title: 'User Management',
    href: '/dashboard/users',
    icon: Users,
    roles: ['admin']
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
    roles: ['admin', 'manager', 'user']
  }
]

export default function Sidebar({ mobileMenuOpen, setMobileMenuOpen }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      
      // Only auto-collapse on initial load or when switching between mobile/desktop
      if (mobile && sidebarOpen) {
        setSidebarOpen(false)
      } else if (!mobile && !sidebarOpen && !document.documentElement.classList.contains('sidebar-collapsed')) {
        setSidebarOpen(true)
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [sidebarOpen])
  
  // Sync with mobile menu state from header
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(mobileMenuOpen)
    }
  }, [mobileMenuOpen, isMobile])

  const toggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen)
    } else {
      setSidebarOpen(!sidebarOpen)
      // Track collapsed state for persistence across resize events
      if (sidebarOpen) {
        document.documentElement.classList.add('sidebar-collapsed')
      } else {
        document.documentElement.classList.remove('sidebar-collapsed')
      }
    }
  }

  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(user?.role || 'user')
  )

  return (
    <>
      {/* Mobile overlay for sidebar */}
      {isMobile && mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black/50" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      
      <aside
        className={cn(
          "h-screen flex flex-col border-r bg-background transition-all duration-300",
          isMobile 
            ? "fixed inset-y-0 left-0 z-30" 
            : "sticky top-0 z-10",
          sidebarOpen 
            ? "w-64" 
            : "w-16",
          isMobile && !mobileMenuOpen && "transform -translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between px-4">
          {sidebarOpen && <h2 className="text-lg font-bold">Navigation</h2>}
          {!isMobile && (
            <button 
              onClick={toggleSidebar} 
              className="p-2 rounded-md hover:bg-accent"
              aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          )}
        </div>
        <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
          {filteredNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === item.href
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent hover:text-accent-foreground",
                !sidebarOpen && "justify-center"
              )}
              onClick={() => {
                if (isMobile) setMobileMenuOpen(false)
              }}
            >
              <item.icon className={cn("h-5 w-5 flex-shrink-0", sidebarOpen && "mr-3")} />
              {sidebarOpen && <span className="truncate">{item.title}</span>}
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}