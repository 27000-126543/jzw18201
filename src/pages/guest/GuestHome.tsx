import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Clock, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHotelStore } from '@/store/hotel'
import { typeIcons } from '@/data/mock'
import type { ServiceType } from '@/types'

const serviceCards: { type: ServiceType; label: string; path: string; desc: string }[] = [
  { type: 'dining', label: '叫餐', path: 'dining', desc: '美食送至客房' },
  { type: 'amenities', label: '补备品', path: 'amenities', desc: '补充客房用品' },
  { type: 'repair', label: '报修', path: 'repair', desc: '设施维修服务' },
  { type: 'wakeUp', label: '叫醒', path: 'wakeup', desc: '定时叫醒服务' },
  { type: 'dnd', label: '免打扰', path: 'dnd', desc: '设置免打扰时段' },
]

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
}

export default function GuestHome() {
  const { roomId } = useParams<{ roomId: string }>()
  const getGuestByRoom = useHotelStore((s) => s.getGuestByRoom)
  const guest = getGuestByRoom(roomId || '')

  return (
    <div className="px-5 py-4">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <p className="text-hotel-muted text-sm mb-1">欢迎下榻</p>
        <h1 className="font-display text-3xl font-bold text-hotel-dark">
          {guest?.name || '贵宾'}，您好
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <span className="inline-flex items-center gap-1.5 bg-gold-100 text-gold-700 px-3 py-1 rounded-full text-sm font-medium">
            <Clock className="w-3.5 h-3.5" />
            {roomId}房
          </span>
        </div>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 gap-3"
      >
        {serviceCards.map((card, index) => (
          <motion.div
            key={card.type}
            variants={item}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={cn('card p-4 cursor-pointer group', index === 0 && 'col-span-2')}
          >
            <Link to={`/guest/${roomId}/${card.path}`} className="flex items-center gap-4">
              <div
                className={cn(
                  'w-14 h-14 rounded-2xl flex items-center justify-center text-3xl',
                  'bg-gradient-to-br from-gold-50 to-gold-100',
                  'group-hover:scale-110 transition-transform duration-200'
                )}
              >
                {typeIcons[card.type]}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-hotel-dark text-lg">{card.label}</h3>
                <p className="text-hotel-muted text-xs mt-0.5">{card.desc}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-hotel-muted group-hover:text-gold-500 transition-colors" />
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
