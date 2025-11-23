import { BoardType, BoardSearchType } from '../types/boardTypes';

export const BOARD_TYPE_LABELS: Record<BoardType, string> = {
    NOTICE: '공지사항',
    FAQ: 'FAQ',
    EVENT: '이벤트',
};

export const BOARD_TYPE_OPTIONS: BoardType[] = ['NOTICE', 'FAQ', 'EVENT'];

export const BOARD_SEARCH_TYPE_OPTIONS: { value: BoardSearchType; label: string }[] = [
    { value: 'TITLE_OR_CONTENT', label: '제목+내용' },
    { value: 'TITLE', label: '제목' },
    { value: 'CONTENT', label: '내용' },
];

export const BOARD_PAGE_SIZE = 10;
export const BOARD_DEFAULT_SORT = 'boardNo,desc';
export const BOARD_MAX_VISIBLE_PAGES = 7;

