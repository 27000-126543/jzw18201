import { Link } from 'react-router-dom'
import { Hotel, Monitor, User } from 'lucide-react'
import { motion } from 'framer-motion'

export default function Home() {
  return (
    <div className="min-h-screen bg-hotel-bg flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 mb-6 shadow-lg">
            <Hotel className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-display text-5xl font-bold text-hotel-dark mb-3">
            璞悦酒店
          </h1>
          <p className="text-hotel-muted text-lg">在住服务管理系统</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Link
              to="/guest/801"
              className="card p-8 flex flex-col items-center text-center group cursor-pointer hover:border-gold-300"
            >
              <div className="w-14 h-14 rounded-xl bg-gold-50 flex items-center justify-center mb-4 group-hover:bg-gold-100 transition-colors">
                <User className="w-7 h-7 text-gold-600" />
              </div>
              <h3 className="font-display text-lg font-semibold text-hotel-dark mb-2">客人服务</h3>
              <p className="text-sm text-hotel-muted">扫码进入客房服务</p>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.5 }}
          >
            <Link
              to="/admin"
              className="card p-8 flex flex-col items-center text-center group cursor-pointer hover:border-gold-300"
            >
              <div className="w-14 h-14 rounded-xl bg-gold-50 flex items-center justify-center mb-4 group-hover:bg-gold-100 transition-colors">
                <Hotel className="w-7 h-7 text-gold-600" />
              </div>
              <h3 className="font-display text-lg font-semibold text-hotel-dark mb-2">后台管理</h3>
              <p className="text-sm text-hotel-muted">工单池与部门管理</p>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <Link
              to="/dashboard"
              className="card p-8 flex flex-col items-center text-center group cursor-pointer hover:border-gold-300"
            >
              <div className="w-14 h-14 rounded-xl bg-gold-50 flex items-center justify-center mb-4 group-hover:bg-gold-100 transition-colors">
                <Monitor className="w-7 h-7 text-gold-600" />
              </div>
              <h3 className="font-display text-lg font-semibold text-hotel-dark mb-2">前台大屏</h3>
              <p className="text-sm text-hotel-muted">实时看板监控</p>
            </Link>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="text-center text-hotel-muted text-xs mt-12"
        >
          璞悦酒店集团 · 在住服务管理系统 v1.0
        </motion.p>
      </div>
    </div>
  )
}
