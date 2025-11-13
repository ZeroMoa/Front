import { useMemo } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchBoards,
  fetchBoardDetail,
  createBoard,
  updateBoard,
  deleteBoard,
  searchBoards,
} from '../store/api/board'

export const useBoards = (params: URLSearchParams, options?: { search?: boolean }) => {
  const queryKey = useMemo(
    () => ['boards', options?.search ? 'search' : 'list', params.toString()],
    [params, options?.search]
  )

  return useQuery({
    queryKey,
    queryFn: () => (options?.search ? searchBoards(params) : fetchBoards(params)),
    placeholderData: (previousData) => previousData,
  })
}

export const useBoardDetail = (boardNo: number) => {
  return useQuery({
    queryKey: ['board', boardNo],
    queryFn: () => fetchBoardDetail(boardNo),
    enabled: !!boardNo,
  })
}

export const useCreateBoard = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] })
    },
  })
}

export const useUpdateBoard = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ boardNo, form }: { boardNo: number; form: FormData }) => updateBoard(boardNo, form),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['board', variables.boardNo] })
      queryClient.invalidateQueries({ queryKey: ['boards'] })
    },
  })
}

export const useDeleteBoard = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteBoard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boards'] })
    },
  })
}

