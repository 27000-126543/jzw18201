import { NavLink, Outlet, useNavigate } from 'react-router-dom'
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
  Bell,
  MessageSquareWarning,
  Clock,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  User,
  Building2,
  FileText,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { useHotelStore } from '@/store/hotel'
import { timeAgo } from '@/utils/time'
import { DEPARTMENT_LABELS } from '@/types'

export default function AdminLayout() {
  const todos = useHotelStore((s) => s.todos)
  const getOpenTodos = useHotelStore((s) => s.getOpenTodos)
  const followUpTodo = useHotelStore((s) => s.followUpTodo)
  const resolveTodo = useHotelStore((s) => s.resolveTodo)
  const navigate = useNavigate()
  const [showTodoPanel, setShowTodoPanel] = useState(false)

  const openTodos = getOpenTodos()
  const openBadReviewTodos = openTodos.filter((t) => t.type === 'badReview')
  const openTimeoutTodos = openTodos.filter((t) => t.type === 'timeout')
  const openTodoCount = openTodos.length

  const navItems = [
    { to: '/admin', icon: ClipboardList, label: '工单池', end: true, badge: 0 },
    { to: '/admin/dept/housekeeping', icon: BedDouble, label: '客房部', badge: 0 },
    { to: '/admin/dept/fandb', icon: UtensilsCrossed, label: '餐饮部', badge: 0 },
    { to: '/admin/dept/engineering', icon: Wrench, label: '工程部', badge: 0 },
    { to: '/dashboard', icon: Monitor, label: '前台大屏', badge: 0 },
    { to: '/admin/todos', icon: Bell, label: '经理待办', badge: openTodoCount },
    { to: '/admin/inhouse', icon: FileText, label: '住中复盘', badge: 0 },
    { to: '/admin/guest/G001', icon: UserCircle, label: '客户档案', badge: 0 },
  ]

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
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors relative',
                  isActive
                    ? 'bg-gold-50 text-gold-700'
                    : 'text-hotel-muted hover:bg-gray-50 hover:text-hotel-dark'
                )
              }
            >
              <div className="relative">
                <item.icon size={18} />
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>
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
          {openBadReviewTodos.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-amber-50 border-b border-amber-200"
            >
              <div className="flex items-center justify-between px-6 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-amber-700 text-sm font-medium">
                    <MessageSquareWarning size={16} />
                    <span>差评预警：{openBadReviewTodos.length} 条差评待跟进</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {openBadReviewTodos.slice(0, 3).map((todo) => (
                      <button
                        key={todo.id}
                        onClick={() => navigate('/admin/todos')}
                        className="px-2 py-0.5 bg-white border border-amber-200 rounded text-xs text-amber-700 hover:bg-amber-100 transition-colors"
                      >
                        {todo.roomId}房 {todo.guestName}
                        {todo.assignedManager && (
                          <span className="ml-1 text-amber-600/80">· 负责: {todo.assignedManager}</span>
                        )}
                      </button>
                    ))}
                    {openBadReviewTodos.length > 3 && (
                      <span className="text-xs text-amber-600">+{openBadReviewTodos.length - 3} 更多</span>
                    )}
                  </div>
                </div>
                <NavLink
                  to="/admin/todos"
                  className="text-xs text-amber-600 hover:text-amber-800 font-medium hover:underline"
                >
                  前往处理 →
                </NavLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {openTimeoutTodos.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-50 border-b border-red-200"
            >
              <div className="flex items-center justify-between px-6 py-2.5">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-red-700 text-sm font-medium">
                    <AlertTriangle size={16} className="animate-pulse" />
                    <span>超时预警：{openTimeoutTodos.length} 条工单超时未处理</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {openTimeoutTodos.slice(0, 3).map((todo) => (
                      <button
                        key={todo.id}
                        onClick={() => navigate('/admin/todos')}
                        className="px-2 py-0.5 bg-white border border-red-200 rounded text-xs text-red-700 hover:bg-red-100 transition-colors animate-pulse"
                      >
                        {todo.roomId}房 {todo.guestName}
                        {todo.assignedManager && (
                          <span className="ml-1 text-red-600/80">· 负责: {todo.assignedManager}</span>
                        )}
                        {todo.department && (
                          <span className="ml-1 text-red-600/80">· {DEPARTMENT_LABELS[todo.department]}</span>
                        )}
                      </button>
                    ))}
                    {openTimeoutTodos.length > 3 && (
                      <span className="text-xs text-red-600">+{openTimeoutTodos.length - 3} 更多</span>
                    )}
                  </div>
                </div>
                <NavLink
                  to="/admin/todos"
                  className="text-xs text-red-600 hover:text-red-800 font-medium hover:underline"
                >
                  前往处理 →
                </NavLink>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <header className="h-14 bg-white border-b border-hotel-border flex items-center justify-between px-6 sticky top-0 z-10">
          <h1 className="text-sm font-medium text-hotel-dark">客房服务管理系统</h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTodoPanel(!showTodoPanel)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Bell size={18} className="text-hotel-muted" />
              {openTodoCount > 0 && (
                <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {openTodoCount > 99 ? '99+' : openTodoCount}
                </span>
              )}
            </button>
            <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 text-xs font-bold">
              管
            </div>
          </div>
        </header>

        <AnimatePresence>
          {showTodoPanel && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-gray-50 border-b border-hotel-border overflow-hidden"
            >
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Bell size={16} className="text-gold-700" />
                    <span className="font-semibold text-hotel-dark">待办中心</span>
                    <span className="text-xs text-red-500 font-medium">({openTodoCount} 条待处理)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <NavLink
                      to="/admin/todos"
                      className="text-xs text-gold-700 hover:text-gold-800 font-medium hover:underline"
                    >
                      查看全部 →
                    </NavLink>
                    <button
                      onClick={() => setShowTodoPanel(false)}
                      className="text-hotel-muted hover:text-hotel-dark transition-colors"
                    >
                      <ChevronUp size={16} />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {openTodos.slice(0, 4).map((todo) => (
                    <button
                      key={todo.id}
                      onClick={() => navigate('/admin/todos')}
                      className={cn(
                        'bg-white rounded-lg p-3 border flex items-start gap-3 text-left hover:shadow-md transition-all',
                        todo.type === 'timeout' ? 'border-red-200 hover:border-red-300' : 'border-amber-200 hover:border-amber-300'
                      )}
                    >
                      <div
                        className={cn(
                          'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                          todo.type === 'timeout' ? 'bg-red-50' : 'bg-amber-50'
                        )}
                      >
                        {todo.type === 'timeout' ? (
                          <AlertTriangle size={16} className="text-red-500" />
                        ) : (
                          <MessageSquareWarning size={16} className="text-amber-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-hotel-dark truncate">{todo.title}</span>
                          <span
                            className={cn(
                              'px-1.5 py-0.5 rounded text-[10px] font-medium shrink-0',
                              todo.status === 'open'
                                ? 'bg-red-100 text-red-700'
                                : todo.status === 'followedUp'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-green-100 text-green-700'
                            )}
                          >
                            {todo.status === 'open' ? '待处理' : todo.status === 'followedUp' ? '已跟进' : '已解决'}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-hotel-muted">
                          {todo.roomId && (
                            <span className="inline-flex items-center gap-1">
                              <User size={10} />
                              {todo.roomId}房 {todo.guestName}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <Clock size={10} />
                            {timeAgo(todo.createdAt)}
                          </span>
                          {todo.assignedManager && (
                            <span className="inline-flex items-center gap-1 text-gold-700 font-medium">
                              <User size={10} />
                              负责: {todo.assignedManager}
                            </span>
                          )}
                          {todo.handlerName && (
                            <span className="inline-flex items-center gap-1 text-blue-700">
                              🛠️ {todo.handlerName}
                            </span>
                          )}
                          {todo.department && (
                            <span className="inline-flex items-center gap-1 text-purple-700">
                              <Building2 size={10} />
                              {DEPARTMENT_LABELS[todo.department]}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {todo.status === 'open' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); followUpTodo(todo.id, todo.assignedManager || '当班经理') }}
                            className="p-1.5 rounded-md text-amber-600 hover:bg-amber-50 transition-colors"
                            title="标记已跟进"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                        {todo.status !== 'resolved' && (
                          <button
                            onClick={(e) => { e.stopPropagation(); resolveTodo(todo.id) }}
                            className="p-1.5 rounded-md text-green-600 hover:bg-green-50 transition-colors"
                            title="标记已解决"
                          >
                            <CheckCircle2 size={14} />
                          </button>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {openTodos.length === 0 && (
                  <div className="text-center py-4 text-sm text-hotel-muted">
                    暂无待办事项
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
