import { fetchWithAuth } from '@/lib/api/fetchWithAuth'

const ADMIN_NOTIFICATION_PATH = '/admin/notifications'

type AdminNotificationRequest = {
  boardNo: number
  sendToAllUsers?: boolean
}

type AdminNotificationResponse = {
  adminNotificationNo: number
  boardNo: number
  title: string
  content: string
  sendToAllUsers: boolean
  createdAt: string
}

export async function createAdminNotification(
  payload: AdminNotificationRequest
): Promise<AdminNotificationResponse> {
  const response = await fetchWithAuth(ADMIN_NOTIFICATION_PATH, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.json()
}
