export type SortKey = 'displayIndex'

export interface WithdrawSurvey {
  displayIndex: number
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

export interface WithdrawSurveyStatistics {
  reasonCounts: Array<{ code: string; count: number }>
  earliestCreatedDate?: string
  latestCreatedDate?: string
}

export interface WithdrawSurveyPage extends PageResponse<WithdrawSurvey> {
  statistics?: WithdrawSurveyStatistics
}

