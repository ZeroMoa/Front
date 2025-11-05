import { fetchWithAuth } from './auth';
import { ProductResponse, normalizeProduct } from '@/types/product';

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_PRODUCT_API_BASE_URL || 'http://localhost:8080';

const FAVORITE_BASE_URL = `${API_BASE_URL.replace(/\/$/, '')}/favorites`;

export const FAVORITE_TOGGLE_COOLDOWN_MS = 500;

export interface ToggleFavoriteResponse {
    isFavorite: boolean;
    likesCount: number;
}

export interface FetchFavoriteListParams {
    page?: number;
    size?: number;
    sort?: string;
}

const buildFavoriteListQuery = ({ page = 0, size = 10, sort = 'createdDate,desc' }: FetchFavoriteListParams) => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('size', String(size));

    if (sort) {
        params.set('sort', sort);
    }

    return params;
};

const normalizeFavoriteResponse = (payload: any): ProductResponse => {
    const normalizedContent = Array.isArray(payload?.content)
        ? payload.content.map((item: Record<string, unknown>) => normalizeProduct(item))
        : [];

    return {
        ...payload,
        content: normalizedContent,
    } as ProductResponse;
};

export const toggleFavoriteProduct = async (productNo: number): Promise<ToggleFavoriteResponse> => {
    const response = await fetchWithAuth(`/favorites/toggle/${productNo}`, {
        method: 'POST',
    });

    if (!response.ok) {
        const errorBody = await response
            .json()
            .catch(async () => ({ message: await response.text().catch(() => response.statusText) }));

        const error = new Error((errorBody as { message?: string }).message || '좋아요 상태를 변경할 수 없습니다.');
        (error as Error & { status?: number }).status = response.status;
        throw error;
    }

    const payload = await response.json();

    const rawIsFavorite =
        payload?.isFavorite ??
        payload?.favorite ??
        payload?.is_valid ??
        payload?.isValid ??
        payload?.is_favorite;

    const rawLikesCount = payload?.likesCount ?? payload?.likes_count ?? payload?.count;

    return {
        isFavorite: Boolean(rawIsFavorite),
        likesCount: typeof rawLikesCount === 'number' ? rawLikesCount : Number(rawLikesCount ?? 0) || 0,
    };
};

export const fetchFavoriteProducts = async (
    params: FetchFavoriteListParams = {},
    init?: RequestInit,
): Promise<ProductResponse> => {
    const query = buildFavoriteListQuery(params);
    const endpoint = `/favorites/list?${query.toString()}`;
    const response = await fetchWithAuth(endpoint, {
        method: init?.method ?? 'GET',
        cache: init?.cache ?? 'no-store',
        ...init,
    });

    if (!response.ok) {
        const errorPayload = await response
            .json()
            .catch(async () => ({ message: await response.text().catch(() => response.statusText) }));

        console.error('[fetchFavoriteProducts] 요청 실패', {
            endpoint: API_BASE_URL ? `${API_BASE_URL}${endpoint}` : endpoint,
            status: response.status,
            statusText: response.statusText,
            payload: errorPayload,
        });

        throw new Error(`좋아요한 제품을 불러오지 못했습니다. (status: ${response.status})`);
    }

    const payload = await response.json();
    return normalizeFavoriteResponse(payload);
};
