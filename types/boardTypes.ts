export interface BoardAttachment {
    attachmentNo: number;
    originalName: string;
    storedPath: string;
    fileSize: number;
}

export type BoardType = 'NOTICE' | 'FAQ' | 'EVENT';
export type BoardSearchType = 'TITLE' | 'CONTENT' | 'TITLE_OR_CONTENT';

export interface BoardResponse {
    boardNo: number;
    boardType: BoardType;
    title: string;
    content: string;
    authorId: number;
    authorNickname?: string;
    authorUsername?: string;
    createdAt: string;
    updatedAt: string;
    attachments: BoardAttachment[];
    prevBoardNo?: number | null;
    prevBoardTitle?: string | null;
    nextBoardNo?: number | null;
    nextBoardTitle?: string | null;
}

export interface BoardListResponse {
    content: BoardResponse[];
    totalPages: number;
    totalElements: number;
    number: number;
    size: number;
    first: boolean;
    last: boolean;
    numberOfElements: number;
    empty: boolean;
}

