import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, AlertTriangle, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHotelStore } from '@/store/hotel'
import { repairIssueTypes } from '@/data/mock'
import { generateOrderId } from '@/utils/time'
import { SERVICE_DEPARTMENT_MAP } from '@/types'
import type { Priority } from '@/types'

export default function RepairRequest() {
  const { roomId } = useParams<{ roomId: string }>()
  const navigate = useNavigate()
  const addOrder = useHotelStore((s) => s.addOrder)
  const getGuestByRoom = useHotelStore((s) => s.getGuestByRoom)

  const [issueType, setIssueType] = useState('')
  const [description, setDescription] = useState('')
  const [urgency, setUrgency] = useState<Priority>('normal')
  const [showDropdown, setShowDropdown] = useState(false)

  const guest = getGuestByRoom(roomId || '')

  const handleSubmit = () => {
    if (!issueType || !description) return

    addOrder({
      id: generateOrderId(),
      roomId: roomId || '',
      guestName: guest?.name || '',
      guestId: guest?.id || '',
      type: 'repair',
      status: 'pending',
      department: SERVICE_DEPARTMENT_MAP.repair,
      priority: urgency,
      details: {
        type: 'repair',
        issueType,
        description,
        urgency,
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
        <h1 className="font-display text-xl font-semibold text-hotel-dark">报修服务</h1>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-hotel-dark mb-1.5">问题类型</label>
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 border rounded-xl text-sm text-left transition-all',
                issueType
                  ? 'border-gold-500 bg-gold-50/50 text-hotel-dark'
                  : 'border-hotel-border bg-white text-hotel-muted'
              )}
            >
              <span>{issueType || '请选择问题类型'}</span>
              <ChevronDown
                className={cn(
                  'w-4 h-4 transition-transform',
                  showDropdown && 'rotate-180'
                )}
              />
            </button>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-20 mt-1 w-full bg-white border border-hotel-border rounded-xl shadow-lg overflow-hidden"
              >
                {repairIssueTypes.map((type) => (
                  <button
                    key={type}
                    onClick={() => {
                      setIssueType(type)
                      setShowDropdown(false)
                    }}
                    className={cn(
                      'w-full px-4 py-2.5 text-sm text-left hover:bg-gold-50 transition-colors',
                      issueType === type && 'bg-gold-50 text-gold-600 font-medium'
                    )}
                  >
                    {type}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-hotel-dark mb-1.5">问题描述</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="请详细描述问题情况..."
            className="w-full border border-hotel-border rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold-500/30 focus:border-gold-500 bg-white"
            rows={4}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-hotel-dark mb-2">紧急程度</label>
          <div className="flex gap-3">
            <button
              onClick={() => setUrgency('normal')}
              className={cn(
                'flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-all',
                urgency === 'normal'
                  ? 'border-gold-500 bg-gold-50 text-gold-700'
                  : 'border-hotel-border bg-white text-hotel-muted hover:border-gold-300'
              )}
            >
              普通
            </button>
            <button
              onClick={() => setUrgency('urgent')}
              className={cn(
                'flex-1 py-3 rounded-xl text-sm font-medium border-2 transition-all flex items-center justify-center gap-1.5',
                urgency === 'urgent'
                  ? 'border-hotel-coral bg-hotel-coral/10 text-hotel-coral'
                  : 'border-hotel-border bg-white text-hotel-muted hover:border-hotel-coral/50'
              )}
            >
              <AlertTriangle className="w-4 h-4" />
              紧急
            </button>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={!issueType || !description}
          className={cn(
            'w-full btn-gold py-3.5 text-base',
            (!issueType || !description) && 'opacity-50 cursor-not-allowed hover:translate-y-0 hover:shadow-none'
          )}
        >
          提交报修
        </motion.button>
      </motion.div>
    </div>
  )
}
