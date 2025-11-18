export type SortKey = 'id' | 'createdDate' | 'updatedDate'

export interface WithdrawSurvey {
  id: number
  userId: number
  username: string
  reasonCodes: string[]
  reasonComment: string | null
  createdDate: string
  updatedDate: string
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

