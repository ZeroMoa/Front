import { cookies } from 'next/headers';
import { ProductResponse, normalizeProduct } from '@/types/product';
import type { NutritionSlug } from '@/product/config';

const PRODUCT_API_BASE_URL =
    process.env.NEXT_PUBLIC_PRODUCT_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const normalizeProductResponse = (payload: any): ProductResponse => {
    const normalizedContent = Array.isArray(payload?.content)
        ? payload.content.map((item: Record<string, unknown>) => normalizeProduct(item))
        : [];

    return {
        ...payload,
        content: normalizedContent,
    } as ProductResponse;
};

export interface FetchCategoryProductsParams {
    categoryNo: number;
    page?: number;
    size?: number;
    sort?: string;
    filters?: {
        isZeroCalorie?: boolean;
        isZeroSugar?: boolean;
        isLowCalorie?: boolean;
        isLowSugar?: boolean;
    };
}

const buildCategoryQuery = ({
    page = 0,
    size = 30,
    sort = 'productName,asc',
    filters = {},
}: Omit<FetchCategoryProductsParams, 'categoryNo'>) => {
    const query = new URLSearchParams();
    query.set('page', String(page));
    query.set('size', String(size));
    query.set('sort', sort);

    (Object.entries(filters) as Array<[keyof FetchCategoryProductsParams['filters'], boolean | undefined]>).forEach(
        ([key, value]) => {
            if (value) {
                query.set(key, 'true');
            }
        },
    );

    return query;
};

export async function fetchCategoryProducts(
    params: FetchCategoryProductsParams,
    init?: RequestInit,
): Promise<ProductResponse> {
    const { categoryNo, ...rest } = params;
    const query = buildCategoryQuery(rest);
    const endpoint = `${PRODUCT_API_BASE_URL.replace(/\/$/, '')}/product/category/${categoryNo}?${query.toString()}`;

    let accessToken: string | undefined;
    let serializedCookies: string | undefined;

    try {
        const cookieStore = await cookies();
        accessToken = cookieStore.get('accessToken')?.value;
        const allCookies = cookieStore.getAll();
        serializedCookies = allCookies.length > 0 ? allCookies.map(({ name, value }) => `${name}=${value}`).join('; ') : undefined;
    } catch (error) {
        console.warn('[fetchCategoryProducts] cookies() 호출 실패, 비인증 요청으로 진행합니다.', error);
    }

    const authResponse = await fetch(endpoint, {
        cache: init?.cache ?? 'no-store',
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(serializedCookies ? { Cookie: serializedCookies } : {}),
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
            ...(init?.headers ?? {}),
        },
        credentials: 'include',
    });

    const response =
        authResponse.status === 401
            ? await fetch(endpoint, {
                  cache: init?.cache ?? 'no-store',
                  ...init,
                  headers: {
                      'Content-Type': 'application/json',
                      ...(init?.headers ?? {}),
                  },
                  credentials: 'omit',
              })
            : authResponse;

    if (!response.ok) {
        const errorPayload = await response
            .json()
            .catch(async () => ({ message: await response.text().catch(() => response.statusText) }));

        console.error('[fetchCategoryProducts] 요청 실패', {
            endpoint,
            status: response.status,
            statusText: response.statusText,
            payload: errorPayload,
        });

        throw new Error(`제품 목록 조회에 실패했습니다. (status: ${response.status})`);
    }

    const payload = await response.json();
    return normalizeProductResponse(payload);
}

interface FetchNutritionProductsParams {
    page?: number;
    size?: number;
    sort?: string;
    keyword?: string;
}

const buildNutritionQuery = ({ page = 0, size = 30, sort = 'productName,asc', keyword }: FetchNutritionProductsParams) => {
    const query = new URLSearchParams();
    query.set('page', String(page));
    query.set('size', String(size));
    query.set('sort', sort);

    if (keyword) {
        query.set('keyword', keyword);
    }

    return query;
};

export async function fetchNutritionProducts(
    nutritionSlug: NutritionSlug,
    params: FetchNutritionProductsParams,
    init?: RequestInit,
): Promise<ProductResponse> {
    const query = buildNutritionQuery(params);
    const endpoint = `${PRODUCT_API_BASE_URL.replace(/\/$/, '')}/product/${nutritionSlug}?${query.toString()}`;

    const response = await fetch(endpoint, {
        cache: init?.cache ?? 'no-store',
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers ?? {}),
        },
        credentials: 'omit',
    });

    if (!response.ok) {
        const errorPayload = await response
            .json()
            .catch(async () => ({ message: await response.text().catch(() => response.statusText) }));

        console.error('[fetchNutritionProducts] 요청 실패', {
            endpoint,
            status: response.status,
            statusText: response.statusText,
            payload: errorPayload,
        });

        throw new Error(`영양 기준 제품 조회에 실패했습니다. (status: ${response.status})`);
    }

    const payload = await response.json();
    return normalizeProductResponse(payload);
}

export interface FetchProductSearchParams {
    query?: string;
    categoryNo?: number;
    companyName?: string;
    page?: number;
    size?: number;
    sort?: string;
    filters?: {
        isZeroCalorie?: boolean;
        isZeroSugar?: boolean;
        isLowCalorie?: boolean;
        isLowSugar?: boolean;
    };
}

const buildSearchQuery = ({
    query,
    categoryNo,
    companyName,
    page = 0,
    size = 30,
    sort = 'productName,asc',
    filters = {},
}: FetchProductSearchParams) => {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('size', String(size));
    params.set('sort', sort);

    if (query) {
        params.set('q', query);
    }

    if (typeof categoryNo === 'number') {
        params.set('categoryNo', String(categoryNo));
    }

    if (companyName) {
        params.set('companyName', companyName);
    }

    (Object.entries(filters) as Array<[keyof FetchProductSearchParams['filters'], boolean | undefined]>).forEach(
        ([key, value]) => {
            if (value) {
                params.set(key, 'true');
            }
        },
    );

    return params;
};

export async function fetchProductSearch(
    params: FetchProductSearchParams,
    init?: RequestInit,
): Promise<ProductResponse> {
    const query = buildSearchQuery(params);
    const endpoint = `${PRODUCT_API_BASE_URL.replace(/\/$/, '')}/product/search?${query.toString()}`;

    const response = await fetch(endpoint, {
        cache: init?.cache ?? 'no-store',
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers ?? {}),
        },
        credentials: 'omit',
    });

    if (!response.ok) {
        const errorPayload = await response
            .json()
            .catch(async () => ({ message: await response.text().catch(() => response.statusText) }));

        console.error('[fetchProductSearch] 요청 실패', {
            endpoint,
            status: response.status,
            statusText: response.statusText,
            payload: errorPayload,
        });

        throw new Error(`제품 검색에 실패했습니다. (status: ${response.status})`);
    }

    const payload = await response.json();
    return normalizeProductResponse(payload);
}

