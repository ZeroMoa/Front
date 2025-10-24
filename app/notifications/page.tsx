'use client'

import React, { useState } from 'react';
import styles from './page.module.css';
import Image from 'next/image';

interface Notification {
    id: number;
    type: 'order' | 'event' | 'new_item';
    message: string;
    isRead: boolean;
    timestamp: string;
    imageUrl?: string;
    title: string;
    content: string;
}

const dummyNotifications: Notification[] = [
    {
        id: 1,
        type: 'order',
        title: '주문 배송 시작',
        message: '주문하신 상품이 배송을 시작했습니다.',
        isRead: false,
        timestamp: '2025-10-20T10:00:00Z',
        imageUrl: '/images/delivery.png',
        content: '제로모아에서 주문하신 [상품명] 외 1건이 배송을 시작했습니다. 마이페이지에서 배송 현황을 확인하세요.'
    },
    {
        id: 2,
        type: 'event',
        title: '새로운 이벤트 시작',
        message: '새로운 이벤트가 시작되었습니다! 지금 확인하세요.',
        isRead: true,
        timestamp: '2025-10-19T14:30:00Z',
        imageUrl: '/images/event.png',
        content: '놓칠 수 없는 특별한 할인 이벤트! 지금 바로 참여하고 푸짐한 혜택을 받아가세요.'
    },
    {
        id: 3,
        type: 'new_item',
        title: '신상품 출시',
        message: '새로운 상품이 등록되었습니다: 고구마 스틱.',
        isRead: false,
        timestamp: '2025-10-18T09:15:00Z',
        imageUrl: '/images/new_item.png',
        content: '오늘의 신상품 [고구마 스틱]이 출시되었습니다. 지금 바로 만나보세요!'
    },
    {
        id: 4,
        type: 'order',
        title: '배송 완료',
        message: '주문하신 상품이 성공적으로 배송 완료되었습니다.',
        isRead: true,
        timestamp: '2025-10-17T18:00:00Z',
        imageUrl: '/images/delivery.png',
        content: '제로모아에서 주문하신 [상품명]이 안전하게 배송 완료되었습니다. 이용해주셔서 감사합니다.'
    },
    {
        id: 5,
        type: 'event',
        title: '할인쿠폰 발급',
        message: '할인쿠폰이 발급되었습니다! 마이페이지에서 확인하세요.',
        isRead: false,
        timestamp: '2025-10-16T11:00:00Z',
        imageUrl: '/images/coupon.png',
        content: '회원님을 위한 특별 할인 쿠폰이 발급되었습니다. 마이페이지 > 내 쿠폰함에서 확인하세요.'
    },
];

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>(dummyNotifications);
    const [filter, setFilter] = useState<'all' | 'read' | 'unread'>('all');
    const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);

    const filteredNotifications = notifications.filter(notif => {
        if (filter === 'read') return notif.isRead;
        if (filter === 'unread') return !notif.isRead;
        return true;
    });

    const handleToggleRead = (id: number) => {
        setNotifications(prev =>
            prev.map(notif =>
                notif.id === id ? { ...notif, isRead: !notif.isRead } : notif
            )
        );
    };

    const handleSelectNotification = (id: number) => {
        setSelectedNotifications(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedNotifications.length === filteredNotifications.length) {
            setSelectedNotifications([]);
        } else {
            setSelectedNotifications(filteredNotifications.map(notif => notif.id));
        }
    };

    const handleMarkSelectedAsRead = () => {
        setNotifications(prev =>
            prev.map(notif =>
                selectedNotifications.includes(notif.id) ? { ...notif, isRead: true } : notif
            )
        );
        setSelectedNotifications([]);
    };

    const handleDeleteSelected = () => {
        setNotifications(prev =>
            prev.filter(notif => !selectedNotifications.includes(notif.id))
        );
        setSelectedNotifications([]);
    };

    return (
        <div className={styles.container}>
            <h1 className={styles.pageTitle}>알림</h1>
            <div className={styles.controls}>
                <div className={styles.filterButtons}>
                    <button
                        className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
                        onClick={() => setFilter('all')}
                    >
                        전체
                    </button>
                    <button
                        className={`${styles.filterButton} ${filter === 'unread' ? styles.active : ''}`}
                        onClick={() => setFilter('unread')}
                    >
                        안 읽은 알림
                    </button>
                    <button
                        className={`${styles.filterButton} ${filter === 'read' ? styles.active : ''}`}
                        onClick={() => setFilter('read')}
                    >
                        읽은 알림
                    </button>
                </div>
                <div className={styles.actionButtons}>
                    <button onClick={handleSelectAll} className={styles.actionButton}>
                        {selectedNotifications.length === filteredNotifications.length ? '선택 해제' : '모두 선택'}
                    </button>
                    <button onClick={handleMarkSelectedAsRead} className={styles.actionButton} disabled={selectedNotifications.length === 0}>
                        선택 읽음 처리
                    </button>
                    <button onClick={handleDeleteSelected} className={styles.actionButton} disabled={selectedNotifications.length === 0}>
                        선택 삭제
                    </button>
                </div>
            </div>

            <div className={styles.notificationList}>
                {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => (
                        <div key={notification.id} className={`${styles.notificationItem} ${notification.isRead ? styles.read : ''}`}>
                            <input
                                type="checkbox"
                                checked={selectedNotifications.includes(notification.id)}
                                onChange={() => handleSelectNotification(notification.id)}
                                className={styles.checkbox}
                            />
                            {notification.imageUrl && (
                                <Image src={notification.imageUrl} alt="알림 아이콘" width={48} height={48} className={styles.notificationImage} />
                            )}
                            <div className={styles.notificationDetails}>
                                <h3 className={styles.notificationTitle}>{notification.title}</h3>
                                <p className={styles.notificationContent}>{notification.content}</p>
                                <span className={styles.notificationTimestamp}>{new Date(notification.timestamp).toLocaleString()}</span>
                                <button onClick={() => handleToggleRead(notification.id)} className={styles.markAsReadButton}>
                                    {notification.isRead ? '안 읽음으로 표시' : '읽음으로 표시'}
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className={styles.noNotifications}>알림이 없습니다.</p>
                )}
            </div>
        </div>
    );
}
