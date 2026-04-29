import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, parseISO, formatDistanceToNow } from 'date-fns'

// Tailwind class merge
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Date formatting
export const fmtDate = (d) => d ? format(parseISO(d), 'dd MMM yyyy') : '—'
export const fmtDateTime = (d) => d ? format(parseISO(d), 'dd MMM yyyy, h:mm a') : '—'
export const fmtRelative = (d) => d ? formatDistanceToNow(parseISO(d), { addSuffix: true }) : '—'
export const fmtMonth = (d) => d ? format(parseISO(d), 'MMMM yyyy') : '—'

// Currency
export const fmtCurrency = (amount, currency = 'GHS') =>
  new Intl.NumberFormat('en-GH', { style: 'currency', currency, minimumFractionDigits: 2 }).format(amount ?? 0)

// Numbers
export const fmtNumber = (n) =>
  new Intl.NumberFormat('en-GH').format(n ?? 0)

// Initials from name
export const getInitials = (name = '') =>
  name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()

// Status badge variant
export const statusVariant = (status) => {
  const map = {
    active: 'green', approved: 'green', paid: 'green', completed: 'green', hired: 'green',
    pending: 'yellow', processing: 'yellow', open: 'yellow', scheduled: 'yellow',
    rejected: 'red', terminated: 'red', failed: 'red', critical: 'red', expired: 'red',
    suspended: 'yellow', on_leave: 'blue', contract: 'blue',
    draft: 'gray', closed: 'gray', cancelled: 'gray',
  }
  return map[status?.toLowerCase()] ?? 'gray'
}

// Truncate text
export const truncate = (str, n = 40) =>
  str && str.length > n ? str.slice(0, n) + '…' : str

// Extract validation errors from Laravel 422
export const extractErrors = (error) => {
  const errors = error?.response?.data?.errors
  if (!errors) return {}
  return Object.fromEntries(
    Object.entries(errors).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v])
  )
}

// Build query string
export const buildQuery = (params) => {
  const q = new URLSearchParams()
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') q.append(k, v)
  })
  return q.toString()
}
