import Cookies from 'js-cookie';
import { BoardListResponse, BoardResponse } from '../../../types/board';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

const getAccessToken = () => Cookies.get('accessToken');

const buildAuthHeaders = (includeJson = true) => {
    const token = getAccessToken();
    const headers: HeadersInit = {};

    if (includeJson) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
};

export const fetchBoards = async (params: URLSearchParams): Promise<BoardListResponse> => {
    const response = await fetch(`${API_BASE_URL}/board?${params.toString()}`, {
        method: 'GET',
        credentials: 'include',
        headers: buildAuthHeaders(),
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
        headers: buildAuthHeaders(),
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
    const token = getAccessToken();
    if (!token) {
        throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/board`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: form,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || '게시글 작성에 실패했습니다.');
    }

    return response.json();
};

export const updateBoard = async (boardNo: number, form: FormData): Promise<BoardResponse> => {
    const token = getAccessToken();
    if (!token) {
        throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/board/${boardNo}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: form,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || '게시글 수정에 실패했습니다.');
    }

    return response.json();
};

export const deleteBoard = async (boardNo: number): Promise<void> => {
    const token = getAccessToken();
    if (!token) {
        throw new Error('로그인이 필요합니다.');
    }

    const response = await fetch(`${API_BASE_URL}/board/${boardNo}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            Authorization: `Bearer ${token}`,
        },
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
        headers: buildAuthHeaders(),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || '게시글 검색에 실패했습니다.');
    }

    return response.json();
};

