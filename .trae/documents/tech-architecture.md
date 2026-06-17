## 1. 架构设计

```mermaid
flowchart TB
    subgraph "前端层"
        "客人服务端(移动端H5)"
        "后台管理端(桌面Web)"
        "前台大屏端(桌面Web)"
    end
    subgraph "服务层"
        "React Router 路由"
        "状态管理(Zustand)"
        "Mock数据服务"
    end
    subgraph "数据层"
        "localStorage 持久化"
        "Mock数据集"
    end
    "前端层" --> "服务层"
    "服务层" --> "数据层"
```

## 2. 技术说明

- **前端**：React@18 + TailwindCSS@3 + Vite
- **初始化工具**：Vite init (react-ts template)
- **后端**：无（纯前端，使用Mock数据模拟）
- **数据库**：无（使用localStorage持久化 + 内存Mock数据）
- **状态管理**：Zustand（轻量级，适合中等复杂度应用）
- **路由**：React Router v6
- **图标**：Lucide React
- **动画**：Framer Motion

## 3. 路由定义

| 路由 | 用途 |
|------|------|
| `/guest/:roomId` | 客人服务页 - 扫码后入口 |
| `/guest/:roomId/order` | 客人在线点餐页 |
| `/guest/:roomId/amenities` | 客人补备品页 |
| `/guest/:roomId/repair` | 客人报修页 |
| `/guest/:roomId/wake-up` | 客人叫醒服务页 |
| `/guest/:roomId/dnd` | 客人免打扰设置页 |
| `/guest/:roomId/requests` | 客人我的请求页 |
| `/guest/:roomId/review` | 客人满意度评价页 |
| `/admin` | 后台工单管理页 - 工单池 |
| `/admin/department/:dept` | 后台部门视图页 |
| `/admin/order/:id` | 后台工单详情页 |
| `/admin/guest/:id` | 客户档案页 |
| `/dashboard` | 前台大屏页 |

## 4. API定义

本项目为纯前端实现，使用Mock数据服务层模拟API，定义以下数据接口：

```typescript
interface ServiceOrder {
  id: string
  roomId: string
  guestName: string
  guestId: string
  type: 'dining' | 'amenities' | 'repair' | 'wakeUp' | 'dnd'
  status: 'pending' | 'accepted' | 'inProgress' | 'completed' | 'cancelled'
  department: 'housekeeping' | 'fandb' | 'engineering'
  priority: 'normal' | 'urgent'
  details: DiningDetail | AmenitiesDetail | RepairDetail | WakeUpDetail | DNDDetail
  createdAt: string
  acceptedAt?: string
  completedAt?: string
  handler?: string
  rating?: number
  feedback?: string
}

interface DiningDetail {
  items: { name: string; price: number; quantity: number }[]
  totalAmount: number
  note: string
}

interface AmenitiesDetail {
  items: string[]
  note: string
}

interface RepairDetail {
  issueType: string
  description: string
  imageUrl?: string
  urgency: 'normal' | 'urgent'
}

interface WakeUpDetail {
  dateTime: string
  repeat: 'once' | 'daily'
  note: string
}

interface DNDDetail {
  startTime: string
  endTime: string
  note: string
}

interface GuestProfile {
  id: string
  name: string
  phone: string
  preferences: string[]
  stayHistory: {
    checkIn: string
    checkOut: string
    roomNumber: string
    serviceOrders: ServiceOrder[]
    avgRating: number
  }[]
}

interface DepartmentStats {
  department: string
  pending: number
  inProgress: number
  completed: number
  avgResponseTime: number
}
```

## 5. 服务器架构图

不适用（纯前端项目）

## 6. 数据模型

### 6.1 数据模型定义

```mermaid
erDiagram
    "GuestProfile" ||--o{ "StayRecord" : "has"
    "StayRecord" ||--o{ "ServiceOrder" : "contains"
    "ServiceOrder" }o--|| "Department" : "assigned_to"

    "GuestProfile" {
        "string id PK"
        "string name"
        "string phone"
        "string[] preferences"
    }

    "StayRecord" {
        "string id PK"
        "string guestId FK"
        "string roomNumber"
        "string checkIn"
        "string checkOut"
        "number avgRating"
    }

    "ServiceOrder" {
        "string id PK"
        "string stayId FK"
        "string roomId"
        "string type"
        "string status"
        "string department"
        "string priority"
        "string createdAt"
        "number rating"
    }

    "Department" {
        "string id PK"
        "string name"
        "string[] orderTypes"
    }
```

### 6.2 数据定义语言

使用内存数据结构 + localStorage 持久化，初始Mock数据包含：

- 3个部门：客房部(housekeeping)、餐饮部(fandb)、工程部(engineering)
- 8间客房：801-808
- 5条客户档案（含入住历史与服务记录）
- 12条示例工单（覆盖各类型与各状态）
- 完整的中式早餐与正餐菜单数据
