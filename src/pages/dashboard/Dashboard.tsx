import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { Clock, AlertCircle, BarChart3, Timer, AlarmClock, Bell, AlertTriangle, MessageSquareWarning } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHotelStore } from '@/store/hotel'
import { STATUS_LABELS, SERVICE_TYPE_LABELS } from '@/types'
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

export default function Dashboard() {
  const getPendingCount = useHotelStore((s) => s.getPendingCount)
  const getTodayOrderCount = useHotelStore((s) => s.getTodayOrderCount)
  const getAvgResponseMin = useHotelStore((s) => s.getAvgResponseMin)
  const getDepartmentStats = useHotelStore((s) => s.getDepartmentStats)
  const getTimeoutCount = useHotelStore((s) => s.getTimeoutCount)
  const getOpenTodos = useHotelStore((s) => s.getOpenTodos)
  const refreshTimeoutFlags = useHotelStore((s) => s.refreshTimeoutFlags)
  const orders = useHotelStore((s) => s.orders)

  const pendingCount = getPendingCount()
  const todayCount = getTodayOrderCount()
  const avgMin = getAvgResponseMin()
  const deptStats = getDepartmentStats()
  const timeoutCount = getTimeoutCount()
  const openTodos = getOpenTodos()

  const pendingOrders = orders.filter((o) => o.status === 'pending')
  const timeoutOrders = orders.filter((o) => o.isTimeout && o.status !== 'completed' && o.status !== 'cancelled')
  const badReviewTodos = openTodos.filter((t) => t.type === 'badReview')
  const timeoutTodos = openTodos.filter((t) => t.type === 'timeout')
  const totalDeptLoad = deptStats.reduce((s, d) => s + d.pending + d.inProgress, 0)

  const [now, setNow] = useState(Date.now())
  const marqueeRef = useRef<HTMLDivElement>(null)
  const [marqueeOffset, setMarqueeOffset] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    refreshTimeoutFlags()
    const interval = setInterval(() => {
      refreshTimeoutFlags()
    }, 30000)
    return () => clearInterval(interval)
  }, [refreshTimeoutFlags])

  const allAlertMessages = [
    ...timeoutOrders.map((o) => ({ type: 'timeout' as const, text: `⚠️ 超时警报: ${o.roomId}房 ${o.guestName} ${SERVICE_TYPE_LABELS[o.type]} 已超时${o.timeoutMinutes || 0}分钟` })),
    ...timeoutTodos.map((t) => ({ type: 'timeout' as const, text: `🔴 ${t.title} - ${t.roomId}房 ${t.guestName}` })),
    ...badReviewTodos.map((t) => ({ type: 'badReview' as const, text: `🟠 ${t.title} - ${t.roomId}房 ${t.guestName}` })),
  ]

  useEffect(() => {
    if (allAlertMessages.length === 0) return
    const totalWidth = allAlertMessages.length * 480
    const animationInterval = setInterval(() => {
      setMarqueeOffset((prev) => {
        if (prev <= -totalWidth) return 0
        return prev - 1
      })
    }, 30)
    return () => clearInterval(animationInterval)
  }, [allAlertMessages.length])

  function getPendingMinutes(createdAt: string): number {
    return Math.floor((now - new Date(createdAt).getTime()) / 60000)
  }

  const maxAvgResponse = Math.max(...deptStats.map((d) => d.avgResponseMin), 1)

  let arcOffset = 0

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {allAlertMessages.length > 0 && (
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
                {timeoutCount + badReviewTodos.length} 条预警
              </span>
            </div>
            <div className="overflow-hidden relative h-8 flex items-center">
              <div
                ref={marqueeRef}
                className="flex whitespace-nowrap"
                style={{ transform: `translateX(${marqueeOffset}px)` }}
              >
                {[...allAlertMessages, ...allAlertMessages].map((msg, idx) => (
                  <span
                    key={idx}
                    className={cn(
                      'mx-8 px-3 py-1 rounded-lg text-sm font-medium',
                      msg.type === 'timeout'
                        ? 'bg-red-700/60 text-red-100'
                        : 'bg-amber-700/60 text-amber-100'
                    )}
                  >
                    {msg.text}
                  </span>
                ))}
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
              {timeoutCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-900/50 border border-red-700/50 rounded text-xs font-medium text-red-300">
                  <AlarmClock size={10} className="animate-pulse" />
                  {timeoutCount} 条超时
                </span>
              )}
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
                <div className="text-center py-10 text-gray-500 text-sm">暂无待处理工单</div>
              )}
            </div>
          </div>

          <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Bell size={16} className="text-gold-400" />
                <h2 className="text-sm font-medium text-gray-400">经理待办摘要</h2>
              </div>
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs font-bold',
                openTodos.length > 0
                  ? 'bg-red-900/50 text-red-300 border border-red-700/50'
                  : 'bg-green-900/50 text-green-300 border border-green-700/50'
              )}>
                {openTodos.length} 条待处理
              </span>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {openTodos.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                  ✓ 所有待办已处理完毕
                </div>
              ) : (
                openTodos.slice(0, 6).map((todo, i) => (
                  <motion.div
                    key={todo.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border',
                      todo.type === 'timeout'
                        ? 'bg-red-900/20 border-red-800/40'
                        : 'bg-amber-900/20 border-amber-800/40'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                      todo.type === 'timeout' ? 'bg-red-800/50' : 'bg-amber-800/50'
                    )}>
                      {todo.type === 'timeout' ? (
                        <AlertTriangle size={14} className="text-red-400" />
                      ) : (
                        <MessageSquareWarning size={14} className="text-amber-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{todo.title}</div>
                      <div className="text-xs text-gray-500">
                        {todo.roomId && `${todo.roomId}房 ${todo.guestName || ''} · `}
                        {timeAgo(todo.createdAt)}
                      </div>
                    </div>
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0',
                      todo.status === 'open'
                        ? 'bg-red-700 text-red-100'
                        : todo.status === 'followedUp'
                        ? 'bg-amber-700 text-amber-100'
                        : 'bg-green-700 text-green-100'
                    )}>
                      {todo.status === 'open' ? '待处理' : todo.status === 'followedUp' ? '已跟进' : '已解决'}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
            {openTodos.length > 6 && (
              <div className="mt-3 text-center text-xs text-gray-500">
                还有 {openTodos.length - 6} 条待办...
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
