import { BoardListResponse, BoardResponse } from '@/types/board'
import { fetchWithAuth } from '@/lib/api/fetchWithAuth'

export const BOARD_PUBLIC_PATH = '/board'
export const BOARD_SEARCH_PATH = '/board/search'
export const ADMIN_BOARD_BASE_PATH = '/admin/boards'

function buildListUrl(params: URLSearchParams, basePath: string): string {
  const query = params.toString()
  return query ? `${basePath}?${query}` : basePath
}

// 사용자 및 관리자 공통 게시글 목록 조회
export async function commonFetchBoards(
  params: URLSearchParams,
  options?: { search?: boolean; admin?: boolean }
): Promise<BoardListResponse> {
  const basePath = options?.admin
    ? ADMIN_BOARD_BASE_PATH
    : options?.search
      ? BOARD_SEARCH_PATH
      : BOARD_PUBLIC_PATH
  const response = await fetchWithAuth(buildListUrl(params, basePath))
  return response.json()
}

// 사용자 및 관리자 공통 게시글 상세 조회
export async function commonFetchBoardDetail(
  boardNo: number,
  options?: { admin?: boolean }
): Promise<BoardResponse> {
  const basePath = options?.admin ? ADMIN_BOARD_BASE_PATH : BOARD_PUBLIC_PATH
  const response = await fetchWithAuth(`${basePath}/${boardNo}`)
  return response.json()
}

// 사용자 및 관리자 공통 게시글 생성
export async function commonCreateBoard(
  form: FormData,
  options?: { admin?: boolean }
): Promise<BoardResponse> {
  const basePath = options?.admin ? ADMIN_BOARD_BASE_PATH : BOARD_PUBLIC_PATH
  const response = await fetchWithAuth(basePath, {
    method: 'POST',
    body: form,
  })
  return response.json()
}

// 사용자 및 관리자 공통 게시글 수정
export async function commonUpdateBoard(
  boardNo: number,
  form: FormData,
  options?: { admin?: boolean }
): Promise<BoardResponse> {
  const basePath = options?.admin ? ADMIN_BOARD_BASE_PATH : BOARD_PUBLIC_PATH
  const response = await fetchWithAuth(`${basePath}/${boardNo}`, {
    method: 'PATCH',
    body: form,
  })
  return response.json()
}

// 사용자 및 관리자 공통 게시글 삭제
export async function commonDeleteBoard(
  boardNo: number,
  options?: { admin?: boolean }
): Promise<void> {
  const basePath = options?.admin ? ADMIN_BOARD_BASE_PATH : BOARD_PUBLIC_PATH
  await fetchWithAuth(`${basePath}/${boardNo}`, {
    method: 'DELETE',
  })
}
