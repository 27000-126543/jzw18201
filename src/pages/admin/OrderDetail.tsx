import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  MapPin,
  User,
  Clock,
  CheckCircle2,
  Circle,
  Star,
  MessageSquare,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHotelStore } from '@/store/hotel'
import { STATUS_LABELS, DEPARTMENT_LABELS, SERVICE_TYPE_LABELS } from '@/types'
import type { OrderStatus } from '@/types'
import { formatDateTime, responseDuration } from '@/utils/time'
import { typeIcons } from '@/data/mock'

const timelineSteps: { status: OrderStatus; label: string }[] = [
  { status: 'pending', label: '创建' },
  { status: 'accepted', label: '已接单' },
  { status: 'inProgress', label: '处理中' },
  { status: 'completed', label: '已完成' },
]

const statusOrder: OrderStatus[] = ['pending', 'accepted', 'inProgress', 'completed']

function getStepIndex(status: OrderStatus): number {
  if (status === 'cancelled') return -1
  return statusOrder.indexOf(status)
}

const actionButtons: Record<OrderStatus, { label: string; target: OrderStatus; className: string }[]> = {
  pending: [{ label: '接单', target: 'accepted', className: 'bg-gold-500 text-white hover:bg-gold-600' }],
  accepted: [{ label: '开始处理', target: 'inProgress', className: 'bg-blue-500 text-white hover:bg-blue-600' }],
  inProgress: [{ label: '完成', target: 'completed', className: 'bg-hotel-green text-white hover:bg-green-600' }],
  completed: [],
  cancelled: [],
}

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const orders = useHotelStore((s) => s.orders)
  const updateOrderStatus = useHotelStore((s) => s.updateOrderStatus)

  const order = orders.find((o) => o.id === orderId)

  if (!order) {
    return (
      <div className="text-center py-20 text-hotel-muted">
        <p>工单未找到</p>
        <button onClick={() => navigate('/admin')} className="mt-4 text-gold-600 text-sm hover:underline">
          返回工单池
        </button>
      </div>
    )
  }

  const currentStepIndex = getStepIndex(order.status)

  const timestampMap: Record<string, string | undefined> = {
    pending: order.createdAt,
    accepted: order.acceptedAt,
    inProgress: order.acceptedAt,
    completed: order.completedAt,
  }

  function renderDetailContent() {
    const d = order.details
    switch (d.type) {
      case 'dining':
        return (
          <div className="space-y-2">
            <div className="text-sm font-medium text-hotel-dark">餐品明细</div>
            {d.items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-hotel-muted">
                  {item.name} x{item.quantity}
                </span>
                <span className="text-hotel-dark">¥{item.price * item.quantity}</span>
              </div>
            ))}
            <div className="flex justify-between text-sm font-semibold border-t border-hotel-border pt-2">
              <span>合计</span>
              <span className="text-hotel-coral">¥{d.totalAmount}</span>
            </div>
            {d.note && <div className="text-xs text-hotel-muted mt-1">备注: {d.note}</div>}
          </div>
        )
      case 'amenities':
        return (
          <div className="space-y-2">
            <div className="text-sm font-medium text-hotel-dark">备品列表</div>
            <div className="flex flex-wrap gap-2">
              {d.items.map((item) => (
                <span key={item} className="px-2 py-1 bg-gold-50 text-gold-700 text-xs rounded-md">
                  {item}
                </span>
              ))}
            </div>
            {d.note && <div className="text-xs text-hotel-muted mt-1">备注: {d.note}</div>}
          </div>
        )
      case 'repair':
        return (
          <div className="space-y-2">
            <div className="text-sm font-medium text-hotel-dark">报修信息</div>
            <div className="text-sm text-hotel-muted">问题类型: {d.issueType}</div>
            <div className="text-sm text-hotel-muted">描述: {d.description}</div>
            {d.urgency === 'urgent' && (
              <span className="inline-flex items-center gap-1 text-xs text-hotel-coral font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-hotel-coral" />
                紧急
              </span>
            )}
          </div>
        )
      case 'wakeUp':
        return (
          <div className="space-y-2">
            <div className="text-sm font-medium text-hotel-dark">叫醒信息</div>
            <div className="text-sm text-hotel-muted">时间: {formatDateTime(d.dateTime)}</div>
            <div className="text-sm text-hotel-muted">重复: {d.repeat === 'once' ? '单次' : '每天'}</div>
            {d.note && <div className="text-xs text-hotel-muted">备注: {d.note}</div>}
          </div>
        )
      case 'dnd':
        return (
          <div className="space-y-2">
            <div className="text-sm font-medium text-hotel-dark">免打扰时段</div>
            <div className="text-sm text-hotel-muted">
              {d.startTime} - {d.endTime}
            </div>
            {d.note && <div className="text-xs text-hotel-muted">备注: {d.note}</div>}
          </div>
        )
    }
  }

  return (
    <div>
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1 text-sm text-hotel-muted hover:text-hotel-dark mb-4 transition-colors"
      >
        <ArrowLeft size={16} />
        返回
      </button>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-3 gap-6"
      >
        <div className="col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{typeIcons[order.type]}</span>
              <div>
                <h2 className="text-lg font-semibold text-hotel-dark">{order.id}</h2>
                <p className="text-sm text-hotel-muted">{SERVICE_TYPE_LABELS[order.type]}</p>
              </div>
              {order.priority === 'urgent' && (
                <span className="ml-auto flex items-center gap-1 px-2 py-1 bg-hotel-coral/10 text-hotel-coral text-xs font-medium rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-hotel-coral" />
                  紧急
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-hotel-muted">
                <MapPin size={14} />
                <span>房间: {order.roomId}</span>
              </div>
              <div className="flex items-center gap-2 text-hotel-muted">
                <User size={14} />
                <span>客人: {order.guestName}</span>
              </div>
              <div className="flex items-center gap-2 text-hotel-muted">
                <Clock size={14} />
                <span>创建: {formatDateTime(order.createdAt)}</span>
              </div>
              <div className="text-hotel-muted">部门: {DEPARTMENT_LABELS[order.department]}</div>
              {order.handler && (
                <div className="text-hotel-muted">处理人: {order.handler}</div>
              )}
              {order.acceptedAt && (
                <div className="text-hotel-muted">接单: {formatDateTime(order.acceptedAt)}</div>
              )}
              {order.completedAt && (
                <div className="text-hotel-muted">完成: {formatDateTime(order.completedAt)}</div>
              )}
            </div>

            <div className="mt-4 pt-4 border-t border-hotel-border">
              {renderDetailContent()}
            </div>

            {order.status !== 'cancelled' && order.status !== 'completed' && (
              <div className="mt-4 pt-4 border-t border-hotel-border flex gap-3">
                {actionButtons[order.status].map((btn) => (
                  <button
                    key={btn.target}
                    onClick={() => updateOrderStatus(order.id, btn.target)}
                    className={cn('px-5 py-2 rounded-lg text-sm font-medium transition-colors', btn.className)}
                  >
                    {btn.label}
                  </button>
                ))}
                <button
                  onClick={() => updateOrderStatus(order.id, 'cancelled')}
                  className="px-5 py-2 rounded-lg text-sm font-medium border border-hotel-border text-hotel-muted hover:bg-gray-50 transition-colors"
                >
                  取消工单
                </button>
              </div>
            )}
          </div>

          {order.rating != null && (
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-hotel-dark mb-3">客户评价</h3>
              <div className="flex items-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={18}
                    className={cn(i < order.rating! ? 'text-gold-500 fill-gold-500' : 'text-gray-200')}
                  />
                ))}
                <span className="ml-2 text-sm text-hotel-dark font-medium">{order.rating}</span>
              </div>
              {order.feedback && (
                <div className="flex items-start gap-2 mt-2">
                  <MessageSquare size={14} className="text-hotel-muted mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-hotel-muted">{order.feedback}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-hotel-dark mb-4">状态流转</h3>
            <div className="space-y-0">
              {timelineSteps.map((step, idx) => {
                const reached = idx <= currentStepIndex && currentStepIndex >= 0
                const isCurrent = idx === currentStepIndex
                const ts = timestampMap[step.status]

                return (
                  <div key={step.status} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      {reached ? (
                        <CheckCircle2
                          size={20}
                          className={cn(
                            'flex-shrink-0',
                            isCurrent ? 'text-gold-500' : 'text-hotel-green'
                          )}
                        />
                      ) : (
                        <Circle size={20} className="text-gray-300 flex-shrink-0" />
                      )}
                      {idx < timelineSteps.length - 1 && (
                        <div
                          className={cn(
                            'w-0.5 h-8',
                            reached && idx < currentStepIndex ? 'bg-hotel-green' : 'bg-gray-200'
                          )}
                        />
                      )}
                    </div>
                    <div className="pb-6">
                      <div
                        className={cn(
                          'text-sm font-medium',
                          reached ? 'text-hotel-dark' : 'text-gray-400'
                        )}
                      >
                        {step.label}
                      </div>
                      {ts && reached && (
                        <div className="text-xs text-hotel-muted mt-0.5">
                          {formatDateTime(ts)}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {order.status === 'cancelled' && (
              <div className="mt-2 px-3 py-2 bg-gray-50 rounded-lg text-sm text-gray-500">
                工单已取消
              </div>
            )}
          </div>

          <div className="card p-6">
            <h3 className="text-sm font-semibold text-hotel-dark mb-2">响应时长</h3>
            <div className="text-2xl font-semibold text-gold-600">
              {responseDuration(order.createdAt, order.completedAt)}
            </div>
            <div className="text-xs text-hotel-muted mt-1">
              {order.status === 'completed' ? '总耗时' : '已耗时（进行中）'}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
