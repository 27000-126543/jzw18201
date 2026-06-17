import { Outlet, useParams, Link, useLocation } from 'react-router-dom'
import { Home, ClipboardList, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const tabs = [
  { path: '', label: '首页', Icon: Home },
  { path: '/requests', label: '我的请求', Icon: ClipboardList },
  { path: '/review', label: '评价', Icon: Star },
]

export default function GuestLayout() {
  const { roomId } = useParams<{ roomId: string }>()
  const location = useLocation()
  const basePath = `/guest/${roomId}`

  return (
    <div className="guest-layout">
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-gold-700 via-gold-500 to-gold-400 text-white px-5 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center font-display text-lg font-bold">
            璞
          </div>
          <span className="font-display text-lg font-semibold tracking-wider">璞悦酒店</span>
        </div>
        <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5">
          <span className="text-sm font-medium">{roomId}房</span>
        </div>
      </header>

      <main className="pt-[56px] pb-[72px] min-h-screen">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-hotel-border">
        <div className="flex items-center justify-around h-[68px]">
          {tabs.map(({ path, label, Icon }) => {
            const fullPath = `${basePath}${path}`
            const isActive =
              path === ''
                ? location.pathname === basePath
                : location.pathname === fullPath
            return (
              <Link
                key={path || 'home'}
                to={fullPath}
                className={cn(
                  'relative flex flex-col items-center justify-center py-2 px-5 transition-colors duration-200',
                  isActive ? 'text-gold-600' : 'text-hotel-muted hover:text-gold-500'
                )}
              >
                <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
                <span className={cn('text-[11px] mt-1', isActive && 'font-medium')}>
                  {label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="guest-tab"
                    className="absolute -top-px left-3 right-3 h-[3px] bg-gold-500 rounded-full"
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
