import { useState } from 'react'
import { useParams } from 'react-router-dom'
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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHotelStore } from '@/store/hotel'
import { STATUS_LABELS, SERVICE_TYPE_LABELS, CATEGORY_LABELS } from '@/types'
import type { PreferenceTag } from '@/types'
import { formatDate, formatTime } from '@/utils/time'
import { typeIcons } from '@/data/mock'

const statusBadgeClass: Record<string, string> = {
  pending: 'badge-pending',
  accepted: 'bg-blue-100 text-blue-700',
  inProgress: 'bg-purple-100 text-purple-700',
  completed: 'bg-hotel-green/10 text-hotel-green',
  cancelled: 'bg-gray-100 text-gray-500',
}

export default function GuestProfile() {
  const { guestId } = useParams<{ guestId: string }>()
  const getGuestById = useHotelStore((s) => s.getGuestById)
  const getCurrentStayForGuest = useHotelStore((s) => s.getCurrentStayForGuest)
  const orders = useHotelStore((s) => s.orders)
  const guest = getGuestById(guestId ?? '')
  const currentStayInfo = guestId ? getCurrentStayForGuest(guestId) : null

  const [expandedStay, setExpandedStay] = useState<string | null>(null)

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

  let currentStats = null
  if (currentStayInfo) {
    const { orders: currentOrders } = currentStayInfo
    const serviceCount = currentOrders.length
    const ratedOrders = currentOrders.filter((o) => o.rating != null)
    const avgRating = ratedOrders.length > 0
      ? ratedOrders.reduce((sum, o) => sum + (o.rating ?? 0), 0) / ratedOrders.length
      : 0
    const timeoutCount = currentOrders.filter((o) => o.isTimeout).length
    currentStats = { serviceCount, avgRating, timeoutCount }
  }

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

      {currentStayInfo && (
        <div className="card p-6 mb-6 border-2 border-gold-300 bg-gradient-to-br from-gold-50/50 to-white">
          <h3 className="text-sm font-semibold text-hotel-dark mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-hotel-green animate-pulse" />
            当前入住
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
            <div className="p-4 rounded-xl bg-white border border-hotel-border">
              <div className="text-xs text-hotel-muted mb-1">房间号</div>
              <div className="text-2xl font-bold text-hotel-dark flex items-center gap-2">
                <MapPin size={20} className="text-gold-500" />
                {currentStayInfo.stay.roomNumber} 房
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-hotel-border">
              <div className="text-xs text-hotel-muted mb-1">入住日期</div>
              <div className="text-lg font-semibold text-hotel-dark flex items-center gap-2">
                <CalendarDays size={18} className="text-gold-500" />
                {formatDate(currentStayInfo.stay.checkIn)} → {formatDate(currentStayInfo.stay.checkOut)}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-white border border-hotel-border">
              <div className="text-xs text-hotel-muted mb-1">本次入住概览</div>
              <div className="flex items-center gap-4 mt-1">
                <div className="text-center">
                  <div className="text-xl font-bold text-hotel-dark">{currentStats?.serviceCount || 0}</div>
                  <div className="text-xs text-hotel-muted">服务次数</div>
                </div>
                <div className="w-px h-8 bg-hotel-border" />
                <div className="text-center">
                  <div className="text-xl font-bold text-gold-600 flex items-center gap-0.5">
                    {currentStats && currentStats.avgRating > 0 ? currentStats.avgRating.toFixed(1) : '—'}
                    {currentStats && currentStats.avgRating > 0 && <Star size={14} className="fill-gold-500" />}
                  </div>
                  <div className="text-xs text-hotel-muted">平均评分</div>
                </div>
                <div className="w-px h-8 bg-hotel-border" />
                <div className="text-center">
                  <div className={cn(
                    'text-xl font-bold flex items-center gap-0.5',
                    currentStats && currentStats.timeoutCount > 0 ? 'text-red-500' : 'text-hotel-green'
                  )}>
                    {currentStats?.timeoutCount || 0}
                    {currentStats && currentStats.timeoutCount > 0 && <AlertTriangle size={14} />}
                  </div>
                  <div className="text-xs text-hotel-muted">超时次数</div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-medium text-hotel-muted mb-2">本次入住服务订单（{currentStayInfo.orders.length}）</div>
            {currentStayInfo.orders.length === 0 ? (
              <div className="text-sm text-hotel-muted py-6 text-center border border-dashed border-hotel-border rounded-xl">
                暂无服务订单
              </div>
            ) : (
              currentStayInfo.orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white border border-hotel-border hover:border-gold-300 transition-colors"
                >
                  <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center text-xl shrink-0">
                    {typeIcons[order.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-hotel-dark">
                        {SERVICE_TYPE_LABELS[order.type]}
                      </span>
                      <span className="text-xs text-hotel-muted">{order.id}</span>
                      {order.isTimeout && (
                        <span className="flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-medium">
                          <Clock size={10} />
                          超时
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-hotel-muted">
                      <span>{formatTime(order.createdAt)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {order.rating != null && (
                      <span className="flex items-center gap-0.5 text-gold-600 text-sm font-medium">
                        <Star size={12} className="fill-gold-500" />
                        {order.rating}
                      </span>
                    )}
                    <span className={cn(
                      'text-xs px-2.5 py-1 rounded-full font-medium',
                      statusBadgeClass[order.status]
                    )}>
                      {STATUS_LABELS[order.status]}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

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
                            <span
                              className="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity bg-hotel-dark text-white text-[10px] px-2 py-1 rounded pointer-events-none z-10"
                            >
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

      <div className="card p-6 mb-6">
        <h3 className="text-sm font-semibold text-hotel-dark mb-4">入住历史</h3>
        <div className="space-y-0">
          {guest.stayHistory.map((stay, idx) => {
            const stayOrders = orders.filter((o) => stay.serviceOrders.includes(o.id))
            const isExpanded = expandedStay === stay.id
            const isCurrent = stay.isCurrent

            return (
              <div key={stay.id}>
                <div
                  className={cn(
                    'flex items-center gap-3 cursor-pointer py-3 rounded-lg px-2 -mx-2 transition-colors',
                    isExpanded && 'bg-gray-50'
                  )}
                  onClick={() => setExpandedStay(isExpanded ? null : stay.id)}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-3 h-3 rounded-full border-2',
                        isCurrent
                          ? 'border-hotel-green bg-hotel-green'
                          : idx === 0
                            ? 'border-gold-500 bg-gold-500'
                            : 'border-gray-300 bg-white'
                      )}
                    />
                    {idx < guest.stayHistory.length - 1 && (
                      <div className="w-0.5 h-8 bg-gray-200" />
                    )}
                  </div>

                  <div className="flex-1 flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-hotel-dark font-medium">
                      <MapPin size={12} />
                      {stay.roomNumber}房
                      {isCurrent && (
                        <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-hotel-green/10 text-hotel-green font-medium">
                          入住中
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-1 text-hotel-muted">
                      <CalendarDays size={12} />
                      {formatDate(stay.checkIn)} - {formatDate(stay.checkOut)}
                    </span>
                    {stay.avgRating > 0 && (
                      <span className="flex items-center gap-1 text-gold-600">
                        <Star size={12} className="fill-gold-500" />
                        {stay.avgRating}
                      </span>
                    )}
                    <span className="text-hotel-muted">
                      {stay.serviceOrders.length}项服务
                    </span>
                  </div>

                  {isExpanded ? (
                    <ChevronDown size={16} className="text-hotel-muted shrink-0" />
                  ) : (
                    <ChevronRight size={16} className="text-hotel-muted shrink-0" />
                  )}
                </div>

                <AnimatePresence>
                  {isExpanded && stayOrders.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="ml-6 pl-4 border-l-2 border-gold-200 overflow-hidden"
                    >
                      {stayOrders.map((order) => (
                        <div
                          key={order.id}
                          className="flex items-center gap-3 py-2 text-sm"
                        >
                          <span>{typeIcons[order.type]}</span>
                          <span className="text-hotel-dark">{SERVICE_TYPE_LABELS[order.type]}</span>
                          <span className="text-hotel-muted text-xs">{order.id}</span>
                          <span
                            className={cn(
                              'text-xs px-2 py-0.5 rounded-full font-medium',
                              statusBadgeClass[order.status]
                            )}
                          >
                            {STATUS_LABELS[order.status]}
                          </span>
                          {order.rating != null && (
                            <span className="flex items-center gap-0.5 text-gold-500">
                              <Star size={10} className="fill-gold-500" />
                              {order.rating}
                            </span>
                          )}
                          {order.isTimeout && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
                              超时
                            </span>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-sm font-semibold text-hotel-dark mb-3">评价记录</h3>
        {allRatings.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-gold-600">{overallAvg.toFixed(1)}</span>
              <div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={cn(
                        i < Math.round(overallAvg) ? 'text-gold-500 fill-gold-500' : 'text-gray-200'
                      )}
                    />
                  ))}
                </div>
                <div className="text-xs text-hotel-muted mt-0.5">历史均分</div>
              </div>
            </div>
            <div className="space-y-2">
              {guest.stayHistory
                .filter((s) => s.avgRating > 0)
                .map((stay) => (
                  <div
                    key={stay.id}
                    className="flex items-center justify-between text-sm py-1.5 border-b border-hotel-border last:border-0"
                  >
                    <span className="text-hotel-muted">
                      {stay.roomNumber}房 ({formatDate(stay.checkIn)})
                    </span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={cn(
                            i < Math.round(stay.avgRating)
                              ? 'text-gold-500 fill-gold-500'
                              : 'text-gray-200'
                          )}
                        />
                      ))}
                      <span className="ml-1 text-hotel-dark font-medium">{stay.avgRating}</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-hotel-muted">暂无评价记录</div>
        )}
      </div>
    </div>
  )
}
