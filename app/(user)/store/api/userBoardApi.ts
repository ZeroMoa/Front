import { BoardListResponse, BoardResponse } from '@/types/boardTypes'
import {
  commonFetchBoards,
  commonFetchBoardDetail,
  commonCreateBoard,
  commonUpdateBoard,
  commonDeleteBoard,
} from '@/lib/common/api/boardApi'

export const fetchBoards = async (params: URLSearchParams): Promise<BoardListResponse> => {
  return commonFetchBoards(params, { admin: false, search: false })
}

export const fetchBoardDetail = async (boardNo: number): Promise<BoardResponse> => {
  return commonFetchBoardDetail(boardNo)
}

export const createBoard = async (form: FormData): Promise<BoardResponse> => {
  return commonCreateBoard(form)
}

export const updateBoard = async (boardNo: number, form: FormData): Promise<BoardResponse> => {
  return commonUpdateBoard(boardNo, form)
}

export const deleteBoard = async (boardNo: number): Promise<void> => {
  return commonDeleteBoard(boardNo)
}

export const searchBoards = async (params: URLSearchParams): Promise<BoardListResponse> => {
  return commonFetchBoards(params, { admin: false, search: true })
}

