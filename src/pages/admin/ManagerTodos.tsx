import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  Bell,
  AlertTriangle,
  MessageSquareWarning,
  CheckCircle2,
  Clock,
  User,
  ArrowRightLeft,
  ExternalLink,
  Building2,
  Wrench,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useHotelStore } from '@/store/hotel'
import { timeAgo } from '@/utils/time'
import type { ManagerTodo, TodoStatus, TodoType } from '@/types'
import { DEPARTMENT_LABELS } from '@/types'

const todoTypeConfig: Record<TodoType, { icon: typeof AlertTriangle; label: string; bgClass: string; textClass: string }> = {
  timeout: { icon: AlertTriangle, label: '超时预警', bgClass: 'bg-red-50', textClass: 'text-red-600' },
  badReview: { icon: MessageSquareWarning, label: '差评跟进', bgClass: 'bg-amber-50', textClass: 'text-amber-600' },
  urgent: { icon: Bell, label: '紧急事项', bgClass: 'bg-orange-50', textClass: 'text-orange-600' },
}

const statusConfig: Record<TodoStatus, { label: string; bgClass: string; textClass: string; dotClass: string }> = {
  open: { label: '待处理', bgClass: 'bg-red-100', textClass: 'text-red-700', dotClass: 'bg-red-500' },
  followedUp: { label: '已跟进', bgClass: 'bg-amber-100', textClass: 'text-amber-700', dotClass: 'bg-amber-500' },
  resolved: { label: '已解决', bgClass: 'bg-green-100', textClass: 'text-green-700', dotClass: 'bg-green-500' },
}

function TodoCard({ todo }: { todo: ManagerTodo }) {
  const followUpTodo = useHotelStore((s) => s.followUpTodo)
  const resolveTodo = useHotelStore((s) => s.resolveTodo)
  const typeCfg = todoTypeConfig[todo.type]
  const statusCfg = statusConfig[todo.status]
  const TypeIcon = typeCfg.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card p-5 border-l-4"
      style={{ borderLeftColor: todo.status === 'open' ? '#ef4444' : todo.status === 'followedUp' ? '#f59e0b' : '#22c55e' }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center shrink-0', typeCfg.bgClass)}>
            <TypeIcon size={22} className={typeCfg.textClass} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-hotel-dark">{todo.title}</h3>
              <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', statusCfg.bgClass, statusCfg.textClass)}>
                <span className={cn('w-1.5 h-1.5 rounded-full', statusCfg.dotClass, todo.status === 'open' && 'animate-pulse')} />
                {statusCfg.label}
              </span>
            </div>
            <p className="text-sm text-hotel-muted mb-3">{todo.description}</p>

            <div className="space-y-2 mb-3">
              <div className="flex items-center gap-4 flex-wrap text-xs">
                <span className="inline-flex items-center gap-1 text-gold-700 font-medium">
                  <User size={12} />
                  👤 责任人: {todo.assignedManager}
                </span>
                {todo.orderId && todo.handlerName && (
                  <span className="inline-flex items-center gap-1 text-blue-700">
                    <Wrench size={12} />
                    🛠️ 处理人: {todo.handlerName}
                  </span>
                )}
                {todo.department && (
                  <span className="inline-flex items-center gap-1 text-purple-700">
                    <Building2 size={12} />
                    🏢 责任部门: {DEPARTMENT_LABELS[todo.department]}
                  </span>
                )}
                {todo.roomId && (
                  <span className="inline-flex items-center gap-1 text-hotel-muted">
                    <User size={12} />
                    {todo.roomId}房 {todo.guestName}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-hotel-muted">
                  <Clock size={12} />
                  {timeAgo(todo.createdAt)}
                </span>
                {todo.relatedRating && (
                  <span className="inline-flex items-center gap-1 text-amber-600 font-medium">
                    {'⭐'.repeat(todo.relatedRating)}
                  </span>
                )}
              </div>
              {todo.sourceDetail && (
                <div className="text-xs text-hotel-muted/80 bg-gray-50 rounded-lg px-3 py-2 border border-hotel-border/60">
                  <span className="inline-flex items-center gap-1">
                    <FileText size={11} />
                    📝 来源线索: {todo.sourceDetail}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {todo.guestId && (
                <Link
                  to={`/admin/guest/${todo.guestId}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-gold-50 text-gold-700 hover:bg-gold-100 transition-colors font-medium border border-gold-200"
                >
                  <User size={12} />
                  查看客户档案
                  <ExternalLink size={10} />
                </Link>
              )}
              {todo.orderId && (
                <Link
                  to={`/admin/order/${todo.orderId}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-medium border border-blue-200"
                >
                  <FileText size={12} />
                  查看工单
                  <ExternalLink size={10} />
                </Link>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {todo.status === 'open' && (
            <button
              onClick={() => followUpTodo(todo.id, todo.assignedManager || '当班经理')}
              className="px-3 py-1.5 text-sm rounded-lg bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors font-medium"
            >
              标记已跟进
            </button>
          )}
          {todo.status !== 'resolved' && (
            <button
              onClick={() => resolveTodo(todo.id)}
              className="px-3 py-1.5 text-sm rounded-lg bg-green-50 text-green-700 hover:bg-green-100 transition-colors font-medium inline-flex items-center gap-1"
            >
              <CheckCircle2 size={14} />
              标记已解决
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function ManagerTodos() {
  const todos = useHotelStore((s) => s.todos)
  const getOpenTodos = useHotelStore((s) => s.getOpenTodos)

  const openTodos = getOpenTodos()
  const timeoutTodos = openTodos.filter((t) => t.type === 'timeout')
  const badReviewTodos = openTodos.filter((t) => t.type === 'badReview')
  const urgentTodos = openTodos.filter((t) => t.type === 'urgent')
  const resolvedTodos = todos.filter((t) => t.status === 'resolved')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-hotel-dark">经理待办中心</h2>
          <p className="text-sm text-hotel-muted mt-1">
            共 <span className="font-semibold text-red-600">{openTodos.length}</span> 条待处理事项
            （超时预警 {timeoutTodos.length} 条，差评跟进 {badReviewTodos.length} 条）
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-red-50 border border-red-100">
            <div className="text-xs text-red-500">超时预警</div>
            <div className="text-2xl font-bold text-red-600">{timeoutTodos.length}</div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-100">
            <div className="text-xs text-amber-600">差评跟进</div>
            <div className="text-2xl font-bold text-amber-700">{badReviewTodos.length}</div>
          </div>
          <div className="px-4 py-2 rounded-xl bg-green-50 border border-green-100">
            <div className="text-xs text-green-600">已解决</div>
            <div className="text-2xl font-bold text-green-700">{resolvedTodos.length}</div>
          </div>
        </div>
      </div>

      {timeoutTodos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={18} className="text-red-500" />
            <h3 className="font-semibold text-red-600">超时预警 ({timeoutTodos.length})</h3>
          </div>
          <div className="space-y-3">
            {timeoutTodos.map((todo) => (
              <TodoCard key={todo.id} todo={todo} />
            ))}
          </div>
        </div>
      )}

      {urgentTodos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Bell size={18} className="text-orange-500" />
            <h3 className="font-semibold text-orange-600">紧急事项 ({urgentTodos.length})</h3>
          </div>
          <div className="space-y-3">
            {urgentTodos.map((todo) => (
              <TodoCard key={todo.id} todo={todo} />
            ))}
          </div>
        </div>
      )}

      {badReviewTodos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquareWarning size={18} className="text-amber-500" />
            <h3 className="font-semibold text-amber-600">差评跟进 ({badReviewTodos.length})</h3>
          </div>
          <div className="space-y-3">
            {badReviewTodos.map((todo) => (
              <TodoCard key={todo.id} todo={todo} />
            ))}
          </div>
        </div>
      )}

      {resolvedTodos.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 size={18} className="text-green-500" />
            <h3 className="font-semibold text-green-600">已解决 ({resolvedTodos.length})</h3>
          </div>
          <div className="space-y-3 opacity-75">
            {resolvedTodos.slice(0, 5).map((todo) => (
              <TodoCard key={todo.id} todo={todo} />
            ))}
          </div>
        </div>
      )}

      {openTodos.length === 0 && resolvedTodos.length === 0 && (
        <div className="card p-12 text-center">
          <Bell size={48} className="mx-auto text-gray-300 mb-4" />
          <div className="text-lg font-medium text-hotel-muted">暂无待办事项</div>
          <div className="text-sm text-hotel-muted mt-1">所有事项都已处理完毕，做得好！</div>
        </div>
      )}
    </div>
  )
}
