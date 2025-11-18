import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  commonCreateBoard,
  commonDeleteBoard,
  commonFetchBoardDetail,
  commonFetchBoards,
  commonUpdateBoard,
} from '@/lib/common/api/boardApi'
import { BoardResponse } from '@/types/board'

export const useAdminBoards = (params: URLSearchParams, options?: { search?: boolean }) => {
  const queryKey = useMemo(
    () => ['admin', 'boards', options?.search ? 'search' : 'list', params.toString()],
    [params, options?.search]
  )

  return useQuery({
    queryKey,
    queryFn: () => commonFetchBoards(params, { search: options?.search }),
    placeholderData: (previousData) => previousData,
  })
}

export const useAdminBoardDetail = (boardNo: number) => {
  return useQuery({
    queryKey: ['admin', 'board', boardNo],
    queryFn: () => commonFetchBoardDetail(boardNo),
    enabled: Number.isFinite(boardNo) && boardNo > 0,
  })
}

export const useCreateAdminBoard = () => {
  const queryClient = useQueryClient()

  return useMutation<BoardResponse, Error, FormData>({
    mutationFn: (form: FormData) => commonCreateBoard(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'boards'] })
    },
  })
}

export const useUpdateAdminBoard = () => {
  const queryClient = useQueryClient()

  return useMutation<BoardResponse, Error, { boardNo: number; form: FormData }>({
    mutationFn: ({ boardNo, form }) => commonUpdateBoard(boardNo, form),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'board', variables.boardNo] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'boards'] })
    },
  })
}

export const useDeleteAdminBoard = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, number>({
    mutationFn: (boardNo: number) => commonDeleteBoard(boardNo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'boards'] })
    },
  })
}
