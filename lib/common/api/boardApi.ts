import { BoardListResponse, BoardResponse } from '@/types/boardTypes'
import { fetchWithAuth } from '@/lib/common/api/fetchWithAuth'

export const BOARD_PUBLIC_PATH = '/board'
export const BOARD_SEARCH_PATH = '/board/search'
export const ADMIN_BOARD_BASE_PATH = '/admin/boards' // 관리자 전용 생성/수정/삭제 경로

function buildListUrl(params: URLSearchParams, basePath: string): string {
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

// 게시글 목록 조회 (사용자 및 관리자 공통)
export async function commonFetchBoards(
  params: URLSearchParams,
  options?: { search?: boolean; admin?: boolean }
): Promise<BoardListResponse> {
  const isAdmin = options?.admin ?? false
  const useSearchPath = options?.search ?? false
  const basePath = useSearchPath
    ? BOARD_SEARCH_PATH
    : isAdmin
    ? ADMIN_BOARD_BASE_PATH
    : BOARD_PUBLIC_PATH
  const response = await fetchWithAuth(buildListUrl(params, basePath))
  return response.json()
}

// 게시글 상세 조회 (사용자 및 관리자 공통)
export async function commonFetchBoardDetail(
  boardNo: number
): Promise<BoardResponse> {
  const response = await fetchWithAuth(`${BOARD_PUBLIC_PATH}/${boardNo}`)
  return response.json()
}

// 게시글 생성 (관리자 전용)
export async function commonCreateBoard(
  form: FormData
): Promise<BoardResponse> {
  const response = await fetchWithAuth(ADMIN_BOARD_BASE_PATH, {
    method: 'POST',
    body: form,
  })
  return response.json()
}

// 게시글 수정 (관리자 전용)
export async function commonUpdateBoard(
  boardNo: number,
  form: FormData
): Promise<BoardResponse> {
  const response = await fetchWithAuth(`${ADMIN_BOARD_BASE_PATH}/${boardNo}`, {
    method: 'PATCH',
    body: form,
  })
  return response.json()
}

// 게시글 삭제 (관리자 전용)
export async function commonDeleteBoard(
  boardNo: number
): Promise<void> {
  await fetchWithAuth(`${ADMIN_BOARD_BASE_PATH}/${boardNo}`, {
    method: 'DELETE',
  })
}
