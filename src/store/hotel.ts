import { create } from 'zustand'
import type { ServiceOrder, GuestProfile, OrderStatus, ServiceType, Department } from '@/types'
import { initialOrders, initialGuests, roomGuestMap } from '@/data/mock'

interface HotelStore {
  orders: ServiceOrder[]
  guests: GuestProfile[]
  activeFilter: {
    status: OrderStatus | 'all'
    department: Department | 'all'
    type: ServiceType | 'all'
  }
  badReviewAlert: { orderId: string; message: string } | null

  setFilter: (filter: Partial<HotelStore['activeFilter']>) => void
  addOrder: (order: ServiceOrder) => void
  updateOrderStatus: (orderId: string, status: OrderStatus, handler?: string) => void
  submitReview: (orderId: string, rating: number, feedback: string) => void
  dismissBadReview: () => void
  getOrdersByRoom: (roomId: string) => ServiceOrder[]
  getOrdersByDepartment: (dept: Department) => ServiceOrder[]
  getFilteredOrders: () => ServiceOrder[]
  getGuestById: (guestId: string) => GuestProfile | undefined
  getGuestByRoom: (roomId: string) => GuestProfile | undefined
  getDepartmentStats: () => { department: Department; name: string; pending: number; inProgress: number; completed: number; avgResponseMin: number }[]
  getPendingCount: () => number
  getAvgResponseMin: () => number
  getTodayOrderCount: () => number
}

export const useHotelStore = create<HotelStore>((set, get) => ({
  orders: initialOrders,
  guests: initialGuests,
  activeFilter: { status: 'all', department: 'all', type: 'all' },
  badReviewAlert: null,

  setFilter: (filter) =>
    set((state) => ({
      activeFilter: { ...state.activeFilter, ...filter },
    })),

  addOrder: (order) =>
    set((state) => ({
      orders: [order, ...state.orders],
    })),

  updateOrderStatus: (orderId, status, handler) =>
    set((state) => ({
      orders: state.orders.map((o) => {
        if (o.id !== orderId) return o
        const updated = { ...o, status }
        if (status === 'accepted') updated.acceptedAt = new Date().toISOString()
        if (status === 'completed') updated.completedAt = new Date().toISOString()
        if (handler) updated.handler = handler
        return updated
      }),
    })),

  submitReview: (orderId, rating, feedback) =>
    set((state) => {
      const order = state.orders.find((o) => o.id === orderId)
      const updatedOrders = state.orders.map((o) =>
        o.id === orderId ? { ...o, rating, feedback } : o
      )
      const badReview = order && rating < 4
        ? { orderId, message: `${order.roomId}房 ${order.guestName} 给出了${rating}星评价: ${feedback}` }
        : null
      return { orders: updatedOrders, badReviewAlert: badReview }
    }),

  dismissBadReview: () => set({ badReviewAlert: null }),

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
      }
    })
  },

  getPendingCount: () => get().orders.filter((o) => o.status === 'pending').length,

  getAvgResponseMin: () => {
    const completed = get().orders.filter((o) => o.status === 'completed' && o.acceptedAt && o.completedAt)
    if (completed.length === 0) return 0
    const avg = completed.reduce((sum, o) => {
      const created = new Date(o.createdAt).getTime()
      const completed = new Date(o.completedAt!).getTime()
      return sum + (completed - created) / 60000
    }, 0) / completed.length
    return Math.round(avg)
  },

  getTodayOrderCount: () => get().orders.length,
}))
