import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ManagerTodo, OrderLogEntry, OrderStatus, Department, ServiceOrder, ServiceType, PreferenceTag, StayRecord, OverallReview } from '@/types'
import { SERVICE_DEPARTMENT_MAP, TIMEOUT_THRESHOLD, DEFAULT_MANAGER, DEPARTMENT_LABELS } from '@/types'
import { initialOrders, initialGuests, roomGuestMap } from '@/data/mock'
import { generateOrderId } from '@/utils/time'

interface PersistedState {
  orders: ServiceOrder[]
  guests: typeof initialGuests
  todos: ManagerTodo[]
  overallReviews: OverallReview[]
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
  getCurrentStayForGuest: (guestId: string) => { stay: StayRecord; orders: ServiceOrder[] } | null
  getDepartmentStats: () => { department: Department; name: string; pending: number; inProgress: number; completed: number; avgResponseMin: number; timeoutCount: number }[]
  getPendingCount: () => number
  getTimeoutCount: () => number
  getAvgResponseMin: () => number
  getTodayOrderCount: () => number
  getOpenTodos: () => ManagerTodo[]
  getFilteredTodos: (filter: { roomId?: string; type?: ManagerTodo['type'] | 'all'; status?: ManagerTodo['status'] | 'all' }) => ManagerTodo[]
  refreshTimeoutFlags: () => void
  addPreferenceFromOrder: (guestId: string, order: ServiceOrder) => void
  addGuestOrderToStay: (guestId: string, orderId: string) => void
  getReviewsForGuest: (guestId: string) => { stay: StayRecord; type: 'overall' | 'service'; order?: ServiceOrder; rating: number; feedback?: string; subRatings?: Record<string, number>; createdAt: string }[]
  getOverallReviewForStay: (stayId: string) => OverallReview | undefined
  getTodosByRoom: (roomId: string) => ManagerTodo[]
  getTodosByOrder: (orderId: string) => ManagerTodo[]
  getTodosByGuest: (guestId: string) => ManagerTodo[]
  getTodosByStay: (roomId: string, stayId: string) => ManagerTodo[]
  getTodosByStayId: (stayId: string) => ManagerTodo[]
  getTodoStatsByDepartment: () => { department: Department; label: string; open: number; followedUp: number; resolved: number; total: number }[]
  getTodoStatsByManager: () => { manager: string; open: number; followedUp: number; resolved: number; total: number }[]
  getReviewsForStay: (stayId: string) => { overall?: { rating: number; feedback?: string; subRatings?: Record<string, number>; reviewedAt: string }; services: { order: ServiceOrder; rating: number; feedback?: string }[] }
  getInHouseRiskSummary: () => { guests: { guestId: string; guestName: string; rooms: { roomNumber: string; stayId: string; orders: number; pending: number; completed: number; avgRating: number; badReviews: number; openTodos: number }[]; isCurrent: boolean }[]; totalPending: number; totalOpenTodos: number; totalBadReviews: number }
  getGuestBreakdownByDept: (department: Department) => { guestId: string; guestName: string; roomNumber: string; stayId: string; orders: ServiceOrder[]; todos: ManagerTodo[]; riskLevel: 'high' | 'medium' | 'low' }[]
  getGuestBreakdownByManager: (manager: string) => { guestId: string; guestName: string; roomNumber: string; stayId: string; orders: ServiceOrder[]; todos: ManagerTodo[]; riskLevel: 'high' | 'medium' | 'low' }[]
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

function buildTodo(partial: Omit<ManagerTodo, 'id' | 'createdAt' | 'status' | 'assignedManager'> & { status?: ManagerTodo['status']; assignedManager?: string }): ManagerTodo {
  return {
    id: `TODO-${Date.now()}-${Math.floor(Math.random() * 9000) + 1000}`,
    createdAt: new Date().toISOString(),
    status: 'open',
    assignedManager: DEFAULT_MANAGER,
    ...partial,
  }
}

function findStayIdForOrderId(guests: typeof initialGuests, orderId: string): string | undefined {
  for (const g of guests) {
    for (const s of g.stayHistory) {
      if (s.serviceOrders.includes(orderId)) return s.id
    }
  }
  return undefined
}

function findStayIdForRoom(guests: typeof initialGuests, roomId: string): string | undefined {
  for (const g of guests) {
    const s = g.stayHistory.find((st) => st.isCurrent && st.roomNumber === roomId)
    if (s) return s.id
  }
  return undefined
}

export const useHotelStore = create<HotelStore>()(
  persist(
    (set, get) => ({
      orders: initialOrders,
      guests: initialGuests,
      overallReviews: [],
      todos: [
        buildTodo({
          type: 'timeout',
          title: 'ORD-001 叫餐请求超时未处理',
          description: '801房 张明远 的皮蛋瘦肉粥+拿铁等待12分钟仍未接单',
          roomId: '801',
          guestId: 'G001',
          guestName: '张明远',
          orderId: 'ORD-001',
          stayId: 'S001',
          handlerName: undefined,
          department: 'fandb',
          sourceDetail: '餐饮部未及时接单',
        }),
        buildTodo({
          type: 'timeout',
          title: 'ORD-002 紧急报修超时',
          description: '803房 李雪琴 的空调故障等待30分钟，需关注处理进度',
          roomId: '803',
          guestId: 'G002',
          guestName: '李雪琴',
          orderId: 'ORD-002',
          stayId: 'S003',
          handlerName: '陈师傅',
          department: 'engineering',
          sourceDetail: '工程部处理缓慢（紧急工单）',
        }),
        buildTodo({
          type: 'badReview',
          title: 'ORD-011 3星差评需跟进',
          description: '805房 王建国 对扬州炒饭给出3星评价：炒饭偏咸了',
          roomId: '805',
          guestId: 'G003',
          guestName: '王建国',
          orderId: 'ORD-011',
          stayId: 'S005',
          relatedRating: 3,
          handlerName: '小李',
          department: 'fandb',
          sourceDetail: '餐饮部-小李：扬州炒饭偏咸',
        }),
      ],
      seedVersion: 1,
      activeFilter: { status: 'all', department: 'all', type: 'all' },
      selectedHandler: null,

      setFilter: (filter) =>
        set((state) => ({ activeFilter: { ...state.activeFilter, ...filter } })),

      resetStore: () => {
        set({ orders: initialOrders, guests: initialGuests, overallReviews: [], seedVersion: Date.now() })
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
          const order = state.orders.find((o) => o.id === orderId)
          const updatedOrders = state.orders.map((o) =>
            o.id === orderId ? { ...o, rating, feedback, reviewType: 'service' as const } : o
          )
          let newTodos = state.todos
          if (rating < 4 && order) {
            const stayId = findStayIdForOrderId(state.guests, order.id)
            newTodos = [
              buildTodo({
                type: 'badReview',
                title: `${order.id} ${rating}星差评需跟进`,
                description: `${order.roomId}房 ${order.guestName} 给出${rating}星评价：${feedback || '无文字反馈'}`,
                roomId: order.roomId,
                guestId: order.guestId,
                guestName: order.guestName,
                orderId: order.id,
                stayId,
                relatedRating: rating,
                handlerName: order.handler,
                department: order.department,
                sourceDetail: order.handler
                  ? `${DEPARTMENT_LABELS[order.department]}-${order.handler}：${feedback || '服务不满意'}`
                  : `${DEPARTMENT_LABELS[order.department]}：${feedback || '服务不满意'}`,
              }),
              ...state.todos,
            ]
          }
          return { orders: updatedOrders, todos: newTodos }
        })
      },

      submitOverallReview: (roomId, rating, feedback, subRatings) => {
        set((state) => {
          const now = new Date().toISOString()
          let targetGuest: typeof state.guests[number] | undefined
          let targetStay: StayRecord | undefined
          for (const g of state.guests) {
            const s = g.stayHistory.find((st) => st.isCurrent && st.roomNumber === roomId)
            if (s) {
              targetGuest = g
              targetStay = s
              break
            }
          }
          if (!targetGuest || !targetStay) return {}

          const review: OverallReview = {
            id: `REV-${Date.now()}`,
            stayId: targetStay.id,
            guestId: targetGuest.id,
            roomNumber: roomId,
            rating,
            feedback,
            subRatings,
            createdAt: now,
          }
          const newReviews = [review, ...state.overallReviews]

          const targetStayId = targetStay.id
          const updatedGuests = state.guests.map((g) => {
            if (g.id !== targetGuest!.id) return g
            return {
              ...g,
              stayHistory: g.stayHistory.map((s) =>
                s.id === targetStayId
                  ? {
                      ...s,
                      overallRating: rating,
                      overallFeedback: feedback,
                      overallSubRatings: subRatings,
                      overallReviewedAt: now,
                      reviewSource: 'guest',
                    }
                  : s
              ),
            }
          })

          let newTodos = state.todos
          if (rating < 4) {
            newTodos = [
              buildTodo({
                type: 'badReview',
                title: `${roomId}房 整体入住${rating}星差评`,
                description: `${targetGuest.name} 对${roomId}房入住给出${rating}星：${feedback || '无文字反馈'}`,
                roomId,
                guestId: targetGuest.id,
                guestName: targetGuest.name,
                stayId: targetStay.id,
                relatedRating: rating,
                sourceDetail: `整体入住评价(${rating}星)：${feedback || '客人不满意'}`,
              }),
              ...state.todos,
            ]
          }
          return { overallReviews: newReviews, guests: updatedGuests, todos: newTodos }
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

      getFilteredTodos: (filter) => {
        const { todos } = get()
        return todos.filter((t) => {
          if (filter.roomId && t.roomId !== filter.roomId) return false
          if (filter.type && filter.type !== 'all' && t.type !== filter.type) return false
          if (filter.status && filter.status !== 'all' && t.status !== filter.status) return false
          return true
        })
      },

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
                const stayId = findStayIdForOrderId(state.guests, o.id)
                newTodos = [
                  buildTodo({
                    type: 'timeout',
                    title: `${o.id} ${o.priority === 'urgent' ? '紧急' : ''}工单超时未处理`,
                    description: `${o.roomId}房 ${o.guestName} 的请求等待${Math.round(minutesElapsed)}分钟`,
                    roomId: o.roomId,
                    guestId: o.guestId,
                    guestName: o.guestName,
                    orderId: o.id,
                    stayId,
                    handlerName: o.handler,
                    department: o.department,
                    sourceDetail: `${DEPARTMENT_LABELS[o.department]}${o.handler ? `-${o.handler}` : ''}：${o.priority === 'urgent' ? '紧急' : ''}工单未及时响应`,
                  }),
                  ...newTodos,
                ]
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

      getReviewsForGuest: (guestId) => {
        const { orders, guests } = get()
        const guest = guests.find((g) => g.id === guestId)
        if (!guest) return []
        const result: { stay: StayRecord; type: 'overall' | 'service'; order?: ServiceOrder; rating: number; feedback?: string; subRatings?: Record<string, number>; createdAt: string }[] = []
        guest.stayHistory.forEach((stay) => {
          if (stay.overallRating != null && stay.overallReviewedAt) {
            result.push({
              stay,
              type: 'overall',
              rating: stay.overallRating,
              feedback: stay.overallFeedback,
              subRatings: stay.overallSubRatings,
              createdAt: stay.overallReviewedAt,
            })
          }
          stay.serviceOrders.forEach((oid) => {
            const order = orders.find((o) => o.id === oid)
            if (order && order.rating != null && order.reviewType === 'service') {
              result.push({
                stay,
                type: 'service',
                order,
                rating: order.rating,
                feedback: order.feedback,
                createdAt: order.completedAt || order.createdAt,
              })
            }
          })
        })
        return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      },

      getOverallReviewForStay: (stayId) => get().overallReviews.find((r) => r.stayId === stayId),

      getTodosByRoom: (roomId) => get().todos.filter((t) => t.roomId === roomId),

      getTodosByOrder: (orderId) => get().todos.filter((t) => t.orderId === orderId),

      getTodosByGuest: (guestId) => get().todos.filter((t) => t.guestId === guestId),

      getTodosByStay: (_roomId, stayId) => get().todos.filter((t) => t.stayId === stayId),

      getTodosByStayId: (stayId) => get().todos.filter((t) => t.stayId === stayId),

      getTodoStatsByDepartment: () => {
        const { todos } = get()
        const deptList: Department[] = ['housekeeping', 'fandb', 'engineering']
        return deptList.map((dept) => {
          const deptTodos = todos.filter((t) => t.department === dept)
          return {
            department: dept,
            label: DEPARTMENT_LABELS[dept],
            open: deptTodos.filter((t) => t.status === 'open').length,
            followedUp: deptTodos.filter((t) => t.status === 'followedUp').length,
            resolved: deptTodos.filter((t) => t.status === 'resolved').length,
            total: deptTodos.length,
          }
        })
      },

      getTodoStatsByManager: () => {
        const { todos } = get()
        const map = new Map<string, { manager: string; open: number; followedUp: number; resolved: number; total: number }>()
        todos.forEach((t) => {
          const key = t.assignedManager
          if (!map.has(key)) {
            map.set(key, { manager: key, open: 0, followedUp: 0, resolved: 0, total: 0 })
          }
          const entry = map.get(key)!
          entry.total++
          if (t.status === 'open') entry.open++
          else if (t.status === 'followedUp') entry.followedUp++
          else if (t.status === 'resolved') entry.resolved++
        })
        return Array.from(map.values())
      },

      getReviewsForStay: (stayId) => {
        const { orders, guests, overallReviews } = get()
        const guest = guests.find((g) => g.stayHistory.some((s) => s.id === stayId))
        const stay = guest?.stayHistory.find((s) => s.id === stayId)
        if (!stay) return { services: [] }

        const overallReview = overallReviews.find((r) => r.stayId === stayId)
        const overall = stay.overallRating != null
          ? { rating: stay.overallRating, feedback: stay.overallFeedback, subRatings: stay.overallSubRatings, reviewedAt: stay.overallReviewedAt! }
          : overallReview
            ? { rating: overallReview.rating, feedback: overallReview.feedback, subRatings: overallReview.subRatings, reviewedAt: overallReview.createdAt }
            : undefined

        const services: { order: ServiceOrder; rating: number; feedback?: string }[] = []
        stay.serviceOrders.forEach((oid) => {
          const order = orders.find((o) => o.id === oid)
          if (order && order.rating != null && order.reviewType === 'service') {
            services.push({ order, rating: order.rating, feedback: order.feedback })
          }
        })

        return { overall, services }
      },

      getInHouseRiskSummary: () => {
        const { orders, guests, todos } = get()
        const resultGuests: { guestId: string; guestName: string; rooms: { roomNumber: string; stayId: string; orders: number; pending: number; completed: number; avgRating: number; badReviews: number; openTodos: number }[]; isCurrent: boolean }[] = []
        let totalPending = 0
        let totalOpenTodos = 0
        let totalBadReviews = 0

        guests.forEach((g) => {
          const currentStays = g.stayHistory.filter((s) => s.isCurrent)
          if (currentStays.length === 0) return
          const rooms = currentStays.map((stay) => {
            const roomOrders = orders.filter((o) => stay.serviceOrders.includes(o.id))
            const roomTodos = todos.filter((t) => t.stayId === stay.id)
            const ratedOrders = roomOrders.filter((o) => o.rating != null && o.reviewType === 'service')
            const badReviews = ratedOrders.filter((o) => (o.rating || 0) < 4).length
            const avgRating = ratedOrders.length > 0
              ? ratedOrders.reduce((s, o) => s + (o.rating || 0), 0) / ratedOrders.length
              : stay.overallRating ?? 0
            const roomPending = roomOrders.filter((o) => o.status === 'pending' || o.status === 'accepted' || o.status === 'inProgress').length
            totalPending += roomPending
            totalBadReviews += badReviews
            const openTodos = roomTodos.filter((t) => t.status === 'open').length
            totalOpenTodos += openTodos
            return {
              roomNumber: stay.roomNumber,
              stayId: stay.id,
              orders: roomOrders.length,
              pending: roomPending,
              completed: roomOrders.filter((o) => o.status === 'completed').length,
              avgRating: Math.round(avgRating * 10) / 10,
              badReviews,
              openTodos,
            }
          })
          resultGuests.push({ guestId: g.id, guestName: g.name, rooms, isCurrent: true })
        })

        return { guests: resultGuests, totalPending, totalOpenTodos, totalBadReviews }
      },

      getGuestBreakdownByDept: (department) => {
        const { orders, guests, todos } = get()
        const deptTodos = todos.filter((t) => t.department === department)
        const stayIds = new Set(deptTodos.map((t) => t.stayId).filter(Boolean))
        const result: { guestId: string; guestName: string; roomNumber: string; stayId: string; orders: ServiceOrder[]; todos: ManagerTodo[]; riskLevel: 'high' | 'medium' | 'low' }[] = []

        guests.forEach((g) => {
          g.stayHistory.forEach((stay) => {
            if (!stay.isCurrent) return
            if (stayIds.size > 0 && !stayIds.has(stay.id)) {
              const hasDirectDeptTodo = deptTodos.some((t) => t.roomId === stay.roomNumber && t.guestId === g.id)
              if (!hasDirectDeptTodo) return
            }
            const stayOrders = orders.filter((o) => o.department === department && stay.serviceOrders.includes(o.id))
            const stayTodos = todos.filter((t) => ((t.stayId === stay.id || (t.roomId === stay.roomNumber && t.guestId === g.id)) && t.department === department))
            if (stayOrders.length === 0 && stayTodos.length === 0 && stayIds.size > 0) return
            const openTodos = stayTodos.filter((t) => t.status === 'open').length
            const badReviews = stayOrders.filter((o) => (o.rating ?? 5) < 4).length
            let riskLevel: 'high' | 'medium' | 'low' = 'low'
            if (openTodos >= 2 || badReviews >= 1) riskLevel = 'high'
            else if (openTodos === 1 || badReviews === 0) riskLevel = 'medium'
            if (stayOrders.length === 0 && stayTodos.length === 0) return
            result.push({
              guestId: g.id,
              guestName: g.name,
              roomNumber: stay.roomNumber,
              stayId: stay.id,
              orders: stayOrders,
              todos: stayTodos,
              riskLevel,
            })
          })
        })
        return result.sort((a, b) => {
          const order = { high: 0, medium: 1, low: 2 }
          return order[a.riskLevel] - order[b.riskLevel]
        })
      },

      getGuestBreakdownByManager: (manager) => {
        const { orders, guests, todos } = get()
        const managerTodos = todos.filter((t) => t.assignedManager === manager)
        const stayIds = new Set(managerTodos.map((t) => t.stayId).filter(Boolean))
        const result: { guestId: string; guestName: string; roomNumber: string; stayId: string; orders: ServiceOrder[]; todos: ManagerTodo[]; riskLevel: 'high' | 'medium' | 'low' }[] = []

        guests.forEach((g) => {
          g.stayHistory.forEach((stay) => {
            if (!stay.isCurrent) return
            const stayTodos = todos.filter((t) => t.assignedManager === manager && (t.stayId === stay.id || (t.roomId === stay.roomNumber && t.guestId === g.id)))
            const stayOrders = orders.filter((o) => stay.serviceOrders.includes(o.id))
            if (stayTodos.length === 0) return
            const openTodos = stayTodos.filter((t) => t.status === 'open').length
            const badReviews = stayOrders.filter((o) => (o.rating ?? 5) < 4).length
            let riskLevel: 'high' | 'medium' | 'low' = 'low'
            if (openTodos >= 2 || badReviews >= 1) riskLevel = 'high'
            else if (openTodos === 1) riskLevel = 'medium'
            result.push({
              guestId: g.id,
              guestName: g.name,
              roomNumber: stay.roomNumber,
              stayId: stay.id,
              orders: stayOrders,
              todos: stayTodos,
              riskLevel,
            })
          })
        })
        return result.sort((a, b) => {
          const order = { high: 0, medium: 1, low: 2 }
          return order[a.riskLevel] - order[b.riskLevel]
        })
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        orders: state.orders,
        guests: state.guests,
        todos: state.todos,
        overallReviews: state.overallReviews,
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
