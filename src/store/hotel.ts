import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ManagerTodo, OrderLogEntry, OrderStatus, Department, ServiceOrder, ServiceType, PreferenceTag } from '@/types'
import { SERVICE_DEPARTMENT_MAP, TIMEOUT_THRESHOLD } from '@/types'
import { initialOrders, initialGuests, roomGuestMap } from '@/data/mock'
import { generateOrderId } from '@/utils/time'

interface PersistedState {
  orders: ServiceOrder[]
  guests: typeof initialGuests
  todos: ManagerTodo[]
  seedVersion: number
}

interface HotelStore extends PersistedState {
  activeFilter: {
    status: OrderStatus | 'all'
    department: Department | 'all'
    type: ServiceType | 'all'
  }
  selectedHandler: string | null

  setFilter: (filter: Partial<HotelStore['activeFilter']>) => void
  resetStore: () => void
  addOrder: (order: Omit<ServiceOrder, 'id' | 'logs' | 'department' | 'status' | 'priority' | 'createdAt' | 'department'> & { department?: Department }) => ServiceOrder
  transitionOrder: (orderId: string, toStatus: OrderStatus, operator: string, handlerAssigned?: string, note?: string) => void
  assignHandler: (orderId: string, handler: string, operator: string, note?: string) => void
  submitServiceReview: (orderId: string, rating: number, feedback: string) => void
  submitOverallReview: (roomId: string, rating: number, feedback: string, subRatings?: Record<string, number>) => void
  followUpTodo: (todoId: string, manager: string) => void
  resolveTodo: (todoId: string) => void
  getOrdersByRoom: (roomId: string) => ServiceOrder[]
  getOrdersByDepartment: (dept: Department) => ServiceOrder[]
  getFilteredOrders: () => ServiceOrder[]
  getGuestById: (guestId: string) => typeof initialGuests[number] | undefined
  getGuestByRoom: (roomId: string) => typeof initialGuests[number] | undefined
  getCurrentStayForGuest: (guestId: string) => { stay: typeof initialGuests[number]['stayHistory'][number]; orders: ServiceOrder[] } | null
  getDepartmentStats: () => { department: Department; name: string; pending: number; inProgress: number; completed: number; avgResponseMin: number; timeoutCount: number }[]
  getPendingCount: () => number
  getTimeoutCount: () => number
  getAvgResponseMin: () => number
  getTodayOrderCount: () => number
  getOpenTodos: () => ManagerTodo[]
  refreshTimeoutFlags: () => void
  addPreferenceFromOrder: (guestId: string, order: ServiceOrder) => void
  addGuestOrderToStay: (guestId: string, orderId: string) => void
}

function buildPreferenceFromOrder(order: ServiceOrder): Omit<PreferenceTag, 'id'>[] {
  const tags: Omit<PreferenceTag, 'id'>[] = []
  const now = new Date().toISOString()

  if (order.type === 'dining' && order.details.type === 'dining') {
    const items = order.details.items
    const breakfastItems = items.filter((i) => /粥|小笼|油条|豆浆|煎蛋|白粥|早餐|吐司|牛角|酸奶|麦片|培根|美式/.test(i.name))
    if (breakfastItems.length > 0) {
      tags.push({ label: `偏好${breakfastItems.some((i) => /美式|吐司|牛角|酸奶|培根/.test(i.name)) ? '西式' : '中式'}早餐`, source: 'auto', category: 'dining', count: 1, lastUsed: now })
    }
    items.forEach((i) => {
      if (/咖啡/.test(i.name)) tags.push({ label: '喜欢咖啡', source: 'auto', category: 'dining', count: 1, lastUsed: now })
      if (/茶|铁观音|龙井|普洱/.test(i.name)) tags.push({ label: '爱喝茶', source: 'auto', category: 'dining', count: 1, lastUsed: now })
      if (/牛肉面/.test(i.name)) tags.push({ label: '常点牛肉面', source: 'auto', category: 'dining', count: 1, lastUsed: now })
      if (/炒饭/.test(i.name)) tags.push({ label: '偏好扬州炒饭', source: 'auto', category: 'dining', count: 1, lastUsed: now })
      if (/水果/.test(i.name)) tags.push({ label: '喜欢水果', source: 'auto', category: 'dining', count: 1, lastUsed: now })
    })
  }

  if (order.type === 'amenities' && order.details.type === 'amenities') {
    const items = order.details.items
    if (items.some((i) => /浴巾/.test(i))) tags.push({ label: '需多备浴巾', source: 'auto', category: 'amenities', count: 1, lastUsed: now })
    if (items.some((i) => /洗漱|牙刷|浴帽|梳子/.test(i))) tags.push({ label: '注重洗漱备品', source: 'auto', category: 'amenities', count: 1, lastUsed: now })
    if (items.some((i) => /矿泉/.test(i))) tags.push({ label: '常点矿泉水', source: 'auto', category: 'amenities', count: 1, lastUsed: now })
    if (items.some((i) => /茶|咖啡/.test(i))) tags.push({ label: '需备茶饮咖啡', source: 'auto', category: 'amenities', count: 1, lastUsed: now })
    if (items.filter((i) => /浴|面巾|洗漱|拖鞋/.test(i)).length >= 3) tags.push({ label: '偏好双份备品', source: 'auto', category: 'amenities', count: 1, lastUsed: now })
  }

  if (order.type === 'wakeUp' && order.details.type === 'wakeUp') {
    const d = order.details.dateTime
    const hour = d ? parseInt(d.split('T')[1].split(':')[0], 10) : 0
    if (hour <= 7) tags.push({ label: '偏好早晨叫醒', source: 'auto', category: 'sleep', count: 1, lastUsed: now })
    if (order.details.repeat === 'daily' || /飞机|航班/.test(order.details.note)) tags.push({ label: '赶飞机需叫醒', source: 'auto', category: 'sleep', count: 1, lastUsed: now })
  }

  if (order.type === 'dnd' && order.details.type === 'dnd') {
    const s = parseInt(order.details.startTime.split(':')[0], 10)
    const e = parseInt(order.details.endTime.split(':')[0], 10)
    if (s >= 12 && s <= 15 && e <= 18) tags.push({ label: '午休免打扰', source: 'auto', category: 'sleep', count: 1, lastUsed: now })
    if (s >= 21) tags.push({ label: '晚间免打扰', source: 'auto', category: 'sleep', count: 1, lastUsed: now })
  }

  const uniqueMap = new Map<string, Omit<PreferenceTag, 'id'>>()
  tags.forEach((t) => {
    if (uniqueMap.has(t.label)) {
      const existing = uniqueMap.get(t.label)!
      uniqueMap.set(t.label, { ...existing, count: existing.count + t.count })
    } else {
      uniqueMap.set(t.label, t)
    }
  })
  return Array.from(uniqueMap.values())
}

function addLog(order: ServiceOrder, toStatus: OrderStatus, operator: string, handlerAssigned?: string, note?: string): ServiceOrder {
  const lastStatus = order.logs.length > 0 ? order.logs[order.logs.length - 1].toStatus : null
  const log: OrderLogEntry = {
    id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    fromStatus: lastStatus,
    toStatus,
    operator,
    note,
    handlerAssigned,
  }
  return { ...order, logs: [...order.logs, log] }
}

const STORAGE_KEY = 'hotel-service-v2'

export const useHotelStore = create<HotelStore>()(
  persist(
    (set, get) => ({
      orders: initialOrders,
      guests: initialGuests,
      todos: [
        {
          id: 'TODO-001', type: 'timeout', status: 'open',
          title: 'ORD-001 叫餐请求超时未处理',
          description: '801房 张明远 的皮蛋瘦肉粥+拿铁等待12分钟仍未接单',
          roomId: '801', guestName: '张明远', orderId: 'ORD-001',
          createdAt: new Date(Date.now() - 60000).toISOString(),
        },
        {
          id: 'TODO-002', type: 'timeout', status: 'open',
          title: 'ORD-002 紧急报修超时',
          description: '803房 李雪琴 的空调故障等待30分钟，需关注处理进度',
          roomId: '803', guestName: '李雪琴', orderId: 'ORD-002',
          createdAt: new Date(Date.now() - 60000 * 2).toISOString(),
        },
        {
          id: 'TODO-003', type: 'badReview', status: 'open',
          title: 'ORD-011 3星差评需跟进',
          description: '805房 王建国 对扬州炒饭给出3星评价：炒饭偏咸了',
          roomId: '805', guestName: '王建国', orderId: 'ORD-011', relatedRating: 3,
          createdAt: new Date(Date.now() - 60000 * 200).toISOString(),
        },
      ],
      seedVersion: 1,
      activeFilter: { status: 'all', department: 'all', type: 'all' },
      selectedHandler: null,

      setFilter: (filter) =>
        set((state) => ({ activeFilter: { ...state.activeFilter, ...filter } })),

      resetStore: () => {
        set({ orders: initialOrders, guests: initialGuests, seedVersion: Date.now() })
      },

      addOrder: (orderData) => {
        const now = new Date().toISOString()
        const department = orderData.department || SERVICE_DEPARTMENT_MAP[orderData.type]
        const newOrder: ServiceOrder = {
          ...orderData,
          id: generateOrderId(),
          department,
          status: 'pending',
          priority: 'normal',
          createdAt: now,
          logs: [],
        }
        const withLog = addLog(newOrder, 'pending', '系统')
        set((state) => ({ orders: [withLog, ...state.orders] }))
        get().addPreferenceFromOrder(newOrder.guestId, withLog)
        get().addGuestOrderToStay(newOrder.guestId, withLog.id)
        return withLog
      },

      transitionOrder: (orderId, toStatus, operator, handlerAssigned, note) =>
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== orderId) return o
            let updated = addLog(o, toStatus, operator, handlerAssigned, note)
            updated = { ...updated, status: toStatus }
            if (toStatus === 'accepted') updated.acceptedAt = new Date().toISOString()
            if (toStatus === 'completed') updated.completedAt = new Date().toISOString()
            if (handlerAssigned) updated.handler = handlerAssigned
            return updated
          }),
        })),

      assignHandler: (orderId, handler, operator, note) =>
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.id !== orderId) return o
            const updated = addLog(o, o.status, operator, handler, note || `分配处理人: ${handler}`)
            return { ...updated, handler }
          }),
        })),

      submitServiceReview: (orderId, rating, feedback) => {
        set((state) => {
          const updatedOrders = state.orders.map((o) =>
            o.id === orderId ? { ...o, rating, feedback, reviewType: 'service' as const } : o
          )
          const order = state.orders.find((o) => o.id === orderId)
          let newTodos = state.todos
          if (rating < 4 && order) {
            const todo: ManagerTodo = {
              id: `TODO-${Date.now()}`,
              type: 'badReview',
              status: 'open',
              title: `${order.id} ${rating}星差评需跟进`,
              description: `${order.roomId}房 ${order.guestName} 给出${rating}星评价：${feedback || '无文字反馈'}`,
              roomId: order.roomId,
              guestName: order.guestName,
              orderId: order.id,
              relatedRating: rating,
              createdAt: new Date().toISOString(),
            }
            newTodos = [todo, ...state.todos]
          }
          return { orders: updatedOrders, todos: newTodos }
        })
      },

      submitOverallReview: (roomId, rating, feedback, subRatings) => {
        set((state) => {
          const guest = state.guests.find((g) => {
            const cur = g.stayHistory.find((s) => s.isCurrent)
            return cur && cur.roomNumber === roomId
          })
          const roomOrders = state.orders.filter((o) => o.roomId === roomId)
          const updatedOrders = state.orders.map((o) =>
            o.roomId === roomId && !o.rating
              ? { ...o, rating, feedback, reviewType: 'overall' as const }
              : o
          )
          let newTodos = state.todos
          if (rating < 4 && guest) {
            const todo: ManagerTodo = {
              id: `TODO-${Date.now()}`,
              type: 'badReview',
              status: 'open',
              title: `${roomId}房 整体入住${rating}星差评`,
              description: `${guest.name} 对本次入住给出${rating}星：${feedback || '无文字反馈'}`,
              roomId,
              guestName: guest.name,
              relatedRating: rating,
              createdAt: new Date().toISOString(),
            }
            newTodos = [todo, ...state.todos]
          }
          const updatedGuests = guest ? state.guests.map((g) => {
            if (g.id !== guest.id) return g
            return {
              ...g,
              stayHistory: g.stayHistory.map((s) =>
                s.isCurrent ? { ...s, avgRating: rating } : s
              ),
            }
          }) : state.guests
          return { orders: updatedOrders, guests: updatedGuests, todos: newTodos, _used: roomOrders, _subs: subRatings } as any
        })
      },

      followUpTodo: (todoId, manager) =>
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === todoId
              ? { ...t, status: 'followedUp' as const, followedAt: new Date().toISOString(), assignedManager: manager }
              : t
          ),
        })),

      resolveTodo: (todoId) =>
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === todoId
              ? { ...t, status: 'resolved' as const, resolvedAt: new Date().toISOString() }
              : t
          ),
        })),

      getOrdersByRoom: (roomId) => get().orders.filter((o) => o.roomId === roomId),

      getOrdersByDepartment: (dept) => get().orders.filter((o) => o.department === dept),

      getFilteredOrders: () => {
        const { orders, activeFilter } = get()
        return orders.filter((o) => {
          if (activeFilter.status !== 'all' && o.status !== activeFilter.status) return false
          if (activeFilter.department !== 'all' && o.department !== activeFilter.department) return false
          if (activeFilter.type !== 'all' && o.type !== activeFilter.type) return false
          return true
        })
      },

      getGuestById: (guestId) => get().guests.find((g) => g.id === guestId),

      getGuestByRoom: (roomId) => {
        const guestId = roomGuestMap[roomId]
        return get().guests.find((g) => g.id === guestId)
      },

      getCurrentStayForGuest: (guestId) => {
        const guest = get().guests.find((g) => g.id === guestId)
        if (!guest) return null
        const current = guest.stayHistory.find((s) => s.isCurrent)
        if (!current) return null
        const orders = get().orders.filter((o) => current.serviceOrders.includes(o.id))
        return { stay: current, orders }
      },

      getDepartmentStats: () => {
        const { orders } = get()
        const deptList: Department[] = ['housekeeping', 'fandb', 'engineering']
        const deptNames: Record<Department, string> = { housekeeping: '客房部', fandb: '餐饮部', engineering: '工程部' }
        return deptList.map((dept) => {
          const deptOrders = orders.filter((o) => o.department === dept)
          const completedOrders = deptOrders.filter((o) => o.status === 'completed' && o.acceptedAt && o.completedAt)
          const avgResponseMin = completedOrders.length > 0
            ? completedOrders.reduce((sum, o) => {
                const created = new Date(o.createdAt).getTime()
                const completed = new Date(o.completedAt!).getTime()
                return sum + (completed - created) / 60000
              }, 0) / completedOrders.length
            : 0
          return {
            department: dept,
            name: deptNames[dept],
            pending: deptOrders.filter((o) => o.status === 'pending').length,
            inProgress: deptOrders.filter((o) => o.status === 'accepted' || o.status === 'inProgress').length,
            completed: deptOrders.filter((o) => o.status === 'completed').length,
            avgResponseMin: Math.round(avgResponseMin),
            timeoutCount: deptOrders.filter((o) => o.isTimeout).length,
          }
        })
      },

      getPendingCount: () => get().orders.filter((o) => o.status === 'pending').length,

      getTimeoutCount: () => get().orders.filter((o) => o.isTimeout).length,

      getAvgResponseMin: () => {
        const completed = get().orders.filter((o) => o.status === 'completed' && o.acceptedAt && o.completedAt)
        if (completed.length === 0) return 0
        const avg = completed.reduce((sum, o) => {
          const created = new Date(o.createdAt).getTime()
          const completedT = new Date(o.completedAt!).getTime()
          return sum + (completedT - created) / 60000
        }, 0) / completed.length
        return Math.round(avg)
      },

      getTodayOrderCount: () => get().orders.length,

      getOpenTodos: () => get().todos.filter((t) => t.status !== 'resolved'),

      refreshTimeoutFlags: () =>
        set((state) => {
          const now = Date.now()
          let newTodos = state.todos
          const updatedOrders = state.orders.map((o) => {
            if (o.status === 'completed' || o.status === 'cancelled') {
              return { ...o, isTimeout: false, timeoutMinutes: 0 }
            }
            const minutesElapsed = (now - new Date(o.createdAt).getTime()) / 60000
            const isTimeout = minutesElapsed > TIMEOUT_THRESHOLD
            const timeoutMinutes = isTimeout ? Math.round(minutesElapsed) : 0
            if (isTimeout && !o.isTimeout && o.status === 'pending') {
              const existingTodo = state.todos.find((t) => t.orderId === o.id && t.type === 'timeout' && t.status !== 'resolved')
              if (!existingTodo) {
                const todo: ManagerTodo = {
                  id: `TODO-${Date.now()}-${o.id}`,
                  type: 'timeout',
                  status: 'open',
                  title: `${o.id} ${o.priority === 'urgent' ? '紧急' : ''}工单超时未处理`,
                  description: `${o.roomId}房 ${o.guestName} 的请求等待${Math.round(minutesElapsed)}分钟`,
                  roomId: o.roomId,
                  guestName: o.guestName,
                  orderId: o.id,
                  createdAt: new Date().toISOString(),
                }
                newTodos = [todo, ...newTodos]
              }
            }
            return { ...o, isTimeout, timeoutMinutes }
          })
          return { orders: updatedOrders, todos: newTodos }
        }),

      addPreferenceFromOrder: (guestId, order) =>
        set((state) => {
          const guests = state.guests.map((g) => {
            if (g.id !== guestId) return g
            const newPrefs = buildPreferenceFromOrder(order)
            const merged = [...g.preferences]
            newPrefs.forEach((np) => {
              const idx = merged.findIndex((m) => m.label === np.label)
              if (idx >= 0) {
                merged[idx] = {
                  ...merged[idx],
                  count: merged[idx].count + np.count,
                  lastUsed: np.lastUsed || merged[idx].lastUsed,
                }
              } else {
                merged.push({ ...np, id: `PREF-${Date.now()}-${Math.floor(Math.random() * 9999)}` })
              }
            })
            return { ...g, preferences: merged }
          })
          return { guests }
        }),

      addGuestOrderToStay: (guestId, orderId) =>
        set((state) => ({
          guests: state.guests.map((g) => {
            if (g.id !== guestId) return g
            const stayIndex = g.stayHistory.findIndex((s) => s.isCurrent)
            if (stayIndex < 0) return g
            return {
              ...g,
              stayHistory: g.stayHistory.map((s, i) =>
                i === stayIndex && !s.serviceOrders.includes(orderId)
                  ? { ...s, serviceOrders: [...s.serviceOrders, orderId] }
                  : s
              ),
            }
          }),
        })),
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        orders: state.orders,
        guests: state.guests,
        todos: state.todos,
        seedVersion: state.seedVersion,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          setTimeout(() => state.refreshTimeoutFlags(), 300)
        }
      },
    }
  )
)
