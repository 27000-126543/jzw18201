import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  MapPin,
  User,
  Clock,
  AlertTriangle,
  Star,
  MessageSquare,
  UserPlus,
  CheckCircle2,
  PlayCircle,
  XCircle,
  FileText,
  ShieldCheck,
  ArrowRight,
  Tag,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHotelStore } from '@/store/hotel'
import { STATUS_LABELS, DEPARTMENT_LABELS, SERVICE_TYPE_LABELS } from '@/types'
import type { OrderStatus } from '@/types'
import { formatDateTime, responseDuration, timeAgo } from '@/utils/time'
import { typeIcons, departments } from '@/data/mock'

export default function OrderDetail() {
  const { orderId } = useParams<{ orderId: string }>()
  const navigate = useNavigate()
  const orders = useHotelStore((s) => s.orders)
  const transitionOrder = useHotelStore((s) => s.transitionOrder)
  const assignHandler = useHotelStore((s) => s.assignHandler)

  const [note, setNote] = useState('')
  const [selectedHandler, setSelectedHandler] = useState('')

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

  const deptInfo = departments.find((d) => d.id === order.department)
  const handlerOptions = deptInfo?.handlers ?? []

  function handleAssignHandler() {
    if (!selectedHandler) return
    assignHandler(order.id, selectedHandler, '前台接待', note || undefined)
    setSelectedHandler('')
    setNote('')
  }

  function handleTransition(toStatus: OrderStatus) {
    transitionOrder(order.id, toStatus, '前台接待', undefined, note || undefined)
    setNote('')
  }

  function handleAcceptAndAssign() {
    const handler = selectedHandler || handlerOptions[0]
    if (!handler) return
    transitionOrder(order.id, 'accepted', '前台接待', handler, note || undefined)
    setSelectedHandler('')
    setNote('')
  }

  function handleStartProcessing() {
    transitionOrder(order.id, 'inProgress', order.handler || '前台接待', undefined, note || undefined)
    setNote('')
  }

  function handleComplete() {
    transitionOrder(order.id, 'completed', order.handler || '前台接待', undefined, note || undefined)
    setNote('')
  }

  function handleCancel() {
    transitionOrder(order.id, 'cancelled', '前台接待', undefined, note || undefined)
    setNote('')
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

  function renderActionPanel() {
    if (order.status === 'completed' || order.status === 'cancelled') return null

    return (
      <div className="mt-4 pt-4 border-t border-hotel-border space-y-4">
        <div>
          <label className="text-xs text-hotel-muted mb-1.5 block">操作备注（可选）</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="添加备注信息..."
            className="w-full px-3 py-2 rounded-lg border border-hotel-border text-sm text-hotel-dark placeholder:text-hotel-muted/60 focus:outline-none focus:ring-2 focus:ring-gold-300 resize-none"
            rows={2}
          />
        </div>

        {order.status === 'pending' && (
          <div className="space-y-3">
            <div className="p-3 bg-gold-50/50 rounded-lg border border-gold-200/50">
              <div className="text-xs font-medium text-gold-800 mb-2 flex items-center gap-1">
                <UserPlus size={14} />
                接单并分配处理人
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedHandler}
                  onChange={(e) => setSelectedHandler(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-lg border border-hotel-border text-sm bg-white text-hotel-dark focus:outline-none focus:ring-2 focus:ring-gold-300"
                >
                  <option value="">选择处理人...</option>
                  {handlerOptions.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <button
                  onClick={handleAcceptAndAssign}
                  disabled={!selectedHandler && handlerOptions.length === 0}
                  className="px-4 h-9 rounded-lg bg-gold-500 text-white text-sm font-medium hover:bg-gold-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  接单+分配
                </button>
              </div>
            </div>

            {order.handler && (
              <div className="p-3 bg-blue-50/50 rounded-lg border border-blue-200/50">
                <div className="text-xs font-medium text-blue-800 mb-2 flex items-center gap-1">
                  <UserPlus size={14} />
                  仅分配处理人（保持待处理状态）
                </div>
                <div className="flex gap-2">
                  <select
                    value={selectedHandler}
                    onChange={(e) => setSelectedHandler(e.target.value)}
                    className="flex-1 h-9 px-3 rounded-lg border border-hotel-border text-sm bg-white text-hotel-dark focus:outline-none focus:ring-2 focus:ring-gold-300"
                  >
                    <option value="">选择处理人...</option>
                    {handlerOptions.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                  <button
                    onClick={handleAssignHandler}
                    disabled={!selectedHandler}
                    className="px-4 h-9 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    分配
                  </button>
                </div>
              </div>
            )}

            <button
              onClick={handleCancel}
              className="w-full h-9 rounded-lg border border-hotel-border text-hotel-muted text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              取消工单
            </button>
          </div>
        )}

        {order.status === 'accepted' && (
          <div className="flex gap-3">
            {!order.handler && (
              <div className="flex-1 flex gap-2">
                <select
                  value={selectedHandler}
                  onChange={(e) => setSelectedHandler(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-lg border border-hotel-border text-sm bg-white text-hotel-dark focus:outline-none focus:ring-2 focus:ring-gold-300"
                >
                  <option value="">先分配处理人...</option>
                  {handlerOptions.map((h) => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                <button
                  onClick={handleAssignHandler}
                  disabled={!selectedHandler}
                  className="px-4 h-9 rounded-lg bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  分配
                </button>
              </div>
            )}
            <button
              onClick={handleStartProcessing}
              className={cn(
                'h-9 px-5 rounded-lg text-sm font-medium transition-colors',
                order.handler
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-200 text-gray-500 hover:bg-gray-300 flex-1'
              )}
            >
              <span className="flex items-center gap-1.5 justify-center">
                <PlayCircle size={16} />
                开始处理
              </span>
            </button>
            <button
              onClick={handleCancel}
              className="h-9 px-5 rounded-lg border border-hotel-border text-hotel-muted text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              取消工单
            </button>
          </div>
        )}

        {order.status === 'inProgress' && (
          <div className="flex gap-3">
            <button
              onClick={handleComplete}
              className="flex-1 h-9 rounded-lg bg-hotel-green text-white text-sm font-medium hover:bg-green-600 transition-colors"
            >
              <span className="flex items-center gap-1.5 justify-center">
                <CheckCircle2 size={16} />
                完成服务
              </span>
            </button>
            <button
              onClick={handleCancel}
              className="h-9 px-5 rounded-lg border border-hotel-border text-hotel-muted text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              取消工单
            </button>
          </div>
        )}
      </div>
    )
  }

  function getLogIcon(toStatus: OrderStatus, handlerAssigned?: string) {
    if (handlerAssigned) return <UserPlus size={16} />
    switch (toStatus) {
      case 'pending':
        return <Tag size={16} />
      case 'accepted':
        return <ShieldCheck size={16} />
      case 'inProgress':
        return <PlayCircle size={16} />
      case 'completed':
        return <CheckCircle2 size={16} />
      case 'cancelled':
        return <XCircle size={16} />
    }
  }

  function getLogIconClass(toStatus: OrderStatus) {
    switch (toStatus) {
      case 'pending':
        return 'bg-gray-100 text-gray-600'
      case 'accepted':
        return 'bg-gold-100 text-gold-700'
      case 'inProgress':
        return 'bg-blue-100 text-blue-700'
      case 'completed':
        return 'bg-green-100 text-green-700'
      case 'cancelled':
        return 'bg-red-100 text-red-600'
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
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-hotel-dark">{order.id}</h2>
                  {order.isTimeout && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                      <AlertTriangle size={12} />
                      超时 {order.timeoutMinutes}分钟
                    </span>
                  )}
                </div>
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
                <span>创建: {formatDateTime(order.createdAt)} ({timeAgo(order.createdAt)})</span>
              </div>
              <div className="text-hotel-muted">部门: {DEPARTMENT_LABELS[order.department]}</div>
              {order.handler && (
                <div className="flex items-center gap-2 text-hotel-muted">
                  <UserPlus size={14} />
                  <span>处理人: <span className="text-hotel-dark font-medium">{order.handler}</span></span>
                </div>
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

            {renderActionPanel()}
          </div>

          {(order.rating != null || order.feedback) && (
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-hotel-dark mb-3 flex items-center gap-1.5">
                <Star size={16} className="text-gold-500" />
                客户评价
              </h3>
              {order.rating != null && (
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      className={cn(i < order.rating! ? 'text-gold-500 fill-gold-500' : 'text-gray-200')}
                    />
                  ))}
                  <span className="ml-2 text-sm text-hotel-dark font-medium">{order.rating}/5</span>
                </div>
              )}
              {order.feedback && (
                <div className="flex items-start gap-2">
                  <MessageSquare size={14} className="text-hotel-muted mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-hotel-muted leading-relaxed">{order.feedback}</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-hotel-dark mb-4 flex items-center gap-1.5">
              <FileText size={16} />
              处理日志
            </h3>
            <div className="space-y-0">
              {order.logs.map((log, idx) => (
                <div key={log.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                      getLogIconClass(log.toStatus)
                    )}>
                      {getLogIcon(log.toStatus, log.handlerAssigned)}
                    </div>
                    {idx < order.logs.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gray-200 my-1" />
                    )}
                  </div>
                  <div className={cn(
                    'pb-5 flex-1',
                    idx === order.logs.length - 1 && 'pb-0'
                  )}>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm font-medium text-hotel-dark">
                        {STATUS_LABELS[log.toStatus]}
                      </span>
                      {log.fromStatus && (
                        <>
                          <ArrowRight size={12} className="text-gray-400" />
                          <span className="text-xs text-gray-500">
                            自 {STATUS_LABELS[log.fromStatus]}
                          </span>
                        </>
                      )}
                      {log.handlerAssigned && (
                        <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded ml-1">
                          分配: {log.handlerAssigned}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-hotel-muted">
                      <span>{formatDateTime(log.timestamp)}</span>
                      <span>·</span>
                      <span>{log.operator}</span>
                    </div>
                    {log.note && (
                      <div className="mt-1.5 text-xs text-gray-600 bg-gray-50 px-2 py-1.5 rounded">
                        {log.note}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-sm font-semibold text-hotel-dark mb-2">响应时长</h3>
            <div className="text-2xl font-semibold text-gold-600">
              {responseDuration(order.createdAt, order.completedAt)}
            </div>
            <div className="text-xs text-hotel-muted mt-1">
              {order.status === 'completed' ? '总耗时' : order.status === 'cancelled' ? '已取消' : '已耗时（进行中）'}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
