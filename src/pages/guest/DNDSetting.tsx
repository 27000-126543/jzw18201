import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Moon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHotelStore } from '@/store/hotel'
import { generateOrderId } from '@/utils/time'
import { SERVICE_DEPARTMENT_MAP } from '@/types'

export default function DNDSetting() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const addOrder = useHotelStore((s) => s.addOrder)
  const getGuestByRoom = useHotelStore((s) => s.getGuestByRoom)

  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [note, setNote] = useState('')

  const guest = getGuestByRoom(roomId || '')

  const handleSubmit = () => {
    if (!startTime || !endTime) return

    addOrder({
      id: generateOrderId(),
      roomId: roomId || '',
      guestName: guest?.name || '',
      guestId: guest?.id || '',
      type: 'dnd',
      status: 'pending',
      department: SERVICE_DEPARTMENT_MAP.dnd,
      priority: 'normal',
      details: {
        type: 'dnd',
        startTime,
        endTime,
        note,
      },
      createdAt: new Date().toISOString(),
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
        <h1 className="font-display text-xl font-semibold text-hotel-dark">免打扰</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-5"
      >
        <div className="card p-5 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center">
            <Moon className="w-8 h-8 text-indigo-500" />
          </div>
          <p className="text-hotel-muted text-sm text-center">
            设置免打扰时段，期间将暂停客房服务
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-hotel-dark mb-1.5">开始时间</label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            className="w-full border border-hotel-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-hotel-dark mb-1.5">结束时间</label>
          <input
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            className="w-full border border-hotel-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-hotel-dark mb-1.5">备注</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="如：午休时间请勿打扰..."
            className="w-full border border-hotel-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 bg-white"
            rows={3}
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={!startTime || !endTime}
          className={cn(
            'w-full btn-gold py-3.5 text-base',
            (!startTime || !endTime) && 'opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none'
          )}
        >
          设置免打扰
        </motion.button>
      </motion.div>
    </div>
  )
}
