export const PAGE_SIZE_OPTIONS = [10, 20, 50]

export const DEFAULT_SORT_FIELD = 'displayIndex'
export const DEFAULT_SORT_DIRECTION: 'asc' | 'desc' = 'desc'

export const PRIORITY_REASON_LABELS = [
  { code: 'NOT_ENOUGH_INFO', label: '정보가 적음' },
  { code: 'INACCURATE_INFO', label: '정보가 정확하지 않음' },
  { code: 'FEW_FEATURES', label: '사이트의 기능이 적음' },
  { code: 'LOW_VISIT_FREQUENCY', label: '방문 빈도가 낮음' },
] as const

export const ADDITIONAL_REASON_LABELS: Record<string, string> = {
  TOO_COSTLY: '가격이 비쌈',
  POOR_TASTE: '맛이 별로임',
  NOT_EFFECTIVE: '효과가 적음',
}

export const REASON_LABEL_ORDER = [
  ...PRIORITY_REASON_LABELS.map((item) => item.code),
  ...Object.keys(ADDITIONAL_REASON_LABELS),
]

export const REASON_LABEL_MAP = [
  ...PRIORITY_REASON_LABELS,
  ...Object.entries(ADDITIONAL_REASON_LABELS).map(([code, label]) => ({ code, label })),
].reduce<Record<string, string>>((acc, item) => {
  acc[item.code] = item.label
  return acc
}, {})

export const PRIORITY_REASON_ORDER = PRIORITY_REASON_LABELS.map((item) => item.code)

export const PIE_COLORS = ['#5A7BFF', '#7F53FF', '#58D3FF', '#FF8F6B', '#FFCD6B', '#8DD38C', '#A081FF', '#FF6FAE']

export const COLUMN_HEADERS = [
  { key: 'displayIndex', label: '설문조사 번호', width: '160px', sortable: true },
  { key: 'username', label: '회원명 / ID', width: '160px' },
  { key: 'reasons', label: '이유 코드' },
  { key: 'comment', label: '추가 의견', width: '260px' },
  { key: 'createdDate', label: '작성일', width: '170px' },
] as const

