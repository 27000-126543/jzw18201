import { useEffect, useState, useRef, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Clock,
  AlertCircle,
  BarChart3,
  Timer,
  AlarmClock,
  Bell,
  AlertTriangle,
  MessageSquareWarning,
  Filter,
  ChevronDown,
  User,
  Building2,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHotelStore } from '@/store/hotel'
import {
  SERVICE_TYPE_LABELS,
  DEPARTMENT_LABELS,
  type TodoType,
  type TodoStatus,
} from '@/types'
import { timeAgo } from '@/utils/time'
import { typeIcons } from '@/data/mock'

function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const diff = value - display
    if (diff === 0) return
    const step = diff > 0 ? 1 : -1
    const timer = setInterval(() => {
      setDisplay((prev) => {
        const next = prev + step
        if ((step > 0 && next >= value) || (step < 0 && next <= value)) {
          clearInterval(timer)
          return value
        }
        return next
      })
    }, 30)
    return () => clearInterval(timer)
  }, [value])

  return <span>{display}</span>
}

const donutColors = ['#C9A96E', '#4CAF7D', '#5B8DEF']
const barColors = ['#C9A96E', '#4CAF7D', '#5B8DEF']

const TODO_TYPE_LABELS: Record<TodoType | 'all', string> = {
  all: '全部类型',
  timeout: '超时预警',
  badReview: '差评跟进',
  urgent: '紧急工单',
}

const TODO_STATUS_LABELS: Record<TodoStatus | 'all', string> = {
  all: '全部状态',
  open: '待处理',
  followedUp: '已跟进',
  resolved: '已解决',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const getPendingCount = useHotelStore((s) => s.getPendingCount)
  const getTodayOrderCount = useHotelStore((s) => s.getTodayOrderCount)
  const getAvgResponseMin = useHotelStore((s) => s.getAvgResponseMin)
  const getDepartmentStats = useHotelStore((s) => s.getDepartmentStats)
  const getTimeoutCount = useHotelStore((s) => s.getTimeoutCount)
  const getFilteredTodos = useHotelStore((s) => s.getFilteredTodos)
  const refreshTimeoutFlags = useHotelStore((s) => s.refreshTimeoutFlags)
  const orders = useHotelStore((s) => s.orders)
  const todos = useHotelStore((s) => s.todos)

  const pendingCount = getPendingCount()
  const todayCount = getTodayOrderCount()
  const avgMin = getAvgResponseMin()
  const deptStats = getDepartmentStats()
  const timeoutCount = getTimeoutCount()

  const [filterRoomId, setFilterRoomId] = useState<string>('all')
  const [filterType, setFilterType] = useState<TodoType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<TodoStatus | 'all'>('all')
  const [showFollowedUp, setShowFollowedUp] = useState(true)
  const [showResolved, setShowResolved] = useState(false)
  const [showPendingTimeoutOnly, setShowPendingTimeoutOnly] = useState(false)
  const [now, setNow] = useState(Date.now())
  const marqueeRef = useRef<HTMLDivElement>(null)
  const [marqueeOffset, setMarqueeOffset] = useState(0)

  useEffect(() => {
    refreshTimeoutFlags()
    const interval = setInterval(() => {
      refreshTimeoutFlags()
    }, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(t)
  }, [])

  const availableRooms = useMemo(() => {
    const roomSet = new Set<string>()
    todos.forEach((t) => {
      if (t.roomId) roomSet.add(t.roomId)
    })
    orders.forEach((o) => {
      if (o.roomId) roomSet.add(o.roomId)
    })
    return Array.from(roomSet).sort()
  }, [todos, orders])

  const dropdownFilteredTodos = useMemo(() => {
    return getFilteredTodos({
      roomId: filterRoomId === 'all' ? undefined : filterRoomId,
      type: filterType,
      status: filterStatus,
    })
  }, [getFilteredTodos, filterRoomId, filterType, filterStatus])

  const visibleTodos = useMemo(() => {
    return dropdownFilteredTodos.filter((t) => {
      if (t.status === 'followedUp' && !showFollowedUp) return false
      if (t.status === 'resolved' && !showResolved) return false
      return true
    })
  }, [dropdownFilteredTodos, showFollowedUp, showResolved])

  const pendingOrders = useMemo(() => {
    let list = orders.filter((o) => o.status === 'pending')
    if (showPendingTimeoutOnly) {
      list = list.filter((o) => o.isTimeout)
    }
    return list
  }, [orders, showPendingTimeoutOnly])

  const statusCounts = useMemo(() => {
    return {
      open: todos.filter((t) => t.status === 'open').length,
      followedUp: todos.filter((t) => t.status === 'followedUp').length,
      resolved: todos.filter((t) => t.status === 'resolved').length,
    }
  }, [todos])

  useEffect(() => {
    if (visibleTodos.length === 0) return
    const totalWidth = visibleTodos.length * 480
    const animationInterval = setInterval(() => {
      setMarqueeOffset((prev) => {
        if (prev <= -totalWidth) return 0
        return prev - 1
      })
    }, 30)
    return () => clearInterval(animationInterval)
  }, [visibleTodos.length])

  function getPendingMinutes(createdAt: string): number {
    return Math.floor((now - new Date(createdAt).getTime()) / 60000)
  }

  function getTodoTypeIcon(type: TodoType) {
    if (type === 'timeout') return <AlertTriangle size={14} className="text-red-400" />
    if (type === 'badReview') return <MessageSquareWarning size={14} className="text-amber-400" />
    return <Zap size={14} className="text-hotel-coral" />
  }

  function getTodoTypeClass(type: TodoType, isProcessed: boolean) {
    if (isProcessed) return 'bg-gray-700/50 border-gray-600/40'
    if (type === 'timeout') return 'bg-red-900/20 border-red-800/40'
    if (type === 'badReview') return 'bg-amber-900/20 border-amber-800/40'
    return 'bg-hotel-coral/10 border-hotel-coral/40'
  }

  function getTodoStatusBadge(status: TodoStatus) {
    switch (status) {
      case 'open':
        return { label: '待处理', className: 'bg-red-700 text-red-100' }
      case 'followedUp':
        return { label: '已跟进', className: 'bg-amber-700 text-amber-100' }
      case 'resolved':
        return { label: '已解决', className: 'bg-green-700 text-green-100' }
    }
  }

  const totalDeptLoad = deptStats.reduce((s, d) => s + d.pending + d.inProgress, 0)
  const maxAvgResponse = Math.max(...deptStats.map((d) => d.avgResponseMin), 1)

  let arcOffset = 0

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="mb-6 bg-gray-800 rounded-2xl p-5 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-gold-400" />
            <span className="font-semibold text-gold-400">预警筛选</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>共 {visibleTodos.length} 条匹配</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">房间:</label>
            <div className="relative">
              <select
                value={filterRoomId}
                onChange={(e) => setFilterRoomId(e.target.value)}
                className="appearance-none bg-gray-900 border border-gold-600/40 text-white text-sm rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-gold-500 cursor-pointer"
              >
                <option value="all">全部房间</option>
                {availableRooms.map((r) => (
                  <option key={r} value={r}>
                    {r}房
                  </option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">类型:</label>
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as TodoType | 'all')}
                className="appearance-none bg-gray-900 border border-gold-600/40 text-white text-sm rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-gold-500 cursor-pointer"
              >
                <option value="all">{TODO_TYPE_LABELS.all}</option>
                <option value="timeout">{TODO_TYPE_LABELS.timeout}</option>
                <option value="badReview">{TODO_TYPE_LABELS.badReview}</option>
                <option value="urgent">{TODO_TYPE_LABELS.urgent}</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-400">状态:</label>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as TodoStatus | 'all')}
                className="appearance-none bg-gray-900 border border-gold-600/40 text-white text-sm rounded-lg px-3 py-1.5 pr-8 focus:outline-none focus:border-gold-500 cursor-pointer"
              >
                <option value="all">{TODO_STATUS_LABELS.all}</option>
                <option value="open">{TODO_STATUS_LABELS.open}</option>
                <option value="followedUp">{TODO_STATUS_LABELS.followedUp}</option>
                <option value="resolved">{TODO_STATUS_LABELS.resolved}</option>
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="h-6 w-px bg-gray-700 mx-1" />

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={true}
                disabled
                className="w-4 h-4 rounded bg-gray-900 border-gray-600 text-gold-500 focus:ring-gold-500 opacity-70"
              />
              <span className="text-gray-300">显示待处理</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showFollowedUp}
                onChange={(e) => setShowFollowedUp(e.target.checked)}
                className="w-4 h-4 rounded bg-gray-900 border-gray-600 text-gold-500 focus:ring-gold-500"
              />
              <span className={cn(showFollowedUp ? 'text-gray-300' : 'text-gray-500')}>显示已跟进</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="checkbox"
                checked={showResolved}
                onChange={(e) => setShowResolved(e.target.checked)}
                className="w-4 h-4 rounded bg-gray-900 border-gray-600 text-gold-500 focus:ring-gold-500"
              />
              <span className={cn(showResolved ? 'text-gray-300' : 'text-gray-500')}>显示已解决</span>
            </label>
          </div>
        </div>
      </div>

      {visibleTodos.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl overflow-hidden border border-red-900/50"
        >
          <div className="bg-gradient-to-r from-red-900 via-red-800 to-red-900 p-3">
            <div className="flex items-center gap-3 mb-2">
              <AlarmClock size={18} className="text-red-300 animate-pulse" />
              <span className="font-semibold text-red-200">实时预警中心</span>
              <span className="px-2 py-0.5 bg-red-700 rounded-full text-xs font-bold text-red-100">
                {visibleTodos.length} 条预警
              </span>
            </div>
            <div className="overflow-hidden relative h-10 flex items-center">
              <div
                ref={marqueeRef}
                className="flex whitespace-nowrap"
                style={{ transform: `translateX(${marqueeOffset}px)` }}
              >
                {[...visibleTodos, ...visibleTodos].map((todo, idx) => {
                  const isProcessed = todo.status === 'followedUp' || todo.status === 'resolved'
                  const badge = getTodoStatusBadge(todo.status)
                  return (
                    <button
                      key={idx}
                      onClick={() => navigate('/admin/todos')}
                      className={cn(
                        'mx-4 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-opacity hover:brightness-125',
                        isProcessed
                          ? 'bg-gray-700/60 text-gray-400 opacity-60'
                          : todo.type === 'timeout'
                          ? 'bg-red-700/60 text-red-100'
                          : todo.type === 'badReview'
                          ? 'bg-amber-700/60 text-amber-100'
                          : 'bg-hotel-coral/60 text-hotel-coral-50'
                      )}
                    >
                      <span className={cn(isProcessed ? 'text-gray-500' : '')}>
                        {todo.type === 'timeout' ? '⚠️' : todo.type === 'badReview' ? '🟠' : '⚡'}
                      </span>
                      <span className={cn(isProcessed && 'line-through')}>
                        {todo.title}
                      </span>
                      <span
                        className={cn(
                          'px-1.5 py-0.5 rounded text-[10px] font-bold',
                          isProcessed ? 'bg-gray-600 text-gray-300' : badge.className
                        )}
                      >
                        {badge.label}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <header className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">
          <span className="text-gold-400">星辰酒店</span>{' '}
          <span className="text-gray-400 font-normal text-lg">前台大屏</span>
        </h1>
        <div className="flex items-center gap-2 text-gray-500 text-sm">
          <Clock size={16} />
          {new Date(now).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </header>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <AlertCircle size={16} className="text-hotel-coral" />
            待处理工单
          </div>
          <div className="text-5xl font-bold text-hotel-coral">
            <AnimatedNumber value={pendingCount} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            'rounded-2xl p-6 border relative overflow-hidden',
            timeoutCount > 0
              ? 'bg-red-900/30 border-red-700/60'
              : 'bg-gray-800 border-gray-700'
          )}
        >
          <div className="flex items-center gap-2 text-sm mb-2">
            <AlarmClock
              size={16}
              className={cn(timeoutCount > 0 ? 'text-red-400 animate-pulse' : 'text-gray-400')}
            />
            <span className={cn(timeoutCount > 0 ? 'text-red-300' : 'text-gray-400')}>
              超时预警
            </span>
          </div>
          <div
            className={cn(
              'text-5xl font-bold',
              timeoutCount > 0 ? 'text-red-400' : 'text-gray-400'
            )}
          >
            <AnimatedNumber value={timeoutCount} />
          </div>
          {timeoutCount > 0 && (
            <div className="absolute top-2 right-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <BarChart3 size={16} className="text-gold-400" />
            今日请求总数
          </div>
          <div className="text-5xl font-bold text-gold-400">
            <AnimatedNumber value={todayCount} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-2xl p-6 border border-gray-700"
        >
          <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
            <Timer size={16} className="text-hotel-green" />
            平均响应时长
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-5xl font-bold text-hotel-green">
              <AnimatedNumber value={avgMin} />
            </span>
            <span className="text-gray-400 text-lg">分钟</span>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-5 gap-6 mb-8">
        <div className="col-span-3 space-y-6">
          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-gray-400">待处理工单</h2>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => setShowPendingTimeoutOnly(false)}
                    className={cn(
                      'px-2 py-1 rounded transition-colors',
                      !showPendingTimeoutOnly
                        ? 'bg-gold-600/30 text-gold-400 border border-gold-600/50'
                        : 'text-gray-500 hover:text-gray-300'
                    )}
                  >
                    全部
                  </button>
                  <button
                    onClick={() => setShowPendingTimeoutOnly(true)}
                    className={cn(
                      'px-2 py-1 rounded transition-colors',
                      showPendingTimeoutOnly
                        ? 'bg-red-600/30 text-red-400 border border-red-600/50'
                        : 'text-gray-500 hover:text-gray-300'
                    )}
                  >
                    仅超时
                  </button>
                </div>
                {timeoutCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-900/50 border border-red-700/50 rounded text-xs font-medium text-red-300">
                    <AlarmClock size={10} className="animate-pulse" />
                    {timeoutCount} 条超时
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-3 max-h-[340px] overflow-y-auto">
              {pendingOrders.map((order, i) => {
                const minutes = getPendingMinutes(order.createdAt)
                const isOverdue = minutes > 10
                const isOrderTimeout = order.isTimeout

                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl transition-colors relative',
                      isOrderTimeout
                        ? 'bg-red-900/40 border-2 border-red-600/70 shadow-lg shadow-red-900/20'
                        : isOverdue
                        ? 'bg-red-900/20 border border-red-800/40'
                        : 'bg-gray-750 border border-gray-700'
                    )}
                  >
                    {isOrderTimeout && (
                      <div className="absolute top-2 right-2">
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                        </span>
                      </div>
                    )}
                    <span className="text-xl">{typeIcons[order.type]}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{order.roomId}房</span>
                        <span className="text-gray-500 text-xs">{order.guestName}</span>
                        <span className="text-gray-500 text-xs">{SERVICE_TYPE_LABELS[order.type]}</span>
                        {isOrderTimeout && (
                          <span className="px-1.5 py-0.5 bg-red-600 text-white text-[10px] font-bold rounded animate-pulse">
                            超时
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div
                        className={cn(
                          'text-sm font-mono font-bold',
                          isOrderTimeout
                            ? 'text-red-300 animate-pulse'
                            : isOverdue
                            ? 'text-hotel-coral'
                            : 'text-gold-400'
                        )}
                      >
                        {order.timeoutMinutes || minutes}分
                      </div>
                      <div className="text-xs text-gray-500">{timeAgo(order.createdAt)}</div>
                    </div>
                    {order.priority === 'urgent' && (
                      <span className="w-2 h-2 rounded-full bg-hotel-coral animate-pulse" />
                    )}
                  </motion.div>
                )
              })}
              {pendingOrders.length === 0 && (
                <div className="text-center py-10 text-gray-500 text-sm">
                  {showPendingTimeoutOnly ? '暂无超时工单' : '暂无待处理工单'}
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-gold-400" />
                <h2 className="text-sm font-medium text-gray-400">经理待办摘要</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-red-900/50 text-red-300 border border-red-700/50">
                  待处理 {statusCounts.open}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-900/50 text-amber-300 border border-amber-700/50">
                  已跟进 {statusCounts.followedUp}
                </span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-900/50 text-green-300 border border-green-700/50">
                  已解决 {statusCounts.resolved}
                </span>
              </div>
            </div>
            <div className="space-y-2 max-h-[280px] overflow-y-auto">
              {visibleTodos.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                  ✓ 所有待办已处理完毕（或当前筛选无匹配）
                </div>
              ) : (
                visibleTodos.slice(0, 8).map((todo, i) => {
                  const isProcessed = todo.status === 'followedUp' || todo.status === 'resolved'
                  const statusBadge = getTodoStatusBadge(todo.status)
                  return (
                    <motion.div
                      key={todo.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => navigate('/admin/todos')}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:brightness-110',
                        getTodoTypeClass(todo.type, isProcessed),
                        isProcessed && 'opacity-50'
                      )}
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                          isProcessed
                            ? 'bg-gray-700/50'
                            : todo.type === 'timeout'
                            ? 'bg-red-800/50'
                            : todo.type === 'badReview'
                            ? 'bg-amber-800/50'
                            : 'bg-hotel-coral/20'
                        )}
                      >
                        {getTodoTypeIcon(todo.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={cn(
                              'text-sm font-medium truncate',
                              isProcessed ? 'text-gray-400 line-through' : 'text-white'
                            )}
                          >
                            {todo.title}
                          </div>
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0',
                              statusBadge.className
                            )}
                          >
                            {statusBadge.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mb-1.5 flex-wrap">
                          {todo.roomId && (
                            <span className="inline-flex items-center gap-1">
                              <User size={10} />
                              {todo.roomId}房 {todo.guestName || ''}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1">
                            <Clock size={10} />
                            {timeAgo(todo.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs flex-wrap">
                          <span className="inline-flex items-center gap-1 text-gold-400/80">
                            <User size={10} />
                            经理: {todo.assignedManager}
                          </span>
                          {todo.handlerName && (
                            <span className="inline-flex items-center gap-1 text-gray-400">
                              <User size={10} />
                              处理人: {todo.handlerName}
                            </span>
                          )}
                          {todo.department && (
                            <span className="inline-flex items-center gap-1 text-gray-400">
                              <Building2 size={10} />
                              {DEPARTMENT_LABELS[todo.department]}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
            {visibleTodos.length > 8 && (
              <div className="mt-3 text-center text-xs text-gray-500">
                还有 {visibleTodos.length - 8} 条待办...
              </div>
            )}
          </div>
        </div>

        <div className="col-span-2 bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-sm font-medium text-gray-400 mb-4">部门负载</h2>
          <div className="flex items-center justify-center">
            <svg width="180" height="180" viewBox="0 0 180 180">
              {deptStats.map((dept, idx) => {
                const load = dept.pending + dept.inProgress
                const ratio = totalDeptLoad > 0 ? load / totalDeptLoad : 0
                const circumference = 2 * Math.PI * 65
                const dashLength = ratio * circumference
                const gap = circumference - dashLength

                const offset = arcOffset
                arcOffset += dashLength

                return (
                  <circle
                    key={dept.department}
                    cx="90"
                    cy="90"
                    r="65"
                    fill="none"
                    stroke={donutColors[idx]}
                    strokeWidth="20"
                    strokeDasharray={`${dashLength} ${gap}`}
                    strokeDashoffset={-offset}
                    strokeLinecap="round"
                    transform="rotate(-90 90 90)"
                    className="transition-all duration-700"
                  />
                )
              })}
              <circle cx="90" cy="90" r="45" fill="#1f2937" />
              <text x="90" y="82" textAnchor="middle" className="fill-white text-2xl font-bold" fontSize="24">
                {totalDeptLoad}
              </text>
              <text x="90" y="102" textAnchor="middle" className="fill-gray-400" fontSize="12">
                进行中
              </text>
            </svg>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {deptStats.map((dept, idx) => (
              <div key={dept.department} className="flex items-center gap-2 text-xs">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: donutColors[idx] }}
                />
                <span className="text-gray-400">{dept.name}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            {deptStats.map((dept) => (
              <div key={dept.department} className="text-center">
                <div className="text-lg font-bold text-white">{dept.pending}</div>
                <div className="text-xs text-gray-500">待处理</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
        <h2 className="text-sm font-medium text-gray-400 mb-4">各部门响应时长</h2>
        <div className="space-y-4">
          {deptStats.map((dept, idx) => {
            const ratio = maxAvgResponse > 0 ? dept.avgResponseMin / maxAvgResponse : 0
            const widthPercent = Math.max(ratio * 100, dept.avgResponseMin > 0 ? 5 : 0)

            return (
              <div key={dept.department}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300">{dept.name}</span>
                    {dept.timeoutCount > 0 && (
                      <span className="px-1.5 py-0.5 bg-red-900/60 text-red-300 text-[10px] font-bold rounded border border-red-700/50">
                        {dept.timeoutCount} 超时
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-400 font-mono">{dept.avgResponseMin} 分钟</span>
                </div>
                <div className="h-6 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPercent}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.15 }}
                    className={cn(
                      'h-full rounded-full',
                      dept.timeoutCount > 0 ? 'opacity-80' : ''
                    )}
                    style={{ backgroundColor: barColors[idx] }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
