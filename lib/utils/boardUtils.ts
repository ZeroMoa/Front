import { BoardSearchType, BoardType } from '@/types/boardTypes'

export interface BoardQueryOptions {
  page?: number
  size?: number
  sort?: string
  keyword?: string
  searchType?: BoardSearchType
  boardType?: BoardType
}

export function isBoardSearchMode(keyword?: string) {
  return Boolean(keyword?.trim())
}

export function createBoardSearchParams(options: BoardQueryOptions) {
  const params = new URLSearchParams()
  params.set('page', String(options.page ?? 0))
  params.set('size', String(options.size ?? 10))
  params.set('sort', options.sort ?? 'boardNo,desc')

  if (isBoardSearchMode(options.keyword)) {
    if (options.keyword) {
      params.set('keyword', options.keyword)
    }
    if (options.searchType) {
      params.set('searchType', options.searchType)
    }
    if (options.boardType) {
      params.set('boardType', options.boardType)
    }
  }

  return params
}

