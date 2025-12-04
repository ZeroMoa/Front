interface UserNotificationResponse {
    userNotificationNo: number;
    adminNotificationNo: number;
    boardNo: number; // boardNo 추가
    title: string;
    content: string;
    sentAt: string;
    isAdminNotificationActive: boolean;
    isRead: boolean;
    readAt: string | null;
    isValid: boolean;
    createdDate: string;
}

interface AdminNotificationResponse {
    adminNotificationNo: number;
    boardNo: number; // boardNo 추가
    boardTitle?: string | null;
    title: string;
    content: string;
    sentAt: string;
    isActive: boolean;
    createdDate: string;
    updatedDate: string;
}

export type {
    UserNotificationResponse,
    AdminNotificationResponse
};
