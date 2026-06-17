import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Bell,
  AlertTriangle,
  MessageSquareWarning,
  CheckCircle2,
  Clock,
  User,
  ExternalLink,
  Building2,
  FileText,
  Filter,
  X,
  ArrowLeft,
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
                  责任人: {todo.assignedManager}
                </span>
                {todo.orderId && todo.handlerName && (
                  <span className="inline-flex items-center gap-1 text-blue-700">
                    <Building2 size={12} />
                    处理人: {todo.handlerName}
                  </span>
                )}
                {todo.department && (
                  <span className="inline-flex items-center gap-1 text-purple-700">
                    <Building2 size={12} />
                    责任部门: {DEPARTMENT_LABELS[todo.department]}
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
                    来源线索: {todo.sourceDetail}
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
  const location = useLocation()
  const navigate = useNavigate()
  const todos = useHotelStore((s) => s.todos)
  const getFilteredTodos = useHotelStore((s) => s.getFilteredTodos)

  const [filterGuest, setFilterGuest] = useState<string>('all')
  const [filterRoom, setFilterRoom] = useState<string>('all')
  const [filterType, setFilterType] = useState<TodoType | 'all'>('all')
  const [filterStatus, setFilterStatus] = useState<TodoStatus | 'all'>('all')
  const [filterStayId, setFilterStayId] = useState<string | null>(null)
  const [urlSource, setUrlSource] = useState<string | null>(null)
  const [showHintBanner, setShowHintBanner] = useState(false)
  const [isUrlApplied, setIsUrlApplied] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const guestId = params.get('guestId')
    const roomId = params.get('roomId')
    const stayId = params.get('stayId')
    const source = params.get('source')

    let hasFilters = false
    if (guestId) {
      setFilterGuest(guestId)
      hasFilters = true
    }
    if (roomId) {
      setFilterRoom(roomId)
      hasFilters = true
    }
    if (stayId) {
      setFilterStayId(stayId)
      hasFilters = true
    }
    if (source) {
      setUrlSource(source)
      setShowHintBanner(true)
    }
    setIsUrlApplied(true)
  }, [location.search])

  const syncUrl = (guest: string, room: string, stay: string | null, type: string, status: string) => {
    const params = new URLSearchParams()
    if (guest !== 'all') params.set('guestId', guest)
    if (room !== 'all') params.set('roomId', room)
    if (stay) params.set('stayId', stay)
    if (type !== 'all') params.set('type', type)
    if (status !== 'all') params.set('status', status)
    if (urlSource) params.set('source', urlSource)
    const queryString = params.toString()
    navigate(queryString ? `?${queryString}` : window.location.pathname, { replace: true })
  }

  const handleFilterChange = (type: 'guest' | 'room' | 'type' | 'status', value: string) => {
    let newGuest = filterGuest
    let newRoom = filterRoom
    let newType = filterType
    let newStatus = filterStatus

    if (type === 'guest') {
      newGuest = value
      setFilterGuest(value)
    } else if (type === 'room') {
      newRoom = value
      setFilterRoom(value)
    } else if (type === 'type') {
      newType = value as TodoType | 'all'
      setFilterType(value as TodoType | 'all')
    } else if (type === 'status') {
      newStatus = value as TodoStatus | 'all'
      setFilterStatus(value as TodoStatus | 'all')
    }

    syncUrl(newGuest, newRoom, filterStayId, newType, newStatus)
  }

  const handleClearStayFilter = () => {
    setFilterStayId(null)
    syncUrl(filterGuest, filterRoom, null, filterType, filterStatus)
  }

  const handleClearFilters = () => {
    setFilterGuest('all')
    setFilterRoom('all')
    setFilterType('all')
    setFilterStatus('all')
    setFilterStayId(null)
    setShowHintBanner(false)
    navigate(window.location.pathname, { replace: true })
  }

  const uniqueGuests = useMemo(() => {
    const map = new Map<string, string>()
    todos.forEach((t) => {
      if (t.guestId && t.guestName && !map.has(t.guestId)) {
        map.set(t.guestId, t.guestName)
      }
    })
    return Array.from(map.entries())
  }, [todos])

  const uniqueRooms = useMemo(() => {
    const rooms = new Set<string>()
    todos.forEach((t) => {
      if (t.roomId) rooms.add(t.roomId)
    })
    return Array.from(rooms).sort()
  }, [todos])

  const filteredTodos = useMemo(() => {
    if (filterGuest === 'all' && filterRoom === 'all' && filterType === 'all' && filterStatus === 'all' && !filterStayId) {
      return todos
    }
    return getFilteredTodos({
      roomId: filterRoom !== 'all' ? filterRoom : undefined,
      type: filterType,
      status: filterStatus,
    }).filter((t) => {
      if (filterGuest !== 'all' && t.guestId !== filterGuest) return false
      if (filterStayId && t.stayId !== filterStayId) return false
      return true
    })
  }, [todos, filterGuest, filterRoom, filterType, filterStatus, filterStayId, getFilteredTodos])

  const timeoutTodos = filteredTodos.filter((t) => t.type === 'timeout' && t.status !== 'resolved')
  const badReviewTodos = filteredTodos.filter((t) => t.type === 'badReview' && t.status !== 'resolved')
  const urgentTodos = filteredTodos.filter((t) => t.type === 'urgent' && t.status !== 'resolved')
  const openTodos = filteredTodos.filter((t) => t.status !== 'resolved')
  const resolvedTodos = filteredTodos.filter((t) => t.status === 'resolved')

  const hasActiveFilters = filterGuest !== 'all' || filterRoom !== 'all' || filterType !== 'all' || filterStatus !== 'all' || filterStayId !== null

  return (
    <div className="space-y-6">
      {showHintBanner && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 text-blue-700">
            <span>🔍</span>
            <span className="text-sm font-medium">
              已自动筛选：{filterRoom !== 'all' ? `来自${filterRoom}房间的` : ''}入住待办
              {filterStayId && `（入住单: ${filterStayId}）`}
            </span>
          </div>
          <button
            onClick={() => setShowHintBanner(false)}
            className="text-blue-500 hover:text-blue-700 text-sm"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {urlSource === 'guest' && filterGuest !== 'all' && (
            <Link
              to={`/admin/guest/${filterGuest}${filterStayId ? `?expandStay=${filterStayId}` : ''}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium"
            >
              <ArrowLeft size={14} />
              返回客户档案
            </Link>
          )}
          <div>
            <h2 className="text-xl font-bold text-hotel-dark">经理待办中心</h2>
            <p className="text-sm text-hotel-muted mt-1">
              共 <span className="font-semibold text-red-600">{openTodos.length}</span> 条待处理事项
              （超时预警 {timeoutTodos.length} 条，差评跟进 {badReviewTodos.length} 条）
            </p>
          </div>
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

      <div className="card p-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={16} className="text-hotel-muted shrink-0" />
          <select
            value={filterGuest}
            onChange={(e) => handleFilterChange('guest', e.target.value)}
            className="text-sm border border-hotel-border rounded-lg px-3 py-1.5 bg-white text-hotel-dark focus:outline-none focus:ring-2 focus:ring-gold-300"
          >
            <option value="all">全部客人</option>
            {uniqueGuests.map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
          <select
            value={filterRoom}
            onChange={(e) => handleFilterChange('room', e.target.value)}
            className="text-sm border border-hotel-border rounded-lg px-3 py-1.5 bg-white text-hotel-dark focus:outline-none focus:ring-2 focus:ring-gold-300"
          >
            <option value="all">全部房间</option>
            {uniqueRooms.map((room) => (
              <option key={room} value={room}>{room}房</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => handleFilterChange('type', e.target.value)}
            className="text-sm border border-hotel-border rounded-lg px-3 py-1.5 bg-white text-hotel-dark focus:outline-none focus:ring-2 focus:ring-gold-300"
          >
            <option value="all">全部类型</option>
            <option value="timeout">超时预警</option>
            <option value="badReview">差评跟进</option>
            <option value="urgent">紧急事项</option>
          </select>
          <select
            value={filterStatus}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="text-sm border border-hotel-border rounded-lg px-3 py-1.5 bg-white text-hotel-dark focus:outline-none focus:ring-2 focus:ring-gold-300"
          >
            <option value="all">全部状态</option>
            <option value="open">待处理</option>
            <option value="followedUp">已跟进</option>
            <option value="resolved">已解决</option>
          </select>
          {filterStayId && (
            <div className="inline-flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-purple-100 text-purple-700 border border-purple-200 font-medium">
              入住单: {filterStayId}
              <button
                onClick={handleClearStayFilter}
                className="ml-1 hover:text-purple-900"
              >
                <X size={12} />
              </button>
            </div>
          )}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors font-medium"
            >
              <X size={12} />
              清除筛选
            </button>
          )}
          {hasActiveFilters && (
            <span className="text-xs text-hotel-muted">
              筛选结果: {filteredTodos.length} / {todos.length} 条
            </span>
          )}
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
