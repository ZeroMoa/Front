import { BoardListResponse, BoardResponse } from '@/types/board'
import {
  commonFetchBoards,
  commonFetchBoardDetail,
  commonCreateBoard,
  commonUpdateBoard,
  commonDeleteBoard,
} from '@/lib/api/common/boardApi'

export const fetchBoards = async (params: URLSearchParams): Promise<BoardListResponse> => {
  return commonFetchBoards(params, { admin: false, search: false })
}

export const fetchBoardDetail = async (boardNo: number): Promise<BoardResponse> => {
  return commonFetchBoardDetail(boardNo, { admin: false })
}

export const createBoard = async (form: FormData): Promise<BoardResponse> => {
  return commonCreateBoard(form, { admin: false })
}

export const updateBoard = async (boardNo: number, form: FormData): Promise<BoardResponse> => {
  return commonUpdateBoard(boardNo, form, { admin: false })
}

export const deleteBoard = async (boardNo: number): Promise<void> => {
  return commonDeleteBoard(boardNo, { admin: false })
}

export const searchBoards = async (params: URLSearchParams): Promise<BoardListResponse> => {
  return commonFetchBoards(params, { admin: false, search: true })
}

