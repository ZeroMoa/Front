import { BoardListResponse, BoardResponse } from '@/types/board'
import {
  commonFetchBoards,
  commonFetchBoardDetail,
  commonCreateBoard,
  commonUpdateBoard,
  commonDeleteBoard,
} from '@/lib/api/common/boardApi'

export async function fetchAdminBoards(
  params: URLSearchParams,
  options?: { search?: boolean }
): Promise<BoardListResponse> {
  return commonFetchBoards(params, { admin: true, search: options?.search })
}

export async function fetchAdminBoardDetail(boardNo: number): Promise<BoardResponse> {
  return commonFetchBoardDetail(boardNo, { admin: true })
}

export async function createAdminBoard(form: FormData): Promise<BoardResponse> {
  return commonCreateBoard(form, { admin: true })
}

export async function updateAdminBoard(boardNo: number, form: FormData): Promise<BoardResponse> {
  return commonUpdateBoard(boardNo, form, { admin: true })
}

export async function deleteAdminBoard(boardNo: number): Promise<void> {
  return commonDeleteBoard(boardNo, { admin: true })
}
