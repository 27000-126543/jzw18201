import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHotelStore } from '@/store/hotel'
import { amenityOptions } from '@/data/mock'

export default function AmenitiesRequest() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const addOrder = useHotelStore((s) => s.addOrder)
  const getGuestByRoom = useHotelStore((s) => s.getGuestByRoom)

  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [note, setNote] = useState('')

  const guest = getGuestByRoom(roomId || '')

  const toggleItem = (item: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(item)) next.delete(item)
      else next.add(item)
      return next
    })
  }

  const handleSubmit = () => {
    if (selected.size === 0) return

    addOrder({
      roomId: roomId || '',
      guestName: guest?.name || '',
      guestId: guest?.id || '',
      type: 'amenities',
      details: {
        type: 'amenities',
        items: Array.from(selected),
        note,
      },
    })

    navigate(`/guest/${roomId}/requests`)
  }

  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => navigate(-1)}
          className="p-1 -ml-1 text-hotel-dark hover:text-gold-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="font-display text-xl font-semibold text-hotel-dark">补充备品</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <p className="text-hotel-muted text-sm mb-3">请选择需要的备品（可多选）</p>

        <div className="grid grid-cols-2 gap-2.5 mb-5">
          {amenityOptions.map((option) => {
            const isSelected = selected.has(option)
            return (
              <motion.button
                key={option}
                whileTap={{ scale: 0.97 }}
                onClick={() => toggleItem(option)}
                className={cn(
                  'flex items-center gap-2.5 px-3.5 py-3 rounded-xl border-2 text-left transition-all duration-200',
                  isSelected
                    ? 'border-gold-500 bg-gold-50 text-gold-700'
                    : 'border-hotel-border bg-white text-hotel-dark hover:border-gold-300'
                )}
              >
                <div
                  className={cn(
                    'w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all',
                    isSelected
                      ? 'border-gold-500 bg-gold-500'
                      : 'border-hotel-border'
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm font-medium">{option}</span>
              </motion.button>
            )
          })}
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-hotel-dark mb-1.5">备注</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="如有特殊需求请备注..."
            className="w-full border border-hotel-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 bg-white"
            rows={3}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={selected.size === 0}
          className={cn(
            'w-full btn-gold py-3.5 text-base',
            selected.size === 0 && 'opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none'
          )}
        >
          提交请求{selected.size > 0 && `（${selected.size}项）`}
        </motion.button>
      </motion.div>
    </div>
  )
}
