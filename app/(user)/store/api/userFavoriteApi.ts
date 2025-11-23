import { fetchWithAuth } from '../../../../lib/common/api/fetchWithAuth';
import { ProductResponse, normalizeProduct } from '@/types/productTypes';

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_PRODUCT_API_BASE_URL || 'http://localhost:8080';

const FAVORITE_BASE_URL = `${API_BASE_URL.replace(/\/$/, '')}/favorites`;

export const FAVORITE_TOGGLE_COOLDOWN_MS = 500;

export interface ToggleFavoriteResponse {
    isFavorite?: boolean;
    likesCount?: number;
}

export interface FetchFavoriteListParams {
    page?: number;
    size?: number;
    sort?: string;
}

const buildFavoriteListQuery = ({ page = 0, size = 20, sort = 'createdDate,desc' }: FetchFavoriteListParams) => {
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

    const responseBody = await response.json();

    const rawIsFavorite =
        responseBody?.isFavorite ??
        responseBody?.favorite ??
        responseBody?.is_valid ??
        responseBody?.isValid ??
        responseBody?.is_favorite;

    const rawLikesCount = responseBody?.likesCount ?? responseBody?.likes_count ?? responseBody?.count;

    const parseBoolean = (value: unknown): boolean | undefined => {
        if (value === null || typeof value === 'undefined') {
            return undefined;
        }
        if (typeof value === 'boolean') {
            return value;
        }
        if (typeof value === 'number') {
            return value !== 0;
        }
        if (typeof value === 'string') {
            const normalized = value.trim().toLowerCase();
            if (['true', '1', 'y', 'yes', 't'].includes(normalized)) {
                return true;
            }
            if (['false', '0', 'n', 'no', 'f'].includes(normalized)) {
                return false;
            }
        }
        return undefined;
    };

    const parseNumber = (value: unknown): number | undefined => {
        if (value === null || typeof value === 'undefined') {
            return undefined;
        }
        if (typeof value === 'number') {
            return value;
        }
        if (typeof value === 'string') {
            const sanitized = value.replace(/,/g, '').trim();
            if (!sanitized) {
                return undefined;
            }
            const parsed = Number(sanitized);
            return Number.isNaN(parsed) ? undefined : parsed;
        }
        return undefined;
    };

    const normalizedIsFavorite = parseBoolean(rawIsFavorite);
    const normalizedLikesCount = parseNumber(rawLikesCount);

    const normalizedResult: ToggleFavoriteResponse = {};

    if (typeof normalizedIsFavorite === 'boolean') {
        normalizedResult.isFavorite = normalizedIsFavorite;
    }

    if (typeof normalizedLikesCount === 'number' && !Number.isNaN(normalizedLikesCount)) {
        normalizedResult.likesCount = normalizedLikesCount;
    }

    return normalizedResult;
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
