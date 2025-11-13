import { useMutation } from '@tanstack/react-query'
import { createAdminNotification } from '../store/api/notification'

type CreateNotificationVariables = {
  boardNo: number
  sendToAllUsers?: boolean
}

export const useCreateAdminNotification = () => {
  return useMutation({
    mutationFn: ({ boardNo, sendToAllUsers = true }: CreateNotificationVariables) =>
      createAdminNotification({ boardNo, sendToAllUsers }),
  })
}
