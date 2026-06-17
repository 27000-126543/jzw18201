import { NavLink, Outlet } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ClipboardList,
  BedDouble,
  UtensilsCrossed,
  Wrench,
  Monitor,
  UserCircle,
  AlertTriangle,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHotelStore } from '@/store/hotel'

const navItems = [
  { to: '/admin', icon: ClipboardList, label: '工单池', end: true },
  { to: '/admin/dept/housekeeping', icon: BedDouble, label: '客房部' },
  { to: '/admin/dept/fandb', icon: UtensilsCrossed, label: '餐饮部' },
  { to: '/admin/dept/engineering', icon: Wrench, label: '工程部' },
  { to: '/dashboard', icon: Monitor, label: '前台大屏' },
  { to: '/admin/guest/G001', icon: UserCircle, label: '客户档案' },
]

export default function AdminLayout() {
  const badReviewAlert = useHotelStore((s) => s.badReviewAlert)
  const dismissBadReview = useHotelStore((s) => s.dismissBadReview)

  return (
    <div className="admin-layout flex">
      <aside className="w-60 bg-white border-r border-hotel-border flex flex-col fixed h-full z-20">
        <div className="h-16 flex items-center px-6 border-b border-hotel-border">
          <span className="font-display text-xl font-semibold text-gold-700">星辰酒店</span>
          <span className="ml-2 text-xs text-hotel-muted">管理后台</span>
        </div>
        <nav className="flex-1 py-4 space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-gold-50 text-gold-700'
                    : 'text-hotel-muted hover:bg-gray-50 hover:text-hotel-dark'
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-hotel-border">
          <div className="text-xs text-hotel-muted">© 2026 星辰酒店</div>
        </div>
      </aside>

      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        <AnimatePresence>
          {badReviewAlert && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-50 border-b border-red-200"
            >
              <div className="flex items-center justify-between px-6 py-2.5">
                <div className="flex items-center gap-2 text-red-700 text-sm font-medium">
                  <AlertTriangle size={16} />
                  <span>{badReviewAlert.message}</span>
                </div>
                <button
                  onClick={dismissBadReview}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <header className="h-14 bg-white border-b border-hotel-border flex items-center justify-between px-6 sticky top-0 z-10">
          <h1 className="text-sm font-medium text-hotel-dark">客房服务管理系统</h1>
          <div className="flex items-center gap-3">
            {badReviewAlert && (
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
              </span>
            )}
            <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 text-xs font-bold">
              管
            </div>
          </div>
        </header>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
