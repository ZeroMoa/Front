export type SortDirection = 'asc' | 'desc' | null

export type SortKey =
  | 'adminNotificationNo'
  | 'title'
  | 'boardNo'
  | 'sentAt'
  | 'isActive'
  | 'createdDate'
  | 'updatedDate'

export type SortState = {
  field: SortKey | null
  direction: SortDirection
}

export type FiltersState = {
  title: string
  boardNo: string
  isActive: 'all' | 'true' | 'false'
}

export const SORT_FIELD_MAP: Record<SortKey, string> = {
  adminNotificationNo: 'displayIndex',
  title: 'board.title',
  boardNo: 'board.displayIndex',
  sentAt: 'sentAt',
  isActive: 'isActive',
  createdDate: 'createdDate',
  updatedDate: 'updatedDate',
}

export const TABLE_COLUMNS: Array<{
  key: SortKey
  label: string
}> = [
  { key: 'adminNotificationNo', label: '관리자 알림 번호' },
  { key: 'title', label: '게시글 제목' },
  { key: 'boardNo', label: '게시글 번호' },
  { key: 'sentAt', label: '전송 시간' },
  { key: 'isActive', label: '활성화 여부' },
  { key: 'createdDate', label: '생성일' },
  { key: 'updatedDate', label: '수정일' },
]

export const PAGE_SIZE_OPTIONS = [10, 20, 40]

export const INITIAL_SORT_STATE: SortState = {
  field: 'adminNotificationNo',
  direction: 'desc',
}

export const INITIAL_FILTERS: FiltersState = {
  title: '',
  boardNo: '',
  isActive: 'all',
}

export const formatDateTime = (value?: string | null) => {
  if (!value) return ['—', '']
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return [value, '']

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

