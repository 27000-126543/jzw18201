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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHotelStore } from '@/store/hotel'
import { STATUS_LABELS, SERVICE_TYPE_LABELS } from '@/types'
import { formatDate } from '@/utils/time'
import { typeIcons } from '@/data/mock'

export default function GuestProfile() {
  const { guestId } = useParams<{ guestId: string }>()
  const getGuestById = useHotelStore((s) => s.getGuestById)
  const orders = useHotelStore((s) => s.orders)
  const guest = getGuestById(guestId ?? '')

  const [expandedStay, setExpandedStay] = useState<string | null>(null)

  if (!guest) {
    return (
      <div className="text-center py-20 text-hotel-muted">
        <p>客户信息未找到</p>
      </div>
    )
  }

  const allRatings = guest.stayHistory
    .filter((s) => s.avgRating > 0)
    .map((s) => s.avgRating)
  const overallAvg = allRatings.length > 0
    ? allRatings.reduce((a, b) => a + b, 0) / allRatings.length
    : 0

  return (
    <div>
      <h2 className="text-lg font-semibold text-hotel-dark mb-6">客户档案</h2>

      <div className="card p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 text-xl font-bold">
            {guest.name[0]}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-hotel-dark">{guest.name}</h3>
            <div className="flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1 text-sm text-hotel-muted">
                <Phone size={14} />
                {guest.phone}
              </span>
              <span className="flex items-center gap-1 text-sm text-gold-600">
                <Crown size={14} />
                会员
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h3 className="text-sm font-semibold text-hotel-dark mb-3 flex items-center gap-2">
          <Tag size={14} className="text-gold-500" />
          偏好标签
        </h3>
        <div className="flex flex-wrap gap-2">
          {guest.preferences.map((pref) => (
            <span
              key={pref}
              className="px-3 py-1 rounded-full text-xs font-medium bg-gold-50 text-gold-700 border border-gold-200"
            >
              {pref}
            </span>
          ))}
          {guest.preferences.length === 0 && (
            <span className="text-sm text-hotel-muted">暂无偏好记录</span>
          )}
        </div>
      </div>

      <div className="card p-6 mb-6">
        <h3 className="text-sm font-semibold text-hotel-dark mb-4">入住历史</h3>
        <div className="space-y-0">
          {guest.stayHistory.map((stay, idx) => {
            const stayOrders = orders.filter((o) => stay.serviceOrders.includes(o.id))
            const isExpanded = expandedStay === stay.id

            return (
              <div key={stay.id}>
                <div
                  className="flex items-center gap-3 cursor-pointer py-3"
                  onClick={() => setExpandedStay(isExpanded ? null : stay.id)}
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'w-3 h-3 rounded-full border-2',
                        idx === 0 ? 'border-gold-500 bg-gold-500' : 'border-gray-300 bg-white'
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
                    <ChevronDown size={16} className="text-hotel-muted" />
                  ) : (
                    <ChevronRight size={16} className="text-hotel-muted" />
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
                          <span className="text-hotel-muted">{order.id}</span>
                          <span
                            className={cn(
                              'text-xs px-2 py-0.5 rounded-full',
                              order.status === 'completed'
                                ? 'bg-hotel-green/10 text-hotel-green'
                                : 'badge-pending'
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
