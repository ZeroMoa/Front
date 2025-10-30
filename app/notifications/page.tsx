'use client'

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';
import { useUserNotifications, useMarkNotificationAsRead, useDeleteUserNotification } from '../hooks/useNotification';
import { UserNotificationResponse } from '../../types/notification';

export default function NotificationsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const userNotificationNoFromUrl = searchParams.get('userNotificationNo');

    const { data: notifications, isLoading, error, refetch } = useUserNotifications();
    const markAsReadMutation = useMarkNotificationAsRead();
    const deleteNotificationMutation = useDeleteUserNotification();

    const [activeTab, setActiveTab] = useState('all'); // 'all', 'read', 'unread'
    const [displayedNotifications, setDisplayedNotifications] = useState<UserNotificationResponse[]>([]);

    useEffect(() => {
        if (notifications) {
            let filtered = notifications;
            if (activeTab === 'read') {
                filtered = notifications.filter(n => n.isRead);
            } else if (activeTab === 'unread') {
                filtered = notifications.filter(n => !n.isRead);
            }
            setDisplayedNotifications(filtered);
        }
    }, [notifications, activeTab]);

    // URL 파라미터로 특정 알림이 지정된 경우, 해당 알림으로 스크롤 및 읽음 처리
    useEffect(() => {
        if (userNotificationNoFromUrl && notifications) {
            const targetId = parseInt(userNotificationNoFromUrl);
            const targetNotification = notifications.find(n => n.userNotificationNo === targetId);

            if (targetNotification && !targetNotification.isRead) {
                markAsReadMutation.mutate(targetId, {
                    onSuccess: () => {
                        refetch(); // 읽음 처리 후 목록 새로고침
                    }
                });
            }

            // 스크롤은 클라이언트 렌더링 후에 실행될 수 있도록 잠시 지연
            const timer = setTimeout(() => {
                const element = document.getElementById(`notification-${targetId}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [userNotificationNoFromUrl, notifications, markAsReadMutation, refetch]);

    const handleNotificationClick = (userNotificationNo: number) => {
        markAsReadMutation.mutate(userNotificationNo, {
            onSuccess: () => {
                router.push(`/notifications?userNotificationNo=${userNotificationNo}`); // URL 업데이트
                refetch(); // 읽음 처리 후 목록 새로고침
            }
        });
    };

    const handleDeleteNotification = (userNotificationNo: number) => {
        if (window.confirm('이 알림을 삭제하시겠습니까?')) {
            deleteNotificationMutation.mutate(userNotificationNo, {
                onSuccess: () => {
                    alert('알림이 삭제되었습니다.');
                    refetch(); // 삭제 후 목록 새로고침
                },
                onError: (err) => {
                    alert(`알림 삭제 실패: ${err.message}`);
                }
            });
        }
    };

    if (isLoading) return <p className={styles.loading}>알림을 불러오는 중입니다...</p>;
    if (error) return <p className={styles.noNotifications}>알림을 불러오는데 실패했습니다: {error.message}</p>;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1>최근 알림</h1>
                {/* <button className={styles.settingsButton}>⚙️</button> */}
            </div>
            <div className={styles.tabNav}>
                <button 
                    className={`${styles.tabButton} ${activeTab === 'all' ? styles.active : ''}`}
                    onClick={() => setActiveTab('all')}
                >
                    전체
                </button>
                <button 
                    className={`${styles.tabButton} ${activeTab === 'read' ? styles.active : ''}`}
                    onClick={() => setActiveTab('read')}
                >
                    읽은 알림
                </button>
                <button 
                    className={`${styles.tabButton} ${activeTab === 'unread' ? styles.active : ''}`}
                    onClick={() => setActiveTab('unread')}
                >
                    읽지 않은 알림
                </button>
                {/* <button className={styles.markAllReadButton}>모두 읽기</button> */}
            </div>

            <div className={styles.notificationList}>
                {displayedNotifications.length === 0 ? (
                    <p className={styles.noNotifications}>표시할 알림이 없습니다.</p>
                ) : (
                    displayedNotifications.map((notification) => (
                        <div 
                            key={notification.userNotificationNo}
                            id={`notification-${notification.userNotificationNo}`}
                            className={`${styles.notificationItem} ${notification.isRead ? styles.read : ''}`}
                        >
                            {/* 알림 타입에 따른 아이콘 (필요시 추가) */}
                            <Image src="/images/bell.png" alt="알림 아이콘" width={40} height={40} className={styles.notificationIcon} />
                            <div className={styles.notificationText}>
                                <h2 className={styles.notificationTitle}>{notification.title}</h2>
                                <p className={styles.notificationContent}>{notification.content}</p>
                                <span className={styles.notificationTimestamp}>{new Date(notification.createdDate).toLocaleString()}</span>
                            </div>
                            <div className={styles.notificationActions}>
                                {!notification.isRead && (
                                    <button onClick={(e) => { e.stopPropagation(); handleNotificationClick(notification.userNotificationNo); }} className={styles.markAsReadButton}>
                                        읽음
                                    </button>
                                )}
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteNotification(notification.userNotificationNo); }} className={styles.deleteButton}>
                                    삭제
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
