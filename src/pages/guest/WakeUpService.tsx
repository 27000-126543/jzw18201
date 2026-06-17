import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Clock, CalendarDays } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHotelStore } from '@/store/hotel'
import { generateOrderId } from '@/utils/time'
import { SERVICE_DEPARTMENT_MAP } from '@/types'

export default function WakeUpService() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const addOrder = useHotelStore((s) => s.addOrder)
  const getGuestByRoom = useHotelStore((s) => s.getGuestByRoom)

  const [dateTime, setDateTime] = useState('')
  const [repeat, setRepeat] = useState<'once' | 'daily'>('once')
  const [note, setNote] = useState('')

  const guest = getGuestByRoom(roomId || '')

  const handleSubmit = () => {
    if (!dateTime) return

    addOrder({
      id: generateOrderId(),
      roomId: roomId || '',
      guestName: guest?.name || '',
      guestId: guest?.id || '',
      type: 'wakeUp',
      status: 'pending',
      department: SERVICE_DEPARTMENT_MAP.wakeUp,
      priority: 'normal',
      details: {
        type: 'wakeUp',
        dateTime,
        repeat,
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
        <h1 className="font-display text-xl font-semibold text-hotel-dark">叫醒服务</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-5"
      >
        <div className="card p-5 flex flex-col items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center">
            <Clock className="w-8 h-8 text-gold-600" />
          </div>
          <p className="text-hotel-muted text-sm">我们将准时致电您的房间</p>
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-sm font-medium text-hotel-dark mb-1.5">
            <CalendarDays className="w-4 h-4 text-gold-500" />
            叫醒时间
          </label>
          <input
            type="datetime-local"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
            className="w-full border border-hotel-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 bg-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-hotel-dark mb-2">重复方式</label>
          <div className="flex gap-3">
            <button
              onClick={() => setRepeat('once')}
              className={cn(
                'flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-all',
                repeat === 'once'
                  ? 'border-gold-500 bg-gold-50 text-gold-700'
                  : 'border-hotel-border bg-white text-hotel-muted hover:border-gold-300'
              )}
            >
              一次
            </button>
            <button
              onClick={() => setRepeat('daily')}
              className={cn(
                'flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-all',
                repeat === 'daily'
                  ? 'border-gold-500 bg-gold-50 text-gold-700'
                  : 'border-hotel-border bg-white text-hotel-muted hover:border-gold-300'
              )}
            >
              每日
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-hotel-dark mb-1.5">备注</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="如：赶飞机、会议提醒..."
            className="w-full border border-hotel-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 bg-white"
          />
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={!dateTime}
          className={cn(
            'w-full btn-gold py-3.5 text-base',
            !dateTime && 'opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none'
          )}
        >
          设置叫醒
        </motion.button>
      </motion.div>
    </div>
  )
}
