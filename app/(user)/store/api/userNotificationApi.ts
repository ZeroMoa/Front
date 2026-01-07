import { fetchWithAuth } from '../../../../lib/common/api/fetchWithAuth';
import { UserNotificationResponse } from '@/types/notificationTypes';

const NOTIFICATION_BASE_PATH = '/notification/user';

export interface FetchUserNotificationsParams {
    page?: number;
    size?: number;
    sort?: string;
}

// 사용자 알림 목록 조회
export const getUserNotifications = async (): Promise<UserNotificationResponse[]> => {
    const response = await fetchWithAuth(NOTIFICATION_BASE_PATH, { method: 'GET' });
    return response.json();
};

// 특정 사용자 알림 상세 조회
export const getUserNotificationDetail = async (userNotificationNo: number): Promise<UserNotificationResponse> => {
    const response = await fetchWithAuth(`${NOTIFICATION_BASE_PATH}/${userNotificationNo}`, { method: 'GET' });
    return response.json();
};

// 사용자 알림 읽음 처리
export const markUserNotificationAsRead = async (userNotificationNo: number): Promise<void> => {
    await fetchWithAuth(`${NOTIFICATION_BASE_PATH}/${userNotificationNo}/read`, {
        method: 'PATCH',
    });
};

// 사용자 알림 삭제/숨김 처리
export const deleteUserNotification = async (userNotificationNo: number): Promise<void> => {
    await fetchWithAuth(`${NOTIFICATION_BASE_PATH}/${userNotificationNo}`, {
        method: 'DELETE',
    });
};

// 읽지 않은 알림 개수 조회
export const getUnreadNotificationCount = async (): Promise<number> => {
    const response = await fetchWithAuth(`${NOTIFICATION_BASE_PATH}/unread-count`, {
        method: 'GET',
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'Failed to fetch unread notification count.');
    }
    return response.json(); // 응답이 숫자형이므로 직접 반환
};

export const markAllUserNotificationsAsRead = async (): Promise<void> => {
    await fetchWithAuth(`${NOTIFICATION_BASE_PATH}/read-all`, {
        method: 'PATCH',
    });
};
