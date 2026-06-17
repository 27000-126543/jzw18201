import { useState, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, CheckCircle2, MessageSquare, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHotelStore } from '@/store/hotel'
import { typeIcons } from '@/data/mock'
import { SERVICE_TYPE_LABELS } from '@/types'
import type { ServiceOrder } from '@/types'

type TabKey = 'service' | 'overall'

const SUB_CATEGORIES = [
  { key: 'serviceResponse', label: '服务响应', icon: '⚡' },
  { key: 'roomCleanliness', label: '房间卫生', icon: '✨' },
  { key: 'diningQuality', label: '餐饮质量', icon: '🍽️' },
  { key: 'facilityMaintenance', label: '设施维护', icon: '🛠️' },
] as const

type SubCategoryKey = typeof SUB_CATEGORIES[number]['key']

export default function ReviewPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const [searchParams] = useSearchParams()
  const orderIdParam = searchParams.get('orderId')

  const getOrdersByRoom = useHotelStore((s) => s.getOrdersByRoom)
  const submitServiceReview = useHotelStore((s) => s.submitServiceReview)
  const submitOverallReview = useHotelStore((s) => s.submitOverallReview)

  const unratedCompletedOrders = useMemo(() => {
    if (!roomId) return []
    return getOrdersByRoom(roomId).filter(
      (o) => o.status === 'completed' && o.rating === undefined
    )
  }, [roomId, getOrdersByRoom])

  const initialTab: TabKey = orderIdParam ? 'service' : 'overall'
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab)

  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(orderIdParam)
  const [serviceRating, setServiceRating] = useState(0)
  const [serviceFeedback, setServiceFeedback] = useState('')
  const [serviceSubmitted, setServiceSubmitted] = useState(false)

  const [overallRating, setOverallRating] = useState(0)
  const [subRatings, setSubRatings] = useState<Record<SubCategoryKey, number>>({
    serviceResponse: 0,
    roomCleanliness: 0,
    diningQuality: 0,
    facilityMaintenance: 0,
  })
  const [overallFeedback, setOverallFeedback] = useState('')
  const [overallSubmitted, setOverallSubmitted] = useState(false)

  const selectedOrder = selectedOrderId
    ? unratedCompletedOrders.find((o) => o.id === selectedOrderId) || null
    : null

  const handleServiceSubmit = () => {
    if (!selectedOrderId || serviceRating === 0) return
    submitServiceReview(selectedOrderId, serviceRating, serviceFeedback)
    setServiceSubmitted(true)
  }

  const handleOverallSubmit = () => {
    if (!roomId || overallRating === 0) return
    const allSubs = Object.values(subRatings).every((v) => v > 0)
    const subsToSend = allSubs ? subRatings : undefined
    submitOverallReview(roomId, overallRating, overallFeedback, subsToSend)
    setOverallSubmitted(true)
  }

  const RatingMessage = ({ rating }: { rating: number }) => {
    if (rating <= 0) return null
    if (rating <= 2) return <p className="text-center text-sm text-hotel-muted mb-3">很抱歉让您不满意</p>
    if (rating === 3) return <p className="text-center text-sm text-hotel-muted mb-3">感谢您的中肯评价</p>
    if (rating === 4) return <p className="text-center text-sm text-hotel-muted mb-3">感谢您的好评！</p>
    return <p className="text-center text-sm text-hotel-muted mb-3">非常感谢您的五星好评！</p>
  }

  const Stars = ({
    value,
    onChange,
    size = 32,
    sizeMobile = size,
  }: {
    value: number
    onChange?: (n: number) => void
    size?: number
    sizeMobile?: number
  }) => (
    <div className="flex items-center justify-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <motion.button
          key={star}
          whileHover={onChange ? { scale: 1.15 } : undefined}
          whileTap={onChange ? { scale: 0.9 } : undefined}
          onClick={() => onChange && onChange(star)}
          className={cn('focus:outline-none', !onChange && 'cursor-default')}
          disabled={!onChange}
        >
          <Star
            style={{ width: size, height: size }}
            className={cn(
              'transition-colors duration-150 w-8 h-8 sm:w-auto sm:h-auto',
              star <= value ? 'fill-gold-400 text-gold-400' : 'text-hotel-border'
            )}
          />
        </motion.button>
      ))}
    </div>
  )

  const SliderStars = ({
    value,
    onChange,
    label,
    icon,
  }: {
    value: number
    onChange: (n: number) => void
    label: string
    icon: string
  }) => (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-hotel-border last:border-0">
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-lg">{icon}</span>
        <span className="text-sm font-medium text-hotel-dark">{label}</span>
      </div>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <motion.button
            key={star}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onChange(star)}
            className="focus:outline-none"
          >
            <Star
              size={18}
              className={cn(
                'transition-colors duration-150',
                star <= value ? 'fill-gold-400 text-gold-400' : 'text-hotel-border'
              )}
            />
          </motion.button>
        ))}
      </div>
    </div>
  )

  const SuccessAnimation = ({ subtitle }: { subtitle: string }) => (
    <div className="flex flex-col items-center py-6">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 250, damping: 18 }}
      >
        <CheckCircle2 className="w-16 h-16 text-hotel-green mb-3" strokeWidth={1.5} />
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-hotel-dark font-semibold text-lg"
      >
        提交成功！
      </motion.p>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="text-hotel-muted text-sm mt-1 text-center"
      >
        {subtitle}
      </motion.p>
    </div>
  )

  return (
    <div className="px-5 py-4 pb-10">
      <h1 className="font-display text-2xl font-semibold text-hotel-dark mb-4">服务评价</h1>

      <div className="flex gap-2 mb-5 p-1 bg-gray-100 rounded-xl">
        <button
          onClick={() => setActiveTab('service')}
          className={cn(
            'flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200',
            activeTab === 'service'
              ? 'bg-white text-hotel-dark shadow-sm'
              : 'text-hotel-muted hover:text-hotel-dark'
          )}
        >
          评价单项服务
        </button>
        <button
          onClick={() => setActiveTab('overall')}
          className={cn(
            'flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all duration-200',
            activeTab === 'overall'
              ? 'bg-white text-hotel-dark shadow-sm'
              : 'text-hotel-muted hover:text-hotel-dark'
          )}
        >
          整体入住评价
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'service' && (
          <motion.div
            key="service"
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 15 }}
            transition={{ duration: 0.25 }}
          >
            {serviceSubmitted ? (
              <div className="card p-6">
                <SuccessAnimation subtitle="您的服务评价已提交，我们将持续改进" />
              </div>
            ) : selectedOrder ? (
              <div className="space-y-4">
                <div className="card p-4">
                  <button
                    onClick={() => setSelectedOrderId(null)}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center text-xl shrink-0">
                      {typeIcons[selectedOrder.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-hotel-dark text-sm">
                        {SERVICE_TYPE_LABELS[selectedOrder.type]}
                      </h3>
                      <p className="text-hotel-muted text-xs mt-0.5">
                        订单号: {selectedOrder.id} · 点击切换
                      </p>
                    </div>
                    <ChevronRight size={18} className="text-hotel-muted shrink-0 -rotate-90" />
                  </button>
                </div>

                <div className="card p-5">
                  <div className="mb-4">
                    <h3 className="text-center text-sm font-medium text-hotel-dark mb-3">
                      请为本次服务打分
                    </h3>
                    <Stars value={serviceRating} onChange={setServiceRating} />
                  </div>
                  <RatingMessage rating={serviceRating} />
                  <textarea
                    value={serviceFeedback}
                    onChange={(e) => setServiceFeedback(e.target.value)}
                    placeholder="请分享您的服务体验..."
                    className="w-full border border-hotel-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 bg-white mb-4"
                    rows={3}
                  />
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleServiceSubmit}
                    disabled={serviceRating === 0}
                    className={cn(
                      'w-full btn-gold py-2.5 text-sm',
                      serviceRating === 0 &&
                        'opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none'
                    )}
                  >
                    提交服务评价
                  </motion.button>
                </div>
              </div>
            ) : (
              <>
                {unratedCompletedOrders.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-hotel-muted"
                  >
                    <MessageSquare className="w-12 h-12 mb-3 opacity-40" />
                    <p className="text-sm">暂无待评价的服务</p>
                    <p className="text-xs mt-1">完成服务后即可评价</p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-hotel-muted mb-1">请选择要评价的服务：</p>
                    {unratedCompletedOrders.map((order: ServiceOrder, index: number) => (
                      <motion.button
                        key={order.id}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedOrderId(order.id)}
                        className="card w-full overflow-hidden text-left hover:border-gold-300 transition-colors"
                      >
                        <div className="p-4 flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center text-xl shrink-0">
                            {typeIcons[order.type]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-hotel-dark text-sm">
                              {SERVICE_TYPE_LABELS[order.type]}
                            </h3>
                            <p className="text-hotel-muted text-xs mt-0.5">
                              订单号: {order.id}
                            </p>
                          </div>
                          <ChevronRight size={18} className="text-gold-500 shrink-0" />
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}

        {activeTab === 'overall' && (
          <motion.div
            key="overall"
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25 }}
          >
            {overallSubmitted ? (
              <div className="card p-6">
                <SuccessAnimation subtitle="您的入住评价已提交，期待再次为您服务" />
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-4 p-4 rounded-xl bg-gold-50 border border-gold-200"
                >
                  <p className="text-sm text-gold-800 text-center leading-relaxed">
                    🌟 如果您愿意留下联系方式，我们将有经理专门与您联系
                  </p>
                </motion.div>
              </div>
            ) : (
              <div className="card p-5">
                <div className="text-center mb-6">
                  <h2 className="font-display text-lg font-semibold text-hotel-dark mb-1">
                    感谢入住璞悦酒店
                  </h2>
                  <p className="text-sm text-hotel-muted">请为您的本次入住打个分</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-center text-xs font-medium text-hotel-muted mb-3 uppercase tracking-wide">
                    总体评分
                  </h3>
                  <Stars value={overallRating} onChange={setOverallRating} size={36} />
                  <RatingMessage rating={overallRating} />
                </div>

                <div className="mb-5">
                  <h3 className="text-xs font-medium text-hotel-muted mb-2 uppercase tracking-wide">
                    分项评分（可选）
                  </h3>
                  <div className="rounded-xl border border-hotel-border divide-y divide-hotel-border -space-y-px">
                    {SUB_CATEGORIES.map((cat) => (
                      <div key={cat.key} className="px-4">
                        <SliderStars
                          value={subRatings[cat.key]}
                          onChange={(n) =>
                            setSubRatings((prev) => ({ ...prev, [cat.key]: n }))
                          }
                          label={cat.label}
                          icon={cat.icon}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <textarea
                  value={overallFeedback}
                  onChange={(e) => setOverallFeedback(e.target.value)}
                  placeholder="请分享您的入住体验，帮助我们做得更好..."
                  className="w-full border border-hotel-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 bg-white mb-4"
                  rows={4}
                />

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleOverallSubmit}
                  disabled={overallRating === 0}
                  className={cn(
                    'w-full btn-gold py-3 text-sm font-medium',
                    overallRating === 0 &&
                      'opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none'
                  )}
                >
                  提交入住评价
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
