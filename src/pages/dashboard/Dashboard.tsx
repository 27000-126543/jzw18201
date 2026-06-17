import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock, AlertCircle, BarChart3, Timer } from 'lucide-react'
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
  const orders = useHotelStore((s) => s.orders)

  const pendingCount = getPendingCount()
  const todayCount = getTodayOrderCount()
  const avgMin = getAvgResponseMin()
  const deptStats = getDepartmentStats()

  const pendingOrders = orders.filter((o) => o.status === 'pending')
  const totalDeptLoad = deptStats.reduce((s, d) => s + d.pending + d.inProgress, 0)

  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(t)
  }, [])

  function getPendingMinutes(createdAt: string): number {
    return Math.floor((now - new Date(createdAt).getTime()) / 60000)
  }

  const maxAvgResponse = Math.max(...deptStats.map((d) => d.avgResponseMin), 1)

  let arcOffset = 0

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
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

      <div className="grid grid-cols-3 gap-6 mb-8">
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
          transition={{ delay: 0.2 }}
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
        <div className="col-span-3 bg-gray-800 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-sm font-medium text-gray-400 mb-4">待处理工单</h2>
          <div className="space-y-3 max-h-[340px] overflow-y-auto">
            {pendingOrders.map((order, i) => {
              const minutes = getPendingMinutes(order.createdAt)
              const isOverdue = minutes > 10

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl transition-colors',
                    isOverdue ? 'bg-red-900/20 border border-red-800/40' : 'bg-gray-750 border border-gray-700'
                  )}
                >
                  <span className="text-xl">{typeIcons[order.type]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{order.roomId}房</span>
                      <span className="text-gray-500 text-xs">{order.guestName}</span>
                      <span className="text-gray-500 text-xs">{SERVICE_TYPE_LABELS[order.type]}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div
                      className={cn(
                        'text-sm font-mono font-bold',
                        isOverdue ? 'text-hotel-coral' : 'text-gold-400'
                      )}
                    >
                      {minutes}分
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
                  <span className="text-sm text-gray-300">{dept.name}</span>
                  <span className="text-sm text-gray-400 font-mono">{dept.avgResponseMin} 分钟</span>
                </div>
                <div className="h-6 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPercent}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.15 }}
                    className="h-full rounded-full"
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
