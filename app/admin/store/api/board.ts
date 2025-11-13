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
  return commonFetchBoards(params, { search: options?.search })
}

export async function fetchAdminBoardDetail(boardNo: number): Promise<BoardResponse> {
  return commonFetchBoardDetail(boardNo)
}

export async function createAdminBoard(form: FormData): Promise<BoardResponse> {
  return commonCreateBoard(form)
}

export async function updateAdminBoard(boardNo: number, form: FormData): Promise<BoardResponse> {
  return commonUpdateBoard(boardNo, form)
}

export async function deleteAdminBoard(boardNo: number): Promise<void> {
  return commonDeleteBoard(boardNo)
}
