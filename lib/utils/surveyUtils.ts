import { PRIORITY_REASON_ORDER, REASON_LABEL_MAP } from '@/constants/withdrawSurveyConstants'
import type { SortKey, WithdrawSurvey } from '@/types/withdrawSurveyTypes'

const PRIORITY_SET = new Set(PRIORITY_REASON_ORDER)

export function normalizeReasonCode(value: string): string {
  const trimmed = value.trim()
  if (!trimmed) return ''
  if (REASON_LABEL_MAP[trimmed]) {
    return trimmed
  }
  const matchingEntry = Object.entries(REASON_LABEL_MAP).find(([, label]) => label === trimmed)
  return matchingEntry?.[0] ?? trimmed
}

export function sortReasonCodes(codes: string[]): string[] {
  const normalized = codes
    .map(normalizeReasonCode)
    .filter((code) => code.length > 0)
  const unique: string[] = []
  const seen = new Set<string>()
  PRIORITY_REASON_ORDER.forEach((code) => {
    if (normalized.includes(code) && !seen.has(code)) {
      unique.push(code)
      seen.add(code)
    }
  })
  normalized.forEach((code) => {
    if (!seen.has(code)) {
      unique.push(code)
      seen.add(code)
    }
  })
  return unique
}

export function normalizeSurvey(raw: any): WithdrawSurvey {
  const reasonCodes: string[] = Array.isArray(raw.reasonCodes)
    ? raw.reasonCodes
    : typeof raw.reasonCodes === 'string'
    ? raw.reasonCodes.split(',').map((item: string) => item.trim())
    : []
  const ordered = sortReasonCodes(reasonCodes)
  return {
    id: Number(raw.id ?? raw.withdrawSurveyId ?? 0),
    userId: Number(raw.userId ?? raw.user_id ?? 0),
    username: raw.username ?? raw.userName ?? `user-${raw.userId ?? '—'}`,
    reasonCodes: ordered,
    reasonComment: raw.reasonComment ?? raw.reason_comment ?? null,
    createdDate: raw.createdDate ?? raw.created_date ?? '',
    updatedDate: raw.updatedDate ?? raw.updated_date ?? '',
  }
}

export function formatDate(value?: string | null) {
  if (!value) {
    return ['—', '']
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return [value, '']
  }
  const dateText = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
  const timeText = new Intl.DateTimeFormat('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
  return [dateText, timeText]
}

export function formatDateParts(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return null
  }
  return {
    dateLine: new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date),
    timeLine: new Intl.DateTimeFormat('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(date),
  }
}

export interface WithdrawSurveyQueryParams {
  page: number
  size: number
  sort?: string
  reasonCodes?: string[]
  username?: string
  from?: string
  to?: string
}

export function buildWithdrawSurveyParams(options: WithdrawSurveyQueryParams) {
  const params = new URLSearchParams()
  params.set('page', String(options.page))
  params.set('size', String(options.size))
  if (options.sort) {
    params.set('sort', options.sort)
  }
  options.reasonCodes?.forEach((code) => {
    params.append('reasonCodes', code)
  })
  if (options.username) {
    params.set('username', options.username)
  }
  if (options.from) {
    params.set('from', `${options.from}T00:00:00`)
  }
  if (options.to) {
    params.set('to', `${options.to}T23:59:59`)
  }
  return params
}

