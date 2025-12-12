import {
  commonCreateBoard,
  commonDeleteBoard,
  commonFetchBoardDetail,
  commonFetchBoards,
  commonUpdateBoard,
  ADMIN_BOARD_BASE_PATH,
} from '@/lib/common/api/boardApi'
import { createBoardSearchParams, isBoardSearchMode, type BoardQueryOptions } from '@/lib/utils/boardUtils'
import type { BoardListResponse, BoardResponse } from '@/types/boardTypes'

export interface AdminBoardListParams extends BoardQueryOptions {
  page: number
  size: number
  sort: string
}

export function fetchAdminBoardList(params: AdminBoardListParams): Promise<BoardListResponse> {
  const searchParams = createBoardSearchParams(params)
  return commonFetchBoards(searchParams, { search: isBoardSearchMode(params.keyword), admin: true })
}

export function fetchAdminBoardDetail(boardNo: number): Promise<BoardResponse> {
  return commonFetchBoardDetail(boardNo)
}

export function createAdminBoard(form: FormData): Promise<BoardResponse> {
  return commonCreateBoard(form)
}

export function updateAdminBoard(boardNo: number, form: FormData): Promise<BoardResponse> {
  return commonUpdateBoard(boardNo, form)
}

export function deleteAdminBoard(boardNo: number) {
  return commonDeleteBoard(boardNo)
}
