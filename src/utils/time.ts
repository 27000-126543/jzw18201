export function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

export function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric' })
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('zh-CN', {
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return '刚刚'
  if (min < 60) return `${min}分钟前`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr}小时前`
  return `${Math.floor(hr / 24)}天前`
}

export function responseDuration(createdAt: string, completedAt?: string): string {
  const end = completedAt ? new Date(completedAt).getTime() : Date.now()
  const start = new Date(createdAt).getTime()
  const min = Math.round((end - start) / 60000)
  if (min < 60) return `${min}分钟`
  return `${Math.floor(min / 60)}时${min % 60}分`
}

export function generateOrderId(): string {
  const num = Math.floor(Math.random() * 9000) + 1000
  return `ORD-${num}`
}
