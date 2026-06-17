export type ServiceType = 'dining' | 'amenities' | 'repair' | 'wakeUp' | 'dnd'
export type OrderStatus = 'pending' | 'accepted' | 'inProgress' | 'completed' | 'cancelled'
export type Department = 'housekeeping' | 'fandb' | 'engineering'
export type Priority = 'normal' | 'urgent'
export type TodoType = 'timeout' | 'badReview' | 'urgent'
export type TodoStatus = 'open' | 'followedUp' | 'resolved'

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

export interface OrderLogEntry {
  id: string
  timestamp: string
  fromStatus: OrderStatus | null
  toStatus: OrderStatus
  operator: string
  note?: string
  handlerAssigned?: string
}

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
  logs: OrderLogEntry[]
  rating?: number
  feedback?: string
  reviewType?: 'service' | 'overall'
  timeoutMinutes?: number
  isTimeout?: boolean
}

export interface StayRecord {
  id: string
  guestId: string
  roomNumber: string
  checkIn: string
  checkOut: string
  serviceOrders: string[]
  avgRating: number
  isCurrent?: boolean
}

export interface GuestProfile {
  id: string
  name: string
  phone: string
  preferences: PreferenceTag[]
  stayHistory: StayRecord[]
}

export interface PreferenceTag {
  id: string
  label: string
  source: 'manual' | 'auto'
  category: 'dining' | 'amenities' | 'sleep' | 'other'
  count: number
  lastUsed?: string
}

export interface ManagerTodo {
  id: string
  type: TodoType
  title: string
  description: string
  roomId?: string
  guestName?: string
  orderId?: string
  status: TodoStatus
  createdAt: string
  followedAt?: string
  resolvedAt?: string
  assignedManager?: string
  relatedRating?: number
}

export interface DepartmentInfo {
  id: Department
  name: string
  orderTypes: ServiceType[]
  handlers: string[]
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

export const CATEGORY_LABELS: Record<PreferenceTag['category'], string> = {
  dining: '餐饮偏好',
  amenities: '备品偏好',
  sleep: '作息偏好',
  other: '其他偏好',
}

export const TIMEOUT_THRESHOLD = 15
