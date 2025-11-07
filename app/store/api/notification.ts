import { UserNotificationResponse } from '@/types/notification';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// 모든 사용자 알림 목록 조회
export const getUserNotifications = async (): Promise<UserNotificationResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/notification/user`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'Failed to fetch user notifications.');
    }
    return response.json();
};

// 특정 사용자 알림 상세 조회
export const getUserNotificationDetail = async (userNotificationNo: number): Promise<UserNotificationResponse> => {
    const response = await fetch(`${API_BASE_URL}/notification/user/${userNotificationNo}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'Failed to fetch user notification detail.');
    }
    return response.json();
};

// 사용자 알림 읽음 처리
export const markUserNotificationAsRead = async (userNotificationNo: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/notification/user/${userNotificationNo}/read`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'Failed to mark notification as read.');
    }
    return response.json();
};

// 사용자 알림 삭제/숨김 처리
export const deleteUserNotification = async (userNotificationNo: number): Promise<{ message: string }> => {
    const response = await fetch(`${API_BASE_URL}/notification/user/${userNotificationNo}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'Failed to delete notification.');
    }
    return response.json();
};

// 읽지 않은 알림 개수 조회
export const getUnreadNotificationCount = async (): Promise<number> => {
    const response = await fetch(`${API_BASE_URL}/notification/user/unread-count`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || 'Failed to fetch unread notification count.');
    }
    return response.json(); // 응답이 숫자형이므로 직접 반환
};
