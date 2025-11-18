import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAdminBoard,
  deleteAdminBoard,
  fetchAdminBoardDetail,
  fetchAdminBoardList,
  updateAdminBoard,
  type AdminBoardListParams,
} from '@/app/admin/store/api/adminBoardApi'
import type { BoardResponse } from '@/types/boardTypes'

export const useAdminBoards = (params: AdminBoardListParams) => {
  const queryKey = useMemo(() => ['admin', 'boards', params, params.keyword ?? ''], [params])

  return useQuery({
    queryKey,
    queryFn: () => fetchAdminBoardList(params),
    placeholderData: (previousData) => previousData,
  })
}

export const useAdminBoardDetail = (boardNo: number) => {
  return useQuery({
    queryKey: ['admin', 'board', boardNo],
    queryFn: () => fetchAdminBoardDetail(boardNo),
    enabled: Number.isFinite(boardNo) && boardNo > 0,
  })
}

export const useCreateAdminBoard = () => {
  const queryClient = useQueryClient()

  return useMutation<BoardResponse, Error, FormData>({
    mutationFn: (form) => createAdminBoard(form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'boards'] })
    },
  })
}

export const useUpdateAdminBoard = () => {
  const queryClient = useQueryClient()

  return useMutation<BoardResponse, Error, { boardNo: number; form: FormData }>({
    mutationFn: ({ boardNo, form }) => updateAdminBoard(boardNo, form),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'board', variables.boardNo] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'boards'] })
    },
  })
}

export const useDeleteAdminBoard = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, number>({
    mutationFn: (boardNo) => deleteAdminBoard(boardNo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'boards'] })
    },
  })
}

