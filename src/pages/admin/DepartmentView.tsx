import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, MapPin, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHotelStore } from '@/store/hotel'
import { STATUS_LABELS, DEPARTMENT_LABELS, SERVICE_TYPE_LABELS } from '@/types'
import type { Department, OrderStatus } from '@/types'
import { timeAgo } from '@/utils/time'
import { typeIcons } from '@/data/mock'

const statusBadgeClass: Record<string, string> = {
  pending: 'badge-pending',
  accepted: 'badge-accepted',
  inProgress: 'badge-progress',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
}

const quickActions: Record<string, { label: string; targetStatus: OrderStatus; className: string }[]> = {
  pending: [
    { label: '接单', targetStatus: 'accepted', className: 'bg-gold-500 text-white hover:bg-gold-600' },
  ],
  accepted: [
    { label: '处理中', targetStatus: 'inProgress', className: 'bg-blue-500 text-white hover:bg-blue-600' },
  ],
  inProgress: [
    { label: '完成', targetStatus: 'completed', className: 'bg-hotel-green text-white hover:bg-green-600' },
  ],
}

export default function DepartmentView() {
  const { dept } = useParams<{ dept: Department }>()
  const getOrdersByDepartment = useHotelStore((s) => s.getOrdersByDepartment)
  const updateOrderStatus = useHotelStore((s) => s.updateOrderStatus)

  const department = (dept ?? 'housekeeping') as Department
  const orders = getOrdersByDepartment(department)
  const deptLabel = DEPARTMENT_LABELS[department]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-hotel-dark">{deptLabel}工单</h2>
        <span className="text-sm text-hotel-muted">共 {orders.length} 条</span>
      </div>

      <div className="space-y-3">
        {orders.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="card p-4"
          >
            <div className="flex items-center gap-4">
              <div className="text-2xl w-10 text-center flex-shrink-0">
                {typeIcons[order.type]}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-semibold text-hotel-dark">{order.id}</span>
                  <span className={cn('text-xs', statusBadgeClass[order.status])}>
                    {STATUS_LABELS[order.status]}
                  </span>
                  {order.priority === 'urgent' && (
                    <span className="flex items-center gap-1 text-xs text-hotel-coral font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-hotel-coral" />
                      紧急
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm text-hotel-muted">
                  <span>{SERVICE_TYPE_LABELS[order.type]}</span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} />
                    {order.roomId}房
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={12} />
                    {order.guestName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {timeAgo(order.createdAt)}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 flex-shrink-0">
                {(quickActions[order.status] ?? []).map((action) => (
                  <button
                    key={action.targetStatus}
                    onClick={() => updateOrderStatus(order.id, action.targetStatus)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
                      action.className
                    )}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-16 text-hotel-muted text-sm">
            暂无工单
          </div>
        )}
      </div>
    </div>
  )
}
