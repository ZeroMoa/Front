import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAdminNotification,
  deleteAdminNotification,
  fetchAdminNotifications,
  updateAdminNotification,
  updateAdminNotificationStatus,
  type AdminNotificationPage,
  type AdminNotificationStatusPayload,
  type AdminNotificationUpdatePayload,
} from '../store/api/notification'
import type { AdminNotificationResponse } from '@/types/notification'

type CreateNotificationVariables = {
  boardNo: number
  sendToAllUsers?: boolean
}

type UpdateNotificationVariables = {
  adminNotificationNo: number
  data: AdminNotificationUpdatePayload
}

type UpdateStatusVariables = {
  adminNotificationNo: number
  data: AdminNotificationStatusPayload
}

type DeleteNotificationVariables = number

export const useAdminNotifications = (params: URLSearchParams) => {
  const queryKey = ['adminNotifications', params.toString()]

  return useQuery<AdminNotificationPage, Error>({
    queryKey,
    queryFn: () => fetchAdminNotifications(params),
    placeholderData: (previousData) => previousData,
  })
}

export const useCreateAdminNotification = () => {
  const queryClient = useQueryClient()

  return useMutation<AdminNotificationResponse, Error, CreateNotificationVariables>({
    mutationFn: ({ boardNo, sendToAllUsers = true }) => createAdminNotification({ boardNo, sendToAllUsers }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNotifications'] })
    },
  })
}

export const useUpdateAdminNotification = () => {
  const queryClient = useQueryClient()

  return useMutation<AdminNotificationResponse, Error, UpdateNotificationVariables>({
    mutationFn: ({ adminNotificationNo, data }) => updateAdminNotification(adminNotificationNo, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminNotifications'] })
      queryClient.invalidateQueries({ queryKey: ['adminNotification', variables.adminNotificationNo] })
    },
  })
}

export const useUpdateAdminNotificationStatus = () => {
  const queryClient = useQueryClient()

  return useMutation<AdminNotificationResponse, Error, UpdateStatusVariables>({
    mutationFn: ({ adminNotificationNo, data }) =>
      updateAdminNotificationStatus(adminNotificationNo, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNotifications'] })
    },
  })
}

export const useDeleteAdminNotification = () => {
  const queryClient = useQueryClient()

  return useMutation<void, Error, DeleteNotificationVariables>({
    mutationFn: (adminNotificationNo) => deleteAdminNotification(adminNotificationNo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminNotifications'] })
    },
  })
}
