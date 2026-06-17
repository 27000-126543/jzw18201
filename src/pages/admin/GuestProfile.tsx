import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Phone,
  Crown,
  ChevronDown,
  ChevronRight,
  MapPin,
  CalendarDays,
  Star,
  Tag,
  Download,
  AlertTriangle,
  Clock,
  Home,
  MessageSquare,
  ExternalLink,
  Bell,
  CheckCircle2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHotelStore } from '@/store/hotel'
import { STATUS_LABELS, SERVICE_TYPE_LABELS, CATEGORY_LABELS, OVERALL_SUB_LABELS } from '@/types'
import type { PreferenceTag, StayRecord } from '@/types'
import { formatDate, formatTime } from '@/utils/time'
import { typeIcons } from '@/data/mock'

const statusBadgeClass: Record<string, string> = {
  pending: 'badge-pending',
  accepted: 'bg-blue-100 text-blue-700',
  inProgress: 'bg-purple-100 text-purple-700',
  completed: 'bg-hotel-green/10 text-hotel-green',
  cancelled: 'bg-gray-100 text-gray-500',
}

const todoStatusConfig: Record<string, { label: string; bgClass: string; textClass: string }> = {
  open: { label: '待处理', bgClass: 'bg-red-100', textClass: 'text-red-700' },
  followedUp: { label: '已跟进', bgClass: 'bg-amber-100', textClass: 'text-amber-700' },
  resolved: { label: '已解决', bgClass: 'bg-green-100', textClass: 'text-green-700' },
}

function StayReviewCard({ stay, guestId }: { stay: StayRecord; guestId: string }) {
  const [expanded, setExpanded] = useState(stay.isCurrent ?? false)
  const getReviewsForStay = useHotelStore((s) => s.getReviewsForStay)
  const getTodosByRoom = useHotelStore((s) => s.getTodosByRoom)
  const orders = useHotelStore((s) => s.orders)
  const followUpTodo = useHotelStore((s) => s.followUpTodo)
  const resolveTodo = useHotelStore((s) => s.resolveTodo)

  const stayReviews = useMemo(() => getReviewsForStay(stay.id), [stay.id, getReviewsForStay])
  const roomTodos = useMemo(() => getTodosByRoom(stay.roomNumber), [stay.roomNumber, getTodosByRoom])

  const serviceRatingCount = stayReviews.services.length
  const stayOrders = useMemo(
    () => stay.serviceOrders.map((oid) => orders.find((o) => o.id === oid)).filter(Boolean) as NonNullable<typeof orders[number]>[],
    [stay.serviceOrders, orders]
  )
  const unratedOrders = useMemo(
    () => stayOrders.filter((o) => o.rating == null),
    [stayOrders]
  )

  return (
    <div className={cn(
      'card overflow-hidden transition-all',
      stay.isCurrent ? 'border-2 border-gold-300 bg-gradient-to-br from-gold-50/50 to-white' : ''
    )}>
      <div
        className="flex items-center gap-3 p-5 cursor-pointer hover:bg-gray-50/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0',
          stay.isCurrent ? 'bg-gold-100' : 'bg-gray-100'
        )}>
          <MapPin size={18} className={stay.isCurrent ? 'text-gold-600' : 'text-gray-500'} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-hotel-dark">{stay.roomNumber}房</span>
            {stay.isCurrent && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-hotel-green/10 text-hotel-green">
                <span className="w-1.5 h-1.5 rounded-full bg-hotel-green animate-pulse" />
                入住中
              </span>
            )}
            <span className="text-sm text-hotel-muted flex items-center gap-1">
              <CalendarDays size={12} />
              {formatDate(stay.checkIn)} - {formatDate(stay.checkOut)}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-hotel-muted">
            {stay.overallRating != null && (
              <span className="flex items-center gap-0.5 text-gold-600 font-medium">
                <Star size={12} className="fill-gold-500 text-gold-500" />
                整体 {stay.overallRating}
              </span>
            )}
            <span>{serviceRatingCount} 项服务评分</span>
            <span>{roomTodos.length} 条相关待办</span>
          </div>
        </div>
        <div className="shrink-0">
          {expanded ? <ChevronDown size={18} className="text-hotel-muted" /> : <ChevronRight size={18} className="text-hotel-muted" />}
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-5 border-t border-hotel-border/60 pt-4">
              {stayReviews.overall && (
                <div className="p-4 rounded-xl bg-gold-50/40 border border-gold-200">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-gold-800 flex items-center gap-2">
                      <Star size={14} className="text-gold-500 fill-gold-500" />
                      整体入住评价
                    </span>
                    <span className="text-xs text-hotel-muted">
                      {stay.overallReviewedAt && `${formatDate(stay.overallReviewedAt)} ${formatTime(stay.overallReviewedAt)}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={24}
                        className={cn(
                          i < Math.round(stayReviews.overall!.rating)
                            ? 'text-gold-500 fill-gold-500'
                            : 'text-gray-200'
                        )}
                      />
                    ))}
                    <span className="ml-2 text-2xl font-bold text-gold-700">{stayReviews.overall.rating}</span>
                  </div>
                  {stayReviews.overall.feedback && (
                    <p className="text-sm text-hotel-dark leading-relaxed mb-3">{stayReviews.overall.feedback}</p>
                  )}
                  {stayReviews.overall.subRatings && (
                    <div className="space-y-2">
                      {Object.entries(stayReviews.overall.subRatings).map(([key, value]) => (
                        <div key={key} className="flex items-center gap-3">
                          <span className="text-xs text-hotel-dark w-16 shrink-0">{OVERALL_SUB_LABELS[key] || key}</span>
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-gold-400 to-gold-500 rounded-full"
                              style={{ width: `${(value / 5) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-gold-600 w-6 text-right">{value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {stayReviews.services.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-hotel-dark mb-3 flex items-center gap-2">
                    <MessageSquare size={14} className="text-blue-500" />
                    服务评分
                  </h4>
                  <div className="space-y-2">
                    {stayReviews.services.map((svc) => {
                      const isBad = svc.rating < 4
                      return (
                        <Link
                          key={svc.order.id}
                          to={`/admin/order/${svc.order.id}`}
                          className={cn(
                            'flex items-center gap-3 p-3 rounded-xl border transition-colors group',
                            isBad
                              ? 'bg-red-50/50 border-red-200 hover:border-red-300'
                              : 'bg-white border-hotel-border hover:border-gold-300'
                          )}
                        >
                          <div className="w-9 h-9 rounded-lg bg-gold-50 flex items-center justify-center text-lg shrink-0">
                            {typeIcons[svc.order.type]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm text-hotel-dark group-hover:text-gold-600 transition-colors">
                                {SERVICE_TYPE_LABELS[svc.order.type]}
                              </span>
                              <span className="text-xs text-hotel-muted">{svc.order.id}</span>
                              {isBad && (
                                <span className="text-xs px-1.5 py-0.5 rounded-full bg-red-500 text-white font-medium">差评</span>
                              )}
                            </div>
                            {svc.feedback && (
                              <p className="text-xs text-hotel-muted mt-0.5 truncate">{svc.feedback}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5 shrink-0">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={12}
                                className={cn(
                                  i < svc.rating
                                    ? 'text-gold-500 fill-gold-500'
                                    : 'text-gray-200'
                                )}
                              />
                            ))}
                            <span className="ml-1 text-sm font-semibold text-hotel-dark">{svc.rating}</span>
                          </div>
                          <ExternalLink size={12} className="text-hotel-muted group-hover:text-gold-600 transition-colors shrink-0" />
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )}

              {roomTodos.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-hotel-dark mb-3 flex items-center gap-2">
                    <Bell size={14} className="text-red-500" />
                    相关待办（{roomTodos.length}）
                  </h4>
                  <div className="space-y-2">
                    {roomTodos.map((todo) => {
                      const stCfg = todoStatusConfig[todo.status]
                      return (
                        <div
                          key={todo.id}
                          className="flex items-start gap-3 p-3 rounded-xl bg-white border border-hotel-border"
                        >
                          <div className={cn(
                            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                            todo.type === 'timeout' ? 'bg-red-50' : 'bg-amber-50'
                          )}>
                            {todo.type === 'timeout'
                              ? <AlertTriangle size={16} className="text-red-500" />
                              : <MessageSquare size={16} className="text-amber-500" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-hotel-dark">{todo.title}</span>
                              <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', stCfg.bgClass, stCfg.textClass)}>
                                {stCfg.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-hotel-muted">
                              {todo.assignedManager && (
                                <span>负责人: {todo.assignedManager}</span>
                              )}
                              {todo.handlerName && (
                                <span>处理人: {todo.handlerName}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {todo.status === 'open' && (
                              <button
                                onClick={() => followUpTodo(todo.id, '当班经理')}
                                className="px-2.5 py-1 text-xs rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors font-medium"
                              >
                                跟进
                              </button>
                            )}
                            {todo.status === 'followedUp' && (
                              <button
                                onClick={() => resolveTodo(todo.id)}
                                className="px-2.5 py-1 text-xs rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors font-medium inline-flex items-center gap-1"
                              >
                                <CheckCircle2 size={12} />
                                解决
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {unratedOrders.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-hotel-dark mb-3 flex items-center gap-2">
                    <Clock size={14} className="text-gray-400" />
                    未评价服务订单
                  </h4>
                  <div className="space-y-1.5">
                    {unratedOrders.map((order) => (
                      <Link
                        key={order.id}
                        to={`/admin/order/${order.id}`}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <span className="text-base">{typeIcons[order.type]}</span>
                        <span className="text-sm text-hotel-dark font-medium group-hover:text-gold-600 transition-colors">
                          {SERVICE_TYPE_LABELS[order.type]}
                        </span>
                        <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium', statusBadgeClass[order.status])}>
                          {STATUS_LABELS[order.status]}
                        </span>
                        <span className="text-xs text-hotel-muted">{formatTime(order.createdAt)}</span>
                        <ExternalLink size={10} className="text-hotel-muted group-hover:text-gold-600 transition-colors ml-auto" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function GuestProfile() {
  const { guestId } = useParams<{ guestId: string }>()
  const getGuestById = useHotelStore((s) => s.getGuestById)
  const guest = getGuestById(guestId ?? '')

  if (!guest) {
    return (
      <div className="text-center py-20 text-hotel-muted">
        <p>客户信息未找到</p>
      </div>
    )
  }

  const totalStays = guest.stayHistory.length
  const isVip = totalStays >= 3

  const categorizedPrefs = guest.preferences.reduce<Record<PreferenceTag['category'], PreferenceTag[]>>(
    (acc, pref) => {
      if (!acc[pref.category]) acc[pref.category] = []
      acc[pref.category].push(pref)
      return acc
    },
    { dining: [], amenities: [], sleep: [], other: [] }
  )

  const allRatings = guest.stayHistory
    .filter((s) => s.avgRating > 0)
    .map((s) => s.avgRating)
  const overallAvg = allRatings.length > 0
    ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
    : 0

  const sortedStays = [...guest.stayHistory].sort((a, b) => {
    if (a.isCurrent && !b.isCurrent) return -1
    if (!a.isCurrent && b.isCurrent) return 1
    return new Date(b.checkIn).getTime() - new Date(a.checkIn).getTime()
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-hotel-dark">客户档案</h2>
        <button
          onClick={() => alert('偏好摘要导出功能演示')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border border-hotel-border text-hotel-dark hover:bg-gray-50 transition-colors"
        >
          <Download size={16} />
          导出偏好摘要
        </button>
      </div>

      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 text-xl font-bold">
            {guest.name[0]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-semibold text-hotel-dark">{guest.name}</h3>
              {isVip && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs font-medium">
                  <Crown size={12} />
                  VIP客户
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-2">
              <span className="flex items-center gap-1 text-sm text-hotel-muted">
                <Phone size={14} />
                {guest.phone}
              </span>
              <span className="flex items-center gap-1 text-sm text-hotel-muted">
                <Home size={14} />
                累计入住 <span className="font-semibold text-hotel-dark">{totalStays}</span> 次
              </span>
              {overallAvg > 0 && (
                <span className="flex items-center gap-1 text-sm text-gold-600">
                  <Star size={14} className="fill-gold-500" />
                  历史均分 {overallAvg.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="text-sm font-semibold text-hotel-dark mb-4 flex items-center gap-2">
          <MessageSquare size={14} className="text-gold-500" />
          入住评价总览
          <span className="text-xs font-normal text-hotel-muted ml-1">（{sortedStays.length} 次入住）</span>
        </h3>
        <div className="space-y-3">
          {sortedStays.map((stay) => (
            <StayReviewCard key={stay.id} stay={stay} guestId={guest.id} />
          ))}
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h3 className="text-sm font-semibold text-hotel-dark mb-4 flex items-center gap-2">
          <Tag size={14} className="text-gold-500" />
          偏好标签
          <span className="text-xs font-normal text-hotel-muted ml-1">（共 {guest.preferences.length} 项）</span>
        </h3>

        {guest.preferences.length === 0 ? (
          <div className="text-sm text-hotel-muted py-8 text-center">暂无偏好记录</div>
        ) : (
          <div className="space-y-5">
            {(Object.keys(categorizedPrefs) as PreferenceTag['category'][]).map((category) => {
              const tags = categorizedPrefs[category]
                .slice()
                .sort((a, b) => b.count - a.count)
              if (tags.length === 0) return null

              return (
                <div key={category}>
                  <h4 className="text-xs font-semibold text-hotel-muted mb-2 uppercase tracking-wide">
                    {CATEGORY_LABELS[category]}
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((pref) => {
                      const isFrequent = pref.count >= 3
                      return (
                        <div
                          key={pref.id}
                          className={cn(
                            'group relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                            isFrequent
                              ? 'bg-gradient-to-r from-amber-100 to-yellow-100 border-amber-300 text-amber-800 shadow-sm'
                              : 'bg-white border-hotel-border text-hotel-dark hover:border-gold-300'
                          )}
                        >
                          <span>{pref.label}</span>
                          <span className={cn(
                            'px-1.5 py-0.5 rounded-full text-[10px] font-bold',
                            isFrequent ? 'bg-amber-200/80 text-amber-700' : 'bg-gray-100 text-gray-500'
                          )}>
                            ×{pref.count}
                          </span>
                          <span className={cn(
                            'px-1.5 py-0.5 rounded-full text-[10px] font-medium',
                            pref.source === 'auto'
                              ? 'bg-blue-100 text-blue-600'
                              : 'bg-purple-100 text-purple-600'
                          )}>
                            {pref.source === 'auto' ? '自动' : '手动'}
                          </span>
                          {pref.lastUsed && (
                            <span className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-hotel-dark text-white text-[10px] px-2 py-1 rounded pointer-events-none z-10">
                              最近使用: {formatDate(pref.lastUsed)}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
