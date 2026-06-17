import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AlertTriangle, Clock, MapPin, User, UserPlus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHotelStore } from '@/store/hotel'
import { STATUS_LABELS, DEPARTMENT_LABELS, SERVICE_TYPE_LABELS } from '@/types'
import type { OrderStatus, Department, ServiceType } from '@/types'
import { timeAgo } from '@/utils/time'
import { typeIcons } from '@/data/mock'

const statusOptions: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待处理' },
  { value: 'accepted', label: '已接单' },
  { value: 'inProgress', label: '处理中' },
  { value: 'completed', label: '已完成' },
  { value: 'cancelled', label: '已取消' },
]

const deptOptions: { value: Department | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'housekeeping', label: '客房部' },
  { value: 'fandb', label: '餐饮部' },
  { value: 'engineering', label: '工程部' },
]

const typeOptions: { value: ServiceType | 'all'; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'dining', label: '叫餐' },
  { value: 'amenities', label: '备品' },
  { value: 'repair', label: '报修' },
  { value: 'wakeUp', label: '叫醒' },
  { value: 'dnd', label: '免打扰' },
]

const statusBadgeClass: Record<string, string> = {
  pending: 'badge-pending',
  accepted: 'badge-accepted',
  inProgress: 'badge-progress',
  completed: 'badge-completed',
  cancelled: 'badge-cancelled',
}

export default function AdminHome() {
  const navigate = useNavigate()
  const activeFilter = useHotelStore((s) => s.activeFilter)
  const setFilter = useHotelStore((s) => s.setFilter)
  const filteredOrders = useHotelStore((s) => s.getFilteredOrders)()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-hotel-dark">工单池</h2>
        <span className="text-sm text-hotel-muted">共 {filteredOrders.length} 条工单</span>
      </div>

      <div className="flex gap-3 mb-6">
        <select
          value={activeFilter.status}
          onChange={(e) => setFilter({ status: e.target.value as OrderStatus | 'all' })}
          className="h-9 px-3 rounded-lg border border-hotel-border text-sm bg-white text-hotel-dark focus:outline-none focus:ring-2 focus:ring-gold-300"
        >
          {statusOptions.map((o) => (
            <option key={o.value} value={o.value}>
              状态: {o.label}
            </option>
          ))}
        </select>

        <select
          value={activeFilter.department}
          onChange={(e) => setFilter({ department: e.target.value as Department | 'all' })}
          className="h-9 px-3 rounded-lg border border-hotel-border text-sm bg-white text-hotel-dark focus:outline-none focus:ring-2 focus:ring-gold-300"
        >
          {deptOptions.map((o) => (
            <option key={o.value} value={o.value}>
              部门: {o.label}
            </option>
          ))}
        </select>

        <select
          value={activeFilter.type}
          onChange={(e) => setFilter({ type: e.target.value as ServiceType | 'all' })}
          className="h-9 px-3 rounded-lg border border-hotel-border text-sm bg-white text-hotel-dark focus:outline-none focus:ring-2 focus:ring-gold-300"
        >
          {typeOptions.map((o) => (
            <option key={o.value} value={o.value}>
              类型: {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filteredOrders.map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => navigate(`/admin/order/${order.id}`)}
            className="card p-4 cursor-pointer flex items-center gap-4"
          >
            <div className="text-2xl w-10 text-center flex-shrink-0">
              {typeIcons[order.type]}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="text-sm font-semibold text-hotel-dark">
                  {order.id}
                </span>
                <span className={cn('text-xs', statusBadgeClass[order.status])}>
                  {STATUS_LABELS[order.status]}
                </span>
                {order.isTimeout && (
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                    <AlertTriangle size={10} />
                    超时
                  </span>
                )}
                {order.priority === 'urgent' && (
                  <span className="flex items-center gap-1 text-xs text-hotel-coral font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-hotel-coral" />
                    紧急
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-sm text-hotel-muted flex-wrap">
                <span className="flex items-center gap-1">
                  {SERVICE_TYPE_LABELS[order.type]}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={12} />
                  {order.roomId}房
                </span>
                <span className="flex items-center gap-1">
                  <User size={12} />
                  {order.guestName}
                </span>
                {order.handler && (
                  <span className="flex items-center gap-1 text-hotel-dark">
                    <UserPlus size={12} className="text-gold-600" />
                    {order.handler}
                  </span>
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-1 flex-shrink-0">
              <span className="text-xs text-hotel-muted">
                {DEPARTMENT_LABELS[order.department]}
              </span>
              <span className="flex items-center gap-1 text-xs text-hotel-muted">
                <Clock size={12} />
                {timeAgo(order.createdAt)}
              </span>
            </div>
          </motion.div>
        ))}

        {filteredOrders.length === 0 && (
          <div className="text-center py-16 text-hotel-muted text-sm">
            暂无匹配的工单
          </div>
        )}
      </div>
    </div>
  )
}
