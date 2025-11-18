import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getUserNotifications,
    getUserNotificationDetail,
    markUserNotificationAsRead,
    deleteUserNotification,
    markAllUserNotificationsAsRead,
    // getUnreadNotificationCount, // 제거
} from '../store/api/userNotificationApi';
import { UserNotificationResponse } from '@/types/notificationTypes';

const queryOptions = {
    staleTime: 60 * 1000, // 1분 동안 캐시 유효
    gcTime: 5 * 60 * 1000, // 5분 후 가비지 컬렉션
    retry: 1, // 실패 시 1번만 재시도
    refetchOnWindowFocus: false, // 윈도우 포커스 시 재요청 비활성화
};

// 사용자 알림 목록 조회 hook
export const useUserNotifications = () => {
    const shouldFetch = typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true'

    return useQuery<UserNotificationResponse[], Error>({
        queryKey: ['userNotifications'],
        queryFn: getUserNotifications,
        ...queryOptions,
        enabled: shouldFetch,
        select: (data) => data.filter(notification => notification.isValid), // isValid가 true인 알림만 필터링
    });
};

// 특정 사용자 알림 상세 조회 hook
export const useUserNotificationDetail = (userNotificationNo: number) => {
    const shouldFetch = typeof window !== 'undefined' && localStorage.getItem('isLoggedIn') === 'true'

    return useQuery<UserNotificationResponse, Error>({
        queryKey: ['userNotification', userNotificationNo],
        queryFn: () => getUserNotificationDetail(userNotificationNo),
        ...queryOptions,
        enabled: shouldFetch && !!userNotificationNo, // 로그인되어 있고 userNotificationNo가 있을 때만 실행
    });
};

// 사용자 알림 읽음 처리 hook
export const useMarkNotificationAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation<{
        message: string
    }, Error, number>({
        mutationFn: markUserNotificationAsRead,
        onSuccess: (data, userNotificationNo) => {
            // 알림 목록 캐시 무효화 및 재요청
            queryClient.invalidateQueries({ queryKey: ['userNotifications'] });
            // 읽지 않은 알림 개수 캐시 무효화 및 재요청
            queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
            // 특정 알림 상세 정보 캐시 업데이트 (선택 사항)
            queryClient.setQueryData<UserNotificationResponse>(['userNotification', userNotificationNo], (oldData) => {
                if (oldData) {
                    return { ...oldData, isRead: true };
                }
                return oldData;
            });
        },
    });
};

// 사용자 알림 삭제/숨김 처리 hook
export const useDeleteUserNotification = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error, number>({
        mutationFn: deleteUserNotification,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userNotifications'] });
            queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
        },
    });
};

// 모든 사용자 알림 읽음 처리 hook
export const useMarkAllNotificationsAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation<void, Error>({
        mutationFn: markAllUserNotificationsAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userNotifications'] });
            queryClient.invalidateQueries({ queryKey: ['unreadNotificationCount'] });
        },
    });
};
