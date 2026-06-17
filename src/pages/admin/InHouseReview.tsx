import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  RefreshCw,
  ArrowLeft,
  Search,
  FileText,
  User,
  Star,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHotelStore } from '@/store/hotel'

type FilterMode = 'all' | 'highRisk' | 'hasTodos'

function getRiskLevel(badReviews: number, openTodos: number) {
  if (badReviews > 0 || openTodos >= 2) {
    return { level: 'high', label: '高风险', color: 'red', icon: '🔴' }
  }
  if (openTodos === 1) {
    return { level: 'medium', label: '中风险', color: 'amber', icon: '🟡' }
  }
  return { level: 'low', label: '低风险', color: 'green', icon: '🟢' }
}

export default function InHouseReview() {
  const getInHouseRiskSummary = useHotelStore((s) => s.getInHouseRiskSummary)
  const getGuestById = useHotelStore((s) => s.getGuestById)
  const [refreshKey, setRefreshKey] = useState(0)
  const [filterMode, setFilterMode] = useState<FilterMode>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const summary = useMemo(() => {
    return getInHouseRiskSummary()
  }, [getInHouseRiskSummary, refreshKey])

  const filteredGuests = useMemo(() => {
    let result = summary.guests

    if (filterMode === 'highRisk') {
      result = result.filter((g) =>
        g.rooms.some((r) => {
          const risk = getRiskLevel(r.badReviews, r.openTodos)
          return risk.level === 'high'
        })
      )
    } else if (filterMode === 'hasTodos') {
      result = result.filter((g) =>
        g.rooms.some((r) => r.openTodos > 0)
      )
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      result = result.filter((g) => {
        const nameMatch = g.guestName.toLowerCase().includes(query)
        const roomMatch = g.rooms.some((r) =>
          r.roomNumber.toLowerCase().includes(query)
        )
        return nameMatch || roomMatch
      })
    }

    return result
  }, [summary, filterMode, searchQuery])

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1)
  }

  const stats = [
    {
      icon: '🛎️',
      label: '在住客人',
      value: summary.guests.length,
      bgClass: 'bg-gold-50',
      borderClass: 'border-gold-200',
      textClass: 'text-gold-700',
    },
    {
      icon: '⏳',
      label: '待处理服务',
      value: summary.totalPending,
      bgClass: 'bg-blue-50',
      borderClass: 'border-blue-200',
      textClass: 'text-blue-700',
    },
    {
      icon: '⚠️',
      label: '待跟进待办',
      value: summary.totalOpenTodos,
      bgClass: 'bg-amber-50',
      borderClass: 'border-amber-200',
      textClass: 'text-amber-700',
    },
    {
      icon: '👎',
      label: '差评数量',
      value: summary.totalBadReviews,
      bgClass: 'bg-red-50',
      borderClass: 'border-red-200',
      textClass: 'text-red-700',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-hotel-dark">住中复盘</h2>
          <p className="text-sm text-hotel-muted mt-1">
            交班时快速查看风险与未完事项
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-hotel-border text-hotel-dark hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <RefreshCw size={16} />
            刷新
          </button>
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gold-50 text-gold-700 hover:bg-gold-100 transition-colors text-sm font-medium border border-gold-200"
          >
            <ArrowLeft size={16} />
            返回后台
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn(
              'rounded-xl p-5 border',
              stat.bgClass,
              stat.borderClass
            )}
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-sm text-hotel-muted">{stat.label}</span>
            </div>
            <div className={cn('text-3xl font-bold', stat.textClass)}>
              {stat.value}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="card p-4">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Filter size={16} className="text-hotel-muted shrink-0" />
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {[
                { value: 'all', label: '全部客人' },
                { value: 'highRisk', label: '仅高风险' },
                { value: 'hasTodos', label: '仅待办' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setFilterMode(opt.value as FilterMode)}
                  className={cn(
                    'px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                    filterMode === opt.value
                      ? 'bg-white text-gold-700 shadow-sm'
                      : 'text-hotel-muted hover:text-hotel-dark'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-hotel-muted"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索客人姓名或房间号..."
              className="pl-9 pr-4 py-2 rounded-lg border border-hotel-border bg-white text-sm text-hotel-dark focus:outline-none focus:ring-2 focus:ring-gold-300 w-64"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredGuests.map((guest, guestIdx) => {
          const profile = getGuestById(guest.guestId)
          const phone = profile?.phone || '-'

          return (
            <motion.div
              key={guest.guestId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: guestIdx * 0.05 }}
              className="card p-5"
            >
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-hotel-border/60">
                <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 shrink-0">
                  <User size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-hotel-dark">
                      {guest.guestName}
                    </h3>
                    <span className="text-sm text-hotel-muted">{phone}</span>
                  </div>
                  <div className="text-xs text-hotel-muted">
                    共 {guest.rooms.length} 间客房
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {guest.rooms.map((room) => {
                  const risk = getRiskLevel(room.badReviews, room.openTodos)

                  return (
                    <div
                      key={room.stayId}
                      className={cn(
                        'p-4 rounded-xl border bg-gray-50',
                        risk.level === 'high'
                          ? 'border-red-200 bg-red-50/30'
                          : risk.level === 'medium'
                          ? 'border-amber-200 bg-amber-50/30'
                          : 'border-gray-200'
                      )}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">🏨</span>
                            <span className="font-semibold text-hotel-dark">
                              {room.roomNumber} 房
                            </span>
                            <span className="text-xs text-hotel-muted">
                              #{room.stayId}
                            </span>
                          </div>

                          <span
                            className={cn(
                              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium',
                              risk.level === 'high'
                                ? 'bg-red-100 text-red-700'
                                : risk.level === 'medium'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-green-100 text-green-700'
                            )}
                          >
                            {risk.icon} {risk.label}
                          </span>

                          {room.badReviews > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              <AlertTriangle size={12} />
                              差评 {room.badReviews}
                            </span>
                          )}

                          {room.openTodos > 0 && (
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                              <Clock size={12} />
                              待办 {room.openTodos}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-6 mb-4 text-sm">
                        <div className="flex items-center gap-1.5 text-hotel-muted">
                          <FileText size={14} className="text-gold-600" />
                          服务次数:
                          <span className="font-semibold text-hotel-dark">
                            {room.orders}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-hotel-muted">
                          <Clock size={14} className="text-blue-600" />
                          待处理:
                          <span className="font-semibold text-blue-700">
                            {room.pending}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-hotel-muted">
                          <CheckCircle2 size={14} className="text-green-600" />
                          已完成:
                          <span className="font-semibold text-green-700">
                            {room.completed}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-hotel-muted">
                          <Star size={14} className="text-amber-500" />
                          平均评分:
                          <span className="font-semibold text-amber-600">
                            {room.avgRating > 0
                              ? room.avgRating.toFixed(1)
                              : '暂无'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={`/admin/guest/${guest.guestId}?expandStay=${room.stayId}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-gold-50 text-gold-700 hover:bg-gold-100 transition-colors font-medium border border-gold-200"
                        >
                          👤 客户档案
                        </Link>
                        <Link
                          to={`/admin/todos?guestId=${guest.guestId}&roomId=${room.roomNumber}&stayId=${room.stayId}&source=inhouse`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors font-medium border border-amber-200"
                        >
                          📋 入住待办
                        </Link>
                        <Link
                          to={`/admin`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-medium border border-blue-200"
                        >
                          📋 工单列表
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )
        })}

        {filteredGuests.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card p-12 text-center"
          >
            <div className="text-5xl mb-4">🏨</div>
            <div className="text-lg font-medium text-hotel-muted mb-1">
              {summary.guests.length === 0
                ? '暂无在住客人'
                : '暂无符合筛选条件的客人'}
            </div>
            <div className="text-sm text-hotel-muted">
              {summary.guests.length === 0
                ? '当前没有正在入住的客人'
                : '请尝试调整筛选条件'}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
