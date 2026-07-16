import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Package,
  Layers,
  BadgePercent,
  MessageSquare,
  Users,
  Settings,
  FileText,
  Shield,
  LogOut,
  Moon,
  Sun,
} from 'lucide-react'
import { useEffect, useState } from 'react'

export default function AdminLayout() {
  const nav = useNavigate()
  const [dark, setDark] = useState(false)
  const location = useLocation()

  const pageInfo: Record<string, { title: string; description: string }> = {
    '/': {
      title: 'Dashboard',
      description: 'View dashboard statistics and recent activity.',
    },
    '/products': {
      title: 'Products',
      description: 'Add, edit and manage all products.',
    },
    '/categories': {
      title: 'Categories',
      description: 'Create and organize product categories.',
    },
    '/offers': {
      title: 'Offers',
      description: 'Manage promotional offers and discounts.',
    },
    '/inquiries': {
      title: 'Inquiries',
      description: 'View and respond to customer inquiries.',
    },
    '/users': {
      title: 'Users',
      description: 'Manage registered users and their accounts.',
    },
    '/privacy': {
      title: 'Privacy Policy',
      description: 'Manage website privacy policy.',
    },
    '/terms': {
      title: 'Terms & Conditions',
      description: 'Manage website terms and conditions.',
    },
    '/settings': {
      title: 'Settings',
      description: 'Configure application settings.',
    },
    // Add this
    '/hero-banner': {
      title: 'Header Banner',
      description: 'Manage homepage header banner image and content.',
    },
    '/about': {
      title: 'About Us',
      description: 'Manage About Us page content.',
    },
  }

  const currentPage =
    pageInfo[location.pathname] || {
      title: 'Admin Panel',
      description: 'Manage your application.',
    }

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const links = [
    { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/products', icon: <Package size={18} />, label: 'Products' },
    { to: '/categories', icon: <Layers size={18} />, label: 'Categories' },
    { to: '/offers', icon: <BadgePercent size={18} />, label: 'Offers' },
    { to: '/inquiries', icon: <MessageSquare size={18} />, label: 'Inquiries' },
    { to: '/users', icon: <Users size={18} />, label: 'Users' },
    { to: '/about', icon: <FileText size={18} />, label: 'About Us' },
    { to: '/privacy', icon: <Shield size={18} />, label: 'Privacy Policy' },
    { to: '/terms', icon: <FileText size={18} />, label: 'Terms & Conditions' },
    { to: '/settings', icon: <Settings size={18} />, label: 'Settings' },
    { to: '/hero-banner', icon: <BadgePercent size={18} />, label: 'Header Banner' },

  ]

  const logout = () => {
    localStorage.removeItem('admin_token')
    nav('/login')
  }

  return (
    <div className="flex min-h-screen bg-[#f7f5f2] dark:bg-[#121212] dark:text-white">
      <aside className="hidden w-[270px] border-r border-[#eee] bg-white dark:border-[#333] dark:bg-[#1e1e1e] lg:block">
        <div className="border-b p-5 dark:border-[#333]">
          <div
            className="text-2xl font-bold tracking-wide"
            style={{
              fontFamily: "Playfair Display",
              color: "#B08A2A"
            }}
          >
            Roop Rang
          </div>

          <div
            className="mt-1 text-xs tracking-[0.25em] uppercase"
            style={{
              color: "#8B6F47"
            }}
          >
            Luxury in Every Shade
          </div>

          <div className="mt-2 text-[11px] tracking-[0.25em] text-gray-500 dark:text-gray-400">
            ADMIN PANEL
          </div>
        </div>
        <nav className="space-y-1 p-3">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${isActive
                  ? 'bg-[#fdf6e3] text-[#a67c00] dark:bg-[#2a2a1a]'
                  : 'hover:bg-gray-50 dark:hover:bg-[#2a2a2a]'
                }`
              }
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-[#eee] bg-white px-5 dark:border-[#333] dark:bg-[#1e1e1e]">
          <div>
            <h1 className="text-lg font-semibold">
              {currentPage.title}
            </h1>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              {currentPage.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDark(!dark)}
              className="rounded-lg border p-2 hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
              title="Toggle theme"
            >
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <button
              onClick={logout}
              className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50 dark:hover:bg-[#2a2a2a]"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}