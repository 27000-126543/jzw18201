import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, Minus, ShoppingCart, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHotelStore } from '@/store/hotel'
import { menuData } from '@/data/mock'
import type { DiningItem } from '@/types'

export default function DiningOrder() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const addOrder = useHotelStore((s) => s.addOrder)
  const getGuestByRoom = useHotelStore((s) => s.getGuestByRoom)

  const [activeCategory, setActiveCategory] = useState(menuData[0].id)
  const [cart, setCart] = useState<Record<string, number>>({})
  const [note, setNote] = useState('')
  const [showNote, setShowNote] = useState(false)

  const guest = getGuestByRoom(roomId || '')
  const activeItems = menuData.find((c) => c.id === activeCategory)?.items || []

  const cartItems = useMemo(() => {
    return Object.entries(cart)
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const menuItem = menuData.flatMap((c) => c.items).find((i) => i.id === id)!
        return { ...menuItem, quantity: qty }
      })
  }, [cart])

  const totalItems = cartItems.reduce((sum, i) => sum + i.quantity, 0)
  const totalAmount = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0)

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      const newQty = (prev[itemId] || 0) + delta
      if (newQty <= 0) {
        const next = { ...prev }
        delete next[itemId]
        return next
      }
      return { ...prev, [itemId]: newQty }
    })
  }

  const handleSubmit = () => {
    if (totalItems === 0) return

    const diningItems: DiningItem[] = cartItems.map((i) => ({
      id: i.id,
      name: i.name,
      price: i.price,
      quantity: i.quantity,
    }))

    addOrder({
      roomId: roomId || '',
      guestName: guest?.name || '',
      guestId: guest?.id || '',
      type: 'dining',
      details: {
        type: 'dining',
        items: diningItems,
        totalAmount,
        note,
      },
    })

    navigate(`/guest/${roomId}/requests`)
  }

  return (
    <div className="flex flex-col h-[calc(100vh-56px-68px)]">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-hotel-border bg-white shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-1 -ml-1 text-hotel-dark hover:text-gold-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-xl font-semibold text-hotel-dark">叫餐服务</h1>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-[76px] bg-gold-50/50 border-r border-hotel-border overflow-y-auto shrink-0">
          {menuData.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                'w-full py-3.5 px-1.5 text-xs text-center transition-all duration-200 leading-tight',
                activeCategory === cat.id
                  ? 'bg-white text-gold-600 font-semibold border-l-[3px] border-gold-500'
                  : 'text-hotel-muted hover:text-hotel-dark'
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-3"
            >
              {activeItems.map((menuItem) => {
                const qty = cart[menuItem.id] || 0
                return (
                  <div key={menuItem.id} className="card p-3">
                    <div className="flex gap-3">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gold-100 to-gold-50 flex items-center justify-center text-2xl shrink-0">
                        🍽️
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-medium text-hotel-dark text-sm">{menuItem.name}</h3>
                          <span className="text-gold-600 font-semibold text-sm whitespace-nowrap">
                            ¥{menuItem.price}
                          </span>
                        </div>
                        <p className="text-hotel-muted text-xs mt-0.5 line-clamp-2">
                          {menuItem.description}
                        </p>
                        {menuItem.tags && (
                          <div className="flex gap-1 mt-1">
                            {menuItem.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-hotel-coral/10 text-hotel-coral"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                        <div className="flex items-center justify-end mt-2">
                          {qty > 0 ? (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(menuItem.id, -1)}
                                className="w-7 h-7 rounded-full border border-hotel-border flex items-center justify-center text-hotel-muted hover:border-gold-500 hover:text-gold-500 transition-colors"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-6 text-center text-sm font-medium">{qty}</span>
                              <button
                                onClick={() => updateQuantity(menuItem.id, 1)}
                                className="w-7 h-7 rounded-full bg-gold-500 text-white flex items-center justify-center hover:bg-gold-600 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => updateQuantity(menuItem.id, 1)}
                              className="w-7 h-7 rounded-full bg-gold-500 text-white flex items-center justify-center hover:bg-gold-600 transition-colors"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </motion.div>
          </AnimatePresence>

          <div className="mt-4 mb-2">
            <button
              onClick={() => setShowNote(!showNote)}
              className={cn(
                'flex items-center gap-1.5 text-sm transition-colors',
                showNote ? 'text-gold-600' : 'text-hotel-muted hover:text-hotel-dark'
              )}
            >
              <MessageSquare className="w-4 h-4" />
              {showNote ? '收起备注' : '添加备注'}
            </button>
            <AnimatePresence>
              {showNote && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="如：少盐、不要葱..."
                    className="w-full border border-hotel-border rounded-lg px-3 py-2 text-sm mt-2 resize-none focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500"
                    rows={2}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="border-t border-hotel-border bg-white px-4 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <ShoppingCart className="w-6 h-6 text-gold-500" />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-2 -right-2 w-4 h-4 bg-hotel-coral text-white text-[10px] rounded-full flex items-center justify-center"
                >
                  {totalItems}
                </motion.span>
              )}
            </div>
            <div>
              <span className="text-hotel-muted text-xs">合计</span>
              <span className="text-gold-600 font-bold text-lg ml-1">¥{totalAmount}</span>
            </div>
          </div>
          <button
            onClick={handleSubmit}
            disabled={totalItems === 0}
            className={cn(
              'btn-gold px-8 py-2.5 text-sm',
              totalItems === 0 && 'opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none'
            )}
          >
            提交订单
          </button>
        </div>
      </div>
    </div>
  )
}
