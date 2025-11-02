import { BoardType, BoardSearchType } from '../types/board';

export const BOARD_TYPE_LABELS: Record<BoardType, string> = {
    NOTICE: '공지사항',
    FREE: '자유게시판',
    QNA: 'Q&A',
};

export const BOARD_TYPE_OPTIONS: BoardType[] = ['NOTICE', 'FREE', 'QNA'];

export const BOARD_SEARCH_TYPE_OPTIONS: { value: BoardSearchType; label: string }[] = [
    { value: 'TITLE_OR_CONTENT', label: '제목+내용' },
    { value: 'TITLE', label: '제목' },
    { value: 'CONTENT', label: '내용' },
];

