import type { DepartmentInfo, GuestProfile, MenuCategory, ServiceOrder, ServiceType } from '@/types'

export const departments: DepartmentInfo[] = [
  { id: 'housekeeping', name: '客房部', orderTypes: ['amenities', 'wakeUp', 'dnd'] },
  { id: 'fandb', name: '餐饮部', orderTypes: ['dining'] },
  { id: 'engineering', name: '工程部', orderTypes: ['repair'] },
]

export const amenityOptions = [
  '浴巾 x2',
  '面巾 x2',
  '洗漱套装',
  '牙刷套装',
  '梳子',
  '浴帽',
  '拖鞋',
  '矿泉水',
  '茶叶',
  '咖啡包',
  '抽纸',
  '衣架',
]

export const repairIssueTypes = [
  '马桶漏水',
  '空调故障',
  '灯具损坏',
  '水龙头故障',
  '电视故障',
  '门锁问题',
  '网络故障',
  '下水道堵塞',
  '其他',
]

export const menuData: MenuCategory[] = [
  {
    id: 'breakfast',
    name: '中式早餐',
    items: [
      { id: 'b1', name: '皮蛋瘦肉粥', description: '精选大米配皮蛋瘦肉，文火慢熬', price: 28, category: 'breakfast', image: 'congee', tags: ['热销'] },
      { id: 'b2', name: '小笼包(8只)', description: '薄皮多汁，鲜肉馅料', price: 32, category: 'breakfast', image: 'xiaolongbao', tags: ['招牌'] },
      { id: 'b3', name: '油条', description: '现炸酥脆，金黄诱人', price: 12, category: 'breakfast', image: 'youtiao' },
      { id: 'b4', name: '豆浆', description: '现磨浓香，热/冰可选', price: 10, category: 'breakfast', image: 'soymilk' },
      { id: 'b5', name: '煎蛋', description: '单面/双面煎制', price: 8, category: 'breakfast', image: 'friedegg' },
      { id: 'b6', name: '白粥', description: '绵密顺滑，佐小菜三碟', price: 18, category: 'breakfast', image: 'ricecongee' },
    ]
  },
  {
    id: 'western',
    name: '西式早餐',
    items: [
      { id: 'w1', name: '美式早餐拼盘', description: '培根、香肠、煎蛋、烤番茄、焗豆', price: 58, category: 'western', image: 'american', tags: ['热销'] },
      { id: 'w2', name: '法式吐司', description: '配枫糖浆与鲜莓', price: 38, category: 'western', image: 'toast' },
      { id: 'w3', name: '牛角包', description: '黄油可颂，配果酱', price: 22, category: 'western', image: 'croissant' },
      { id: 'w4', name: '酸奶麦片碗', description: '希腊酸奶配格兰诺拉与鲜果', price: 36, category: 'western', image: 'yogurt' },
    ]
  },
  {
    id: 'main',
    name: '主食',
    items: [
      { id: 'm1', name: '扬州炒饭', description: '经典蛋炒饭，粒粒分明', price: 38, category: 'main', image: 'friedrice', tags: ['热销'] },
      { id: 'm2', name: '红烧牛肉面', description: '慢炖牛腩，劲道面条', price: 42, category: 'main', image: 'beefnoodle', tags: ['招牌'] },
      { id: 'm3', name: '番茄鸡蛋面', description: '酸甜浓汤，手工挂面', price: 32, category: 'main', image: 'tomatonoodle' },
      { id: 'm4', name: '鸡胸肉沙拉', description: '烤鸡胸配混合生菜与油醋汁', price: 48, category: 'main', image: 'salad' },
      { id: 'm5', name: '三明治拼盘', description: '三种口味迷你三明治', price: 45, category: 'main', image: 'sandwich' },
    ]
  },
  {
    id: 'snack',
    name: '小食',
    items: [
      { id: 's1', name: '水果拼盘', description: '当季鲜果精选', price: 38, category: 'snack', image: 'fruit', tags: ['健康'] },
      { id: 's2', name: '坚果拼盘', description: '每日坚果组合', price: 28, category: 'snack', image: 'nuts' },
      { id: 's3', name: '芝士拼盘', description: '三种芝士配饼干与葡萄', price: 52, category: 'snack', image: 'cheese' },
      { id: 's4', name: '虾饺皇(4只)', description: '鲜虾仁手工包制', price: 38, category: 'snack', image: 'shrimpdumpling' },
    ]
  },
  {
    id: 'drink',
    name: '饮品',
    items: [
      { id: 'd1', name: '美式咖啡', description: '精选阿拉比卡豆', price: 28, category: 'drink', image: 'americano' },
      { id: 'd2', name: '拿铁', description: '浓缩咖啡配丝滑奶泡', price: 32, category: 'drink', image: 'latte', tags: ['热销'] },
      { id: 'd3', name: '铁观音', description: '安溪高山铁观音', price: 38, category: 'drink', image: 'tieguanyin' },
      { id: 'd4', name: '鲜榨橙汁', description: '新鲜橙子现榨', price: 28, category: 'drink', image: 'orangejuice' },
      { id: 'd5', name: '气泡水', description: '圣培露/巴黎水可选', price: 18, category: 'drink', image: 'sparkling' },
    ]
  },
]

const now = new Date()
const hour = (h: number) => {
  const d = new Date(now)
  d.setHours(d.getHours() - h)
  return d.toISOString()
}

export const initialOrders: ServiceOrder[] = [
  {
    id: 'ORD-001', roomId: '801', guestName: '张明远', guestId: 'G001',
    type: 'dining', status: 'pending', department: 'fandb', priority: 'normal',
    details: { type: 'dining', items: [{ id: 'b1', name: '皮蛋瘦肉粥', price: 28, quantity: 1 }, { id: 'd2', name: '拿铁', price: 32, quantity: 1 }], totalAmount: 60, note: '粥不要太咸' },
    createdAt: hour(0.2),
  },
  {
    id: 'ORD-002', roomId: '803', guestName: '李雪琴', guestId: 'G002',
    type: 'repair', status: 'accepted', department: 'engineering', priority: 'urgent',
    details: { type: 'repair', issueType: '空调故障', description: '空调制冷效果差，室温降不下来', urgency: 'urgent' },
    createdAt: hour(0.5), acceptedAt: hour(0.3),
  },
  {
    id: 'ORD-003', roomId: '805', guestName: '王建国', guestId: 'G003',
    type: 'amenities', status: 'inProgress', department: 'housekeeping', priority: 'normal',
    details: { type: 'amenities', items: ['浴巾 x2', '洗漱套装', '拖鞋'], note: '请多备一套浴巾' },
    createdAt: hour(1), acceptedAt: hour(0.8),
  },
  {
    id: 'ORD-004', roomId: '802', guestName: '陈思思', guestId: 'G004',
    type: 'wakeUp', status: 'completed', department: 'housekeeping', priority: 'normal',
    details: { type: 'wakeUp', dateTime: '2026-06-18T07:00:00', repeat: 'once', note: '' },
    createdAt: hour(8), acceptedAt: hour(7.8), completedAt: hour(7), handler: '赵阿姨',
    rating: 5,
  },
  {
    id: 'ORD-005', roomId: '806', guestName: '刘洋', guestId: 'G005',
    type: 'dining', status: 'inProgress', department: 'fandb', priority: 'normal',
    details: { type: 'dining', items: [{ id: 'm2', name: '红烧牛肉面', price: 42, quantity: 1 }, { id: 'd1', name: '美式咖啡', price: 28, quantity: 1 }], totalAmount: 70, note: '' },
    createdAt: hour(0.8), acceptedAt: hour(0.6),
  },
  {
    id: 'ORD-006', roomId: '801', guestName: '张明远', guestId: 'G001',
    type: 'dnd', status: 'inProgress', department: 'housekeeping', priority: 'normal',
    details: { type: 'dnd', startTime: '14:00', endTime: '17:00', note: '午休时间请勿打扰' },
    createdAt: hour(2),
  },
  {
    id: 'ORD-007', roomId: '804', guestName: '周小慧', guestId: 'G002',
    type: 'repair', status: 'pending', department: 'engineering', priority: 'normal',
    details: { type: 'repair', issueType: '灯具损坏', description: '浴室灯不亮了', urgency: 'normal' },
    createdAt: hour(0.1),
  },
  {
    id: 'ORD-008', roomId: '807', guestName: '孙鹏', guestId: 'G005',
    type: 'dining', status: 'completed', department: 'fandb', priority: 'normal',
    details: { type: 'dining', items: [{ id: 'w1', name: '美式早餐拼盘', price: 58, quantity: 2 }, { id: 'd3', name: '铁观音', price: 38, quantity: 1 }], totalAmount: 154, note: '两个拼盘要不同的配菜' },
    createdAt: hour(6), acceptedAt: hour(5.8), completedAt: hour(5.5), handler: '小王', rating: 4,
  },
  {
    id: 'ORD-009', roomId: '803', guestName: '李雪琴', guestId: 'G002',
    type: 'amenities', status: 'pending', department: 'housekeeping', priority: 'normal',
    details: { type: 'amenities', items: ['矿泉水', '茶叶', '抽纸'], note: '' },
    createdAt: hour(0.05),
  },
  {
    id: 'ORD-010', roomId: '808', guestName: '赵磊', guestId: 'G003',
    type: 'wakeUp', status: 'pending', department: 'housekeeping', priority: 'normal',
    details: { type: 'wakeUp', dateTime: '2026-06-19T06:30:00', repeat: 'daily', note: '赶飞机' },
    createdAt: hour(0.3),
  },
  {
    id: 'ORD-011', roomId: '805', guestName: '王建国', guestId: 'G003',
    type: 'dining', status: 'completed', department: 'fandb', priority: 'normal',
    details: { type: 'dining', items: [{ id: 'm1', name: '扬州炒饭', price: 38, quantity: 1 }, { id: 's1', name: '水果拼盘', price: 38, quantity: 1 }], totalAmount: 76, note: '' },
    createdAt: hour(4), acceptedAt: hour(3.8), completedAt: hour(3.3), handler: '小李', rating: 3, feedback: '炒饭偏咸了',
  },
  {
    id: 'ORD-012', roomId: '802', guestName: '陈思思', guestId: 'G004',
    type: 'amenities', status: 'completed', department: 'housekeeping', priority: 'normal',
    details: { type: 'amenities', items: ['浴帽', '梳子'], note: '' },
    createdAt: hour(10), acceptedAt: hour(9.8), completedAt: hour(9.5), handler: '赵阿姨', rating: 5,
  },
]

export const initialGuests: GuestProfile[] = [
  {
    id: 'G001', name: '张明远', phone: '138****5678',
    preferences: ['偏好荞麦枕', '常点中式早餐', '午休免打扰'],
    stayHistory: [
      { id: 'S001', guestId: 'G001', roomNumber: '801', checkIn: '2026-06-16', checkOut: '2026-06-20', serviceOrders: ['ORD-001', 'ORD-006'], avgRating: 0 },
      { id: 'S002', guestId: 'G001', roomNumber: '605', checkIn: '2026-03-10', checkOut: '2026-03-12', serviceOrders: [], avgRating: 4.5 },
    ]
  },
  {
    id: 'G002', name: '李雪琴', phone: '139****9012',
    preferences: ['怕冷需多备毛毯', '偏爱西式早餐'],
    stayHistory: [
      { id: 'S003', guestId: 'G002', roomNumber: '803', checkIn: '2026-06-17', checkOut: '2026-06-19', serviceOrders: ['ORD-002', 'ORD-009'], avgRating: 0 },
      { id: 'S004', guestId: 'G002', roomNumber: '402', checkIn: '2025-12-24', checkOut: '2025-12-26', serviceOrders: [], avgRating: 4.8 },
    ]
  },
  {
    id: 'G003', name: '王建国', phone: '136****3456',
    preferences: ['商务出行', '赶飞机需叫醒', '常点牛肉面'],
    stayHistory: [
      { id: 'S005', guestId: 'G003', roomNumber: '805', checkIn: '2026-06-15', checkOut: '2026-06-19', serviceOrders: ['ORD-003', 'ORD-011'], avgRating: 0 },
    ]
  },
  {
    id: 'G004', name: '陈思思', phone: '137****7890',
    preferences: ['爱喝茶', '注重卫生'],
    stayHistory: [
      { id: 'S006', guestId: 'G004', roomNumber: '802', checkIn: '2026-06-18', checkOut: '2026-06-21', serviceOrders: ['ORD-004', 'ORD-012'], avgRating: 5 },
      { id: 'S007', guestId: 'G004', roomNumber: '703', checkIn: '2026-01-05', checkOut: '2026-01-08', serviceOrders: [], avgRating: 4.6 },
    ]
  },
  {
    id: 'G005', name: '刘洋', phone: '135****2345',
    preferences: ['家庭出游', '偏好双份备品'],
    stayHistory: [
      { id: 'S008', guestId: 'G005', roomNumber: '806', checkIn: '2026-06-17', checkOut: '2026-06-20', serviceOrders: ['ORD-005'], avgRating: 0 },
      { id: 'S009', guestId: 'G005', roomNumber: '807', checkIn: '2026-06-17', checkOut: '2026-06-20', serviceOrders: ['ORD-008'], avgRating: 4.2 },
    ]
  },
]

export const roomGuestMap: Record<string, string> = {
  '801': 'G001',
  '802': 'G004',
  '803': 'G002',
  '804': 'G002',
  '805': 'G003',
  '806': 'G005',
  '807': 'G005',
  '808': 'G003',
}

export const typeIcons: Record<ServiceType, string> = {
  dining: '🍽️',
  amenities: '🧴',
  repair: '🔧',
  wakeUp: '⏰',
  dnd: '🌙',
}
