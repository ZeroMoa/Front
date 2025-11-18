import { fetchWithAuth } from '@/lib/common/api/fetchWithAuth'
import { AdminNotificationResponse } from '@/types/notificationTypes'

const ADMIN_NOTIFICATION_PATH = '/admin/notifications'

export type AdminNotificationPage = {
  content: AdminNotificationResponse[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export type AdminNotificationUpdatePayload = {
  title: string
  content: string
  boardNo: number
}

export type AdminNotificationStatusPayload = {
  isActive: boolean
}

function normalizeAdminNotification(raw: any): AdminNotificationResponse {
  return {
    adminNotificationNo: raw.adminNotificationNo ?? raw.admin_notification_no ?? 0,
    boardNo: raw.boardNo ?? raw.board_no ?? 0,
    title: raw.title ?? '',
    content: raw.content ?? '',
    sentAt: raw.sentAt ?? raw.sent_at ?? '',
    isActive: raw.isActive ?? raw.is_active ?? false,
    createdDate: raw.createdDate ?? raw.created_date ?? '',
    updatedDate: raw.updatedDate ?? raw.updated_date ?? '',
  }
}

export async function fetchAdminNotifications(params: URLSearchParams): Promise<AdminNotificationPage> {
  const query = params.toString()
  const endpoint = query ? `${ADMIN_NOTIFICATION_PATH}?${query}` : ADMIN_NOTIFICATION_PATH
  const response = await fetchWithAuth(endpoint)
  const payload = await response.json()
  const normalizedContent = Array.isArray(payload?.content)
    ? payload.content.map((item: unknown) => normalizeAdminNotification(item))
    : []

  return {
    content: normalizedContent,
    totalElements: payload?.totalElements ?? payload?.total_elements ?? 0,
    totalPages: payload?.totalPages ?? payload?.total_pages ?? 0,
    number: payload?.number ?? payload?.page ?? 0,
    size: Number(payload?.size ?? payload?.pageSize ?? params.get('size') ?? 0),
  }
}

type AdminNotificationCreatePayload = {
  boardNo: number
  sendToAllUsers?: boolean
}

export async function createAdminNotification(
  payload: AdminNotificationCreatePayload
): Promise<AdminNotificationResponse> {
  const response = await fetchWithAuth(ADMIN_NOTIFICATION_PATH, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  const data = await response.json()
  return normalizeAdminNotification(data)
}

export async function updateAdminNotification(
  adminNotificationNo: number,
  payload: AdminNotificationUpdatePayload
): Promise<AdminNotificationResponse> {
  const response = await fetchWithAuth(`${ADMIN_NOTIFICATION_PATH}/${adminNotificationNo}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

  const data = await response.json()
  return normalizeAdminNotification(data)
}

export async function updateAdminNotificationStatus(
  adminNotificationNo: number,
  payload: AdminNotificationStatusPayload
): Promise<AdminNotificationResponse> {
  const response = await fetchWithAuth(`${ADMIN_NOTIFICATION_PATH}/${adminNotificationNo}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })

  const data = await response.json()
  return normalizeAdminNotification(data)
}

export async function deleteAdminNotification(adminNotificationNo: number): Promise<void> {
  await fetchWithAuth(`${ADMIN_NOTIFICATION_PATH}/${adminNotificationNo}`, {
    method: 'DELETE',
  })
}
