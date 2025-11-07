import { BoardListResponse, BoardResponse } from '../../../types/board';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const fetchBoards = async (params: URLSearchParams): Promise<BoardListResponse> => {
    const response = await fetch(`${API_BASE_URL}/board?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || '게시글 목록 조회에 실패했습니다.');
    }

    return response.json();
};

export const fetchBoardDetail = async (boardNo: number): Promise<BoardResponse> => {
    const response = await fetch(`${API_BASE_URL}/board/${boardNo}`, {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('존재하지 않는 게시글입니다.');
        }
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || '게시글 상세 조회에 실패했습니다.');
    }

    return response.json();
};

export const createBoard = async (form: FormData): Promise<BoardResponse> => {
    const response = await fetch(`${API_BASE_URL}/board`, {
        method: 'POST',
        credentials: 'include',
        body: form,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || '게시글 작성에 실패했습니다.');
    }

    return response.json();
};

export const updateBoard = async (boardNo: number, form: FormData): Promise<BoardResponse> => {
    const response = await fetch(`${API_BASE_URL}/board/${boardNo}`, {
        method: 'PATCH',
        credentials: 'include',
        body: form,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || '게시글 수정에 실패했습니다.');
    }

    return response.json();
};

export const deleteBoard = async (boardNo: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/board/${boardNo}`, {
        method: 'DELETE',
        credentials: 'include',
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || '게시글 삭제에 실패했습니다.');
    }
};

export const searchBoards = async (params: URLSearchParams): Promise<BoardListResponse> => {
    const response = await fetch(`${API_BASE_URL}/board/search?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || '게시글 검색에 실패했습니다.');
    }

    return response.json();
};

