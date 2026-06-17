import type { DepartmentInfo, GuestProfile, MenuCategory, ServiceOrder, ServiceType, PreferenceTag } from '@/types'

export const departments: DepartmentInfo[] = [
  { id: 'housekeeping', name: '客房部', orderTypes: ['amenities', 'wakeUp', 'dnd'], handlers: ['赵阿姨', '王大姐', '刘姐', '孙姨'] },
  { id: 'fandb', name: '餐饮部', orderTypes: ['dining'], handlers: ['小王', '小李', '小张', '何师傅'] },
  { id: 'engineering', name: '工程部', orderTypes: ['repair'], handlers: ['陈师傅', '黄工', '老刘', '周工'] },
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
const minutes = (m: number) => {
  const d = new Date(now)
  d.setMinutes(d.getMinutes() - m)
  return d.toISOString()
}

const logId = (n: number) => `LOG-${String(n).padStart(3, '0')}`

export const initialOrders: ServiceOrder[] = [
  {
    id: 'ORD-001', roomId: '801', guestName: '张明远', guestId: 'G001',
    type: 'dining', status: 'pending', department: 'fandb', priority: 'normal',
    details: { type: 'dining', items: [{ id: 'b1', name: '皮蛋瘦肉粥', price: 28, quantity: 1 }, { id: 'd2', name: '拿铁', price: 32, quantity: 1 }], totalAmount: 60, note: '粥不要太咸' },
    createdAt: minutes(12),
    logs: [
      { id: logId(1), timestamp: minutes(12), fromStatus: null, toStatus: 'pending', operator: '系统' },
    ],
    isTimeout: true, timeoutMinutes: 12,
  },
  {
    id: 'ORD-002', roomId: '803', guestName: '李雪琴', guestId: 'G002',
    type: 'repair', status: 'accepted', department: 'engineering', priority: 'urgent',
    details: { type: 'repair', issueType: '空调故障', description: '空调制冷效果差，室温降不下来', urgency: 'urgent' },
    createdAt: minutes(30), acceptedAt: minutes(18),
    handler: '陈师傅',
    logs: [
      { id: logId(2), timestamp: minutes(30), fromStatus: null, toStatus: 'pending', operator: '系统' },
      { id: logId(3), timestamp: minutes(18), fromStatus: 'pending', toStatus: 'accepted', operator: '前台接待', handlerAssigned: '陈师傅', note: '优先处理' },
    ],
    isTimeout: true, timeoutMinutes: 30,
  },
  {
    id: 'ORD-003', roomId: '805', guestName: '王建国', guestId: 'G003',
    type: 'amenities', status: 'inProgress', department: 'housekeeping', priority: 'normal',
    details: { type: 'amenities', items: ['浴巾 x2', '洗漱套装', '拖鞋'], note: '请多备一套浴巾' },
    createdAt: minutes(60), acceptedAt: minutes(48),
    handler: '赵阿姨',
    logs: [
      { id: logId(4), timestamp: minutes(60), fromStatus: null, toStatus: 'pending', operator: '系统' },
      { id: logId(5), timestamp: minutes(48), fromStatus: 'pending', toStatus: 'accepted', operator: '前台接待', handlerAssigned: '赵阿姨' },
      { id: logId(6), timestamp: minutes(30), fromStatus: 'accepted', toStatus: 'inProgress', operator: '赵阿姨', note: '正在前往客房' },
    ],
  },
  {
    id: 'ORD-004', roomId: '802', guestName: '陈思思', guestId: 'G004',
    type: 'wakeUp', status: 'completed', department: 'housekeeping', priority: 'normal',
    details: { type: 'wakeUp', dateTime: '2026-06-18T07:00:00', repeat: 'once', note: '' },
    createdAt: hour(8), acceptedAt: hour(7.8), completedAt: hour(7), handler: '赵阿姨',
    logs: [
      { id: logId(7), timestamp: hour(8), fromStatus: null, toStatus: 'pending', operator: '系统' },
      { id: logId(8), timestamp: hour(7.8), fromStatus: 'pending', toStatus: 'accepted', operator: '前台接待', handlerAssigned: '赵阿姨' },
      { id: logId(9), timestamp: hour(7.5), fromStatus: 'accepted', toStatus: 'inProgress', operator: '赵阿姨' },
      { id: logId(10), timestamp: hour(7), fromStatus: 'inProgress', toStatus: 'completed', operator: '赵阿姨', note: '客人已接听叫醒电话' },
    ],
    rating: 5, reviewType: 'service',
  },
  {
    id: 'ORD-005', roomId: '806', guestName: '刘洋', guestId: 'G005',
    type: 'dining', status: 'inProgress', department: 'fandb', priority: 'normal',
    details: { type: 'dining', items: [{ id: 'm2', name: '红烧牛肉面', price: 42, quantity: 1 }, { id: 'd1', name: '美式咖啡', price: 28, quantity: 1 }], totalAmount: 70, note: '' },
    createdAt: minutes(48), acceptedAt: minutes(36),
    handler: '小王',
    logs: [
      { id: logId(11), timestamp: minutes(48), fromStatus: null, toStatus: 'pending', operator: '系统' },
      { id: logId(12), timestamp: minutes(36), fromStatus: 'pending', toStatus: 'accepted', operator: '前台接待', handlerAssigned: '小王' },
      { id: logId(13), timestamp: minutes(20), fromStatus: 'accepted', toStatus: 'inProgress', operator: '小王', note: '餐品准备中' },
    ],
  },
  {
    id: 'ORD-006', roomId: '801', guestName: '张明远', guestId: 'G001',
    type: 'dnd', status: 'inProgress', department: 'housekeeping', priority: 'normal',
    details: { type: 'dnd', startTime: '14:00', endTime: '17:00', note: '午休时间请勿打扰' },
    createdAt: hour(2),
    handler: '王大姐',
    logs: [
      { id: logId(14), timestamp: hour(2), fromStatus: null, toStatus: 'pending', operator: '系统' },
      { id: logId(15), timestamp: hour(1.9), fromStatus: 'pending', toStatus: 'inProgress', operator: '前台接待', handlerAssigned: '王大姐', note: '已设置免打扰门牌' },
    ],
  },
  {
    id: 'ORD-007', roomId: '804', guestName: '周小慧', guestId: 'G002',
    type: 'repair', status: 'pending', department: 'engineering', priority: 'normal',
    details: { type: 'repair', issueType: '灯具损坏', description: '浴室灯不亮了', urgency: 'normal' },
    createdAt: minutes(6),
    logs: [
      { id: logId(16), timestamp: minutes(6), fromStatus: null, toStatus: 'pending', operator: '系统' },
    ],
  },
  {
    id: 'ORD-008', roomId: '807', guestName: '孙鹏', guestId: 'G005',
    type: 'dining', status: 'completed', department: 'fandb', priority: 'normal',
    details: { type: 'dining', items: [{ id: 'w1', name: '美式早餐拼盘', price: 58, quantity: 2 }, { id: 'd3', name: '铁观音', price: 38, quantity: 1 }], totalAmount: 154, note: '两个拼盘要不同的配菜' },
    createdAt: hour(6), acceptedAt: hour(5.8), completedAt: hour(5.5), handler: '小王',
    logs: [
      { id: logId(17), timestamp: hour(6), fromStatus: null, toStatus: 'pending', operator: '系统' },
      { id: logId(18), timestamp: hour(5.8), fromStatus: 'pending', toStatus: 'accepted', operator: '前台接待', handlerAssigned: '小王' },
      { id: logId(19), timestamp: hour(5.7), fromStatus: 'accepted', toStatus: 'inProgress', operator: '小王' },
      { id: logId(20), timestamp: hour(5.5), fromStatus: 'inProgress', toStatus: 'completed', operator: '小王', note: '客人签收' },
    ],
    rating: 4, reviewType: 'service',
  },
  {
    id: 'ORD-009', roomId: '803', guestName: '李雪琴', guestId: 'G002',
    type: 'amenities', status: 'pending', department: 'housekeeping', priority: 'normal',
    details: { type: 'amenities', items: ['矿泉水', '茶叶', '抽纸'], note: '' },
    createdAt: minutes(3),
    logs: [
      { id: logId(21), timestamp: minutes(3), fromStatus: null, toStatus: 'pending', operator: '系统' },
    ],
  },
  {
    id: 'ORD-010', roomId: '808', guestName: '赵磊', guestId: 'G003',
    type: 'wakeUp', status: 'pending', department: 'housekeeping', priority: 'normal',
    details: { type: 'wakeUp', dateTime: '2026-06-19T06:30:00', repeat: 'daily', note: '赶飞机' },
    createdAt: minutes(18),
    logs: [
      { id: logId(22), timestamp: minutes(18), fromStatus: null, toStatus: 'pending', operator: '系统' },
    ],
  },
  {
    id: 'ORD-011', roomId: '805', guestName: '王建国', guestId: 'G003',
    type: 'dining', status: 'completed', department: 'fandb', priority: 'normal',
    details: { type: 'dining', items: [{ id: 'm1', name: '扬州炒饭', price: 38, quantity: 1 }, { id: 's1', name: '水果拼盘', price: 38, quantity: 1 }], totalAmount: 76, note: '' },
    createdAt: hour(4), acceptedAt: hour(3.8), completedAt: hour(3.3), handler: '小李',
    logs: [
      { id: logId(23), timestamp: hour(4), fromStatus: null, toStatus: 'pending', operator: '系统' },
      { id: logId(24), timestamp: hour(3.8), fromStatus: 'pending', toStatus: 'accepted', operator: '前台接待', handlerAssigned: '小李' },
      { id: logId(25), timestamp: hour(3.7), fromStatus: 'accepted', toStatus: 'inProgress', operator: '小李' },
      { id: logId(26), timestamp: hour(3.3), fromStatus: 'inProgress', toStatus: 'completed', operator: '小李' },
    ],
    rating: 3, feedback: '炒饭偏咸了', reviewType: 'service',
  },
  {
    id: 'ORD-012', roomId: '802', guestName: '陈思思', guestId: 'G004',
    type: 'amenities', status: 'completed', department: 'housekeeping', priority: 'normal',
    details: { type: 'amenities', items: ['浴帽', '梳子'], note: '' },
    createdAt: hour(10), acceptedAt: hour(9.8), completedAt: hour(9.5), handler: '赵阿姨',
    logs: [
      { id: logId(27), timestamp: hour(10), fromStatus: null, toStatus: 'pending', operator: '系统' },
      { id: logId(28), timestamp: hour(9.8), fromStatus: 'pending', toStatus: 'accepted', operator: '前台接待', handlerAssigned: '赵阿姨' },
      { id: logId(29), timestamp: hour(9.7), fromStatus: 'accepted', toStatus: 'inProgress', operator: '赵阿姨' },
      { id: logId(30), timestamp: hour(9.5), fromStatus: 'inProgress', toStatus: 'completed', operator: '赵阿姨', note: '已送达' },
    ],
    rating: 5, reviewType: 'service',
  },
]

const defaultPref = (prefs: Omit<PreferenceTag, 'id'>[]): PreferenceTag[] =>
  prefs.map((p, i) => ({ ...p, id: `PREF-${Math.floor(Math.random() * 9000) + 1000 + i}` }))

export const initialGuests: GuestProfile[] = [
  {
    id: 'G001', name: '张明远', phone: '138****5678',
    preferences: defaultPref([
      { label: '偏好荞麦枕', source: 'manual', category: 'other', count: 3, lastUsed: hour(24 * 10) },
      { label: '常点中式早餐', source: 'auto', category: 'dining', count: 5, lastUsed: hour(0.2) },
      { label: '午休免打扰', source: 'auto', category: 'sleep', count: 4, lastUsed: hour(2) },
      { label: '喜欢咖啡', source: 'auto', category: 'dining', count: 2, lastUsed: hour(0.2) },
    ]),
    stayHistory: [
      { id: 'S001', guestId: 'G001', roomNumber: '801', checkIn: '2026-06-16', checkOut: '2026-06-20', serviceOrders: ['ORD-001', 'ORD-006'], avgRating: 0, isCurrent: true },
      { id: 'S002', guestId: 'G001', roomNumber: '605', checkIn: '2026-03-10', checkOut: '2026-03-12', serviceOrders: [], avgRating: 4.5 },
    ]
  },
  {
    id: 'G002', name: '李雪琴', phone: '139****9012',
    preferences: defaultPref([
      { label: '怕冷需多备毛毯', source: 'manual', category: 'other', count: 2, lastUsed: hour(24 * 20) },
      { label: '偏爱西式早餐', source: 'auto', category: 'dining', count: 3, lastUsed: hour(24 * 5) },
      { label: '常点矿泉水', source: 'auto', category: 'amenities', count: 3, lastUsed: minutes(3) },
    ]),
    stayHistory: [
      { id: 'S003', guestId: 'G002', roomNumber: '803', checkIn: '2026-06-17', checkOut: '2026-06-19', serviceOrders: ['ORD-002', 'ORD-009'], avgRating: 0, isCurrent: true },
      { id: 'S004', guestId: 'G002', roomNumber: '402', checkIn: '2025-12-24', checkOut: '2025-12-26', serviceOrders: [], avgRating: 4.8 },
    ]
  },
  {
    id: 'G003', name: '王建国', phone: '136****3456',
    preferences: defaultPref([
      { label: '商务出行', source: 'manual', category: 'other', count: 6, lastUsed: hour(24) },
      { label: '赶飞机需叫醒', source: 'auto', category: 'sleep', count: 4, lastUsed: minutes(18) },
      { label: '常点牛肉面', source: 'auto', category: 'dining', count: 3, lastUsed: hour(4) },
      { label: '偏好扬州炒饭', source: 'auto', category: 'dining', count: 2, lastUsed: hour(4) },
      { label: '需多备浴巾', source: 'auto', category: 'amenities', count: 2, lastUsed: hour(1) },
    ]),
    stayHistory: [
      { id: 'S005', guestId: 'G003', roomNumber: '805', checkIn: '2026-06-15', checkOut: '2026-06-19', serviceOrders: ['ORD-003', 'ORD-011'], avgRating: 0, isCurrent: true },
      { id: 'S010', guestId: 'G003', roomNumber: '808', checkIn: '2026-06-17', checkOut: '2026-06-19', serviceOrders: ['ORD-010'], avgRating: 0, isCurrent: true },
    ]
  },
  {
    id: 'G004', name: '陈思思', phone: '137****7890',
    preferences: defaultPref([
      { label: '爱喝茶', source: 'auto', category: 'dining', count: 5, lastUsed: hour(24) },
      { label: '注重卫生', source: 'manual', category: 'other', count: 1, lastUsed: hour(24 * 30) },
      { label: '偏好早晨叫醒', source: 'auto', category: 'sleep', count: 2, lastUsed: hour(8) },
    ]),
    stayHistory: [
      { id: 'S006', guestId: 'G004', roomNumber: '802', checkIn: '2026-06-18', checkOut: '2026-06-21', serviceOrders: ['ORD-004', 'ORD-012'], avgRating: 5, isCurrent: true },
      { id: 'S007', guestId: 'G004', roomNumber: '703', checkIn: '2026-01-05', checkOut: '2026-01-08', serviceOrders: [], avgRating: 4.6 },
    ]
  },
  {
    id: 'G005', name: '刘洋', phone: '135****2345',
    preferences: defaultPref([
      { label: '家庭出游', source: 'manual', category: 'other', count: 2, lastUsed: hour(24) },
      { label: '偏好双份备品', source: 'auto', category: 'amenities', count: 3, lastUsed: hour(48) },
      { label: '喜欢美式早餐', source: 'auto', category: 'dining', count: 2, lastUsed: hour(6) },
      { label: '喜欢咖啡', source: 'auto', category: 'dining', count: 2, lastUsed: minutes(48) },
    ]),
    stayHistory: [
      { id: 'S008', guestId: 'G005', roomNumber: '806', checkIn: '2026-06-17', checkOut: '2026-06-20', serviceOrders: ['ORD-005'], avgRating: 0, isCurrent: true },
      { id: 'S009', guestId: 'G005', roomNumber: '807', checkIn: '2026-06-17', checkOut: '2026-06-20', serviceOrders: ['ORD-008'], avgRating: 4.2, isCurrent: true },
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
