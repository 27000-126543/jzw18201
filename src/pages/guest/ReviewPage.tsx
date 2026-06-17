import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, CheckCircle2, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHotelStore } from '@/store/hotel'
import { typeIcons } from '@/data/mock'
import { SERVICE_TYPE_LABELS } from '@/types'

export default function ReviewPage() {
  const { roomId } = useParams<{ roomId: string }>()
  const getOrdersByRoom = useHotelStore((s) => s.getOrdersByRoom)
  const submitReview = useHotelStore((s) => s.submitReview)

  const orders = getOrdersByRoom(roomId || '').filter(
    (o) => o.status === 'completed' && o.rating === undefined
  )

  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState<Set<string>>(new Set())
  const [expanded, setExpanded] = useState<string | null>(null)

  const handleStarClick = (orderId: string, rating: number) => {
    setRatings((prev) => ({ ...prev, [orderId]: rating }))
  }

  const handleSubmit = (orderId: string) => {
    const rating = ratings[orderId]
    if (!rating) return
    const feedback = feedbacks[orderId] || ''
    submitReview(orderId, rating, feedback)
    setSubmitted((prev) => new Set(prev).add(orderId))
  }

  return (
    <div className="px-5 py-4">
      <h1 className="font-display text-2xl font-semibold text-hotel-dark mb-4">服务评价</h1>

      {orders.length === 0 ? (
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
          {orders.map((order, index) => {
            const isSubmitted = submitted.has(order.id)
            const isExpanded = expanded === order.id
            const currentRating = ratings[order.id] || 0

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="card overflow-hidden"
              >
                <button
                  onClick={() => setExpanded(isExpanded ? null : order.id)}
                  className="w-full p-4 flex items-center gap-3 text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-gold-50 flex items-center justify-center text-xl shrink-0">
                    {typeIcons[order.type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-hotel-dark text-sm">
                      {SERVICE_TYPE_LABELS[order.type]}
                    </h3>
                    <p className="text-hotel-muted text-xs mt-0.5">订单号: {order.id}</p>
                  </div>
                  {isSubmitted ? (
                    <CheckCircle2 className="w-5 h-5 text-hotel-green shrink-0" />
                  ) : (
                    <span className="text-gold-500 text-xs font-medium shrink-0">
                      {isExpanded ? '收起' : '去评价'}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 border-t border-hotel-border pt-4">
                        {isSubmitted ? (
                          <div className="flex flex-col items-center py-4">
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            >
                              <CheckCircle2 className="w-10 h-10 text-hotel-green mb-2" />
                            </motion.div>
                            <p className="text-hotel-dark font-medium">感谢您的评价！</p>
                            <p className="text-hotel-muted text-xs mt-1">
                              您的反馈将帮助我们提供更好的服务
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-center justify-center gap-2 mb-4">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <motion.button
                                  key={star}
                                  whileHover={{ scale: 1.15 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleStarClick(order.id, star)}
                                  className="focus:outline-none"
                                >
                                  <Star
                                    className={cn(
                                      'w-8 h-8 transition-colors duration-150',
                                      star <= currentRating
                                        ? 'fill-gold-400 text-gold-400'
                                        : 'text-hotel-border'
                                    )}
                                  />
                                </motion.button>
                              ))}
                            </div>
                            {currentRating > 0 && (
                              <p className="text-center text-sm text-hotel-muted mb-3">
                                {currentRating <= 2 && '很抱歉让您不满意'}
                                {currentRating === 3 && '感谢您的中肯评价'}
                                {currentRating === 4 && '感谢您的好评！'}
                                {currentRating === 5 && '非常感谢您的五星好评！'}
                              </p>
                            )}
                            <textarea
                              value={feedbacks[order.id] || ''}
                              onChange={(e) =>
                                setFeedbacks((prev) => ({
                                  ...prev,
                                  [order.id]: e.target.value,
                                }))
                              }
                              placeholder="请分享您的服务体验..."
                              className="w-full border border-hotel-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 bg-white mb-3"
                              rows={3}
                            />
                            <motion.button
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => handleSubmit(order.id)}
                              disabled={!currentRating}
                              className={cn(
                                'w-full btn-gold py-2.5 text-sm',
                                !currentRating &&
                                  'opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none'
                              )}
                            >
                              提交评价
                            </motion.button>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
