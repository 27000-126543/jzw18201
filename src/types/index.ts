export type ServiceType = 'dining' | 'amenities' | 'repair' | 'wakeUp' | 'dnd'
export type OrderStatus = 'pending' | 'accepted' | 'inProgress' | 'completed' | 'cancelled'
export type Department = 'housekeeping' | 'fandb' | 'engineering'
export type Priority = 'normal' | 'urgent'

export interface DiningItem {
  id: string
  name: string
  price: number
  quantity: number
}

export interface DiningDetail {
  type: 'dining'
  items: DiningItem[]
  totalAmount: number
  note: string
}

export interface AmenitiesDetail {
  type: 'amenities'
  items: string[]
  note: string
}

export interface RepairDetail {
  type: 'repair'
  issueType: string
  description: string
  imageUrl?: string
  urgency: 'normal' | 'urgent'
}

export interface WakeUpDetail {
  type: 'wakeUp'
  dateTime: string
  repeat: 'once' | 'daily'
  note: string
}

export interface DNDDetail {
  type: 'dnd'
  startTime: string
  endTime: string
  note: string
}

export type OrderDetail = DiningDetail | AmenitiesDetail | RepairDetail | WakeUpDetail | DNDDetail

export interface ServiceOrder {
  id: string
  roomId: string
  guestName: string
  guestId: string
  type: ServiceType
  status: OrderStatus
  department: Department
  priority: Priority
  details: OrderDetail
  createdAt: string
  acceptedAt?: string
  completedAt?: string
  handler?: string
  rating?: number
  feedback?: string
}

export interface StayRecord {
  id: string
  guestId: string
  roomNumber: string
  checkIn: string
  checkOut: string
  serviceOrders: string[]
  avgRating: number
}

export interface GuestProfile {
  id: string
  name: string
  phone: string
  preferences: string[]
  stayHistory: StayRecord[]
}

export interface DepartmentInfo {
  id: Department
  name: string
  orderTypes: ServiceType[]
}

export interface MenuCategory {
  id: string
  name: string
  items: MenuItem[]
}

export interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  image: string
  tags?: string[]
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  dining: '叫餐服务',
  amenities: '补充备品',
  repair: '报修服务',
  wakeUp: '叫醒服务',
  dnd: '免打扰',
}

export const DEPARTMENT_LABELS: Record<Department, string> = {
  housekeeping: '客房部',
  fandb: '餐饮部',
  engineering: '工程部',
}

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: '待处理',
  accepted: '已接单',
  inProgress: '处理中',
  completed: '已完成',
  cancelled: '已取消',
}

export const SERVICE_DEPARTMENT_MAP: Record<ServiceType, Department> = {
  dining: 'fandb',
  amenities: 'housekeeping',
  repair: 'engineering',
  wakeUp: 'housekeeping',
  dnd: 'housekeeping',
}
