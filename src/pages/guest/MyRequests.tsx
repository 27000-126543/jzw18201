import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Inbox } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHotelStore } from '@/store/hotel'
import { typeIcons } from '@/data/mock'
import { timeAgo } from '@/utils/time'
import { SERVICE_TYPE_LABELS, STATUS_LABELS } from '@/types'

const statusBadgeMap: Record<string, string> = {
  pending: 'badge-pending',
  accepted: 'badge-accepted',
  inProgress: 'badge-progress',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
}

const statusProgressMap: Record<string, number> = {
  pending: 15,
  accepted: 40,
  inProgress: 65,
  completed: 100,
  cancelled: 0,
}

const statusColorMap: Record<string, string> = {
  pending: 'bg-hotel-coral',
  accepted: 'bg-gold-500',
  inProgress: 'bg-blue-500',
  completed: 'bg-hotel-green',
  cancelled: 'bg-gray-300',
}

const extendedStatusLabel: Record<string, string> = {
  ...STATUS_LABELS,
  active: '生效中',
}

export default function MyRequests() {
  const { roomId } = useParams<{ roomId: string }>()
  const getOrdersByRoom = useHotelStore((s) => s.getOrdersByRoom)
  const orders = getOrdersByRoom(roomId || '')

  return (
    <div className="px-5 py-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="font-display text-2xl font-semibold text-hotel-dark">我的请求</h1>
        <button className="flex items-center gap-1 text-hotel-muted text-sm hover:text-gold-500 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
          刷新
        </button>
      </div>

      {orders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-20 text-hotel-muted"
        >
          <Inbox className="w-12 h-12 mb-3 opacity-40" />
          <p className="text-sm">暂无服务请求</p>
        </motion.div>
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {orders.map((order, index) => {
              const badgeClass = statusBadgeMap[order.status] || 'badge-pending'
              const progress = statusProgressMap[order.status] ?? 0
              const progressColor = statusColorMap[order.status] || 'bg-gray-300'
              const statusLabel = extendedStatusLabel[order.status] || order.status

              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="card p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center text-xl shrink-0">
                      {typeIcons[order.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-medium text-hotel-dark text-sm">
                          {SERVICE_TYPE_LABELS[order.type]}
                        </h3>
                        <span className={cn(badgeClass)}>{statusLabel}</span>
                      </div>
                      <p className="text-hotel-muted text-xs mt-1">{timeAgo(order.createdAt)}</p>

                      {order.type === 'dining' && order.details.type === 'dining' && (
                        <p className="text-hotel-muted text-xs mt-1 truncate">
                          {order.details.items.map((i) => i.name).join('、')}
                        </p>
                      )}
                      {order.type === 'amenities' && order.details.type === 'amenities' && (
                        <p className="text-hotel-muted text-xs mt-1 truncate">
                          {order.details.items.join('、')}
                        </p>
                      )}
                      {order.type === 'repair' && order.details.type === 'repair' && (
                        <p className="text-hotel-muted text-xs mt-1 truncate">
                          {order.details.issueType}
                        </p>
                      )}
                      {order.type === 'wakeUp' && order.details.type === 'wakeUp' && (
                        <p className="text-hotel-muted text-xs mt-1 truncate">
                          {order.details.dateTime.replace('T', ' ')}
                        </p>
                      )}
                      {order.type === 'dnd' && order.details.type === 'dnd' && (
                        <p className="text-hotel-muted text-xs mt-1 truncate">
                          {order.details.startTime} - {order.details.endTime}
                        </p>
                      )}

                      <div className="mt-3 h-1.5 bg-hotel-border rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.6, delay: index * 0.05 + 0.2 }}
                          className={cn('h-full rounded-full', progressColor)}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </AnimatePresence>
      )}
    </div>
  )
}
