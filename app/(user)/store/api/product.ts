import { ProductResponse, Product, normalizeProduct } from '@/types/product';
import type { NutritionSlug } from '@/app/product/config';

const PRODUCT_API_BASE_URL =
    process.env.NEXT_PUBLIC_PRODUCT_API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

const hasProductImage = (product: Product): boolean => {
    const url = product.imageUrl?.trim();
    if (!url) {
        return false;
    }
    const lowerUrl = url.toLowerCase();
    if (
        lowerUrl.endsWith('/default-product.png') ||
        lowerUrl.includes('default-product.png') ||
        lowerUrl.includes('default-product')
    ) {
        return false;
    }
    return true;
};

const normalizeProductResponse = (payload: any): ProductResponse => {
    const rawContent = Array.isArray(payload?.content) ? payload.content : [];
    const normalizedContent = rawContent
        .map((item: Record<string, unknown>) => normalizeProduct(item))
        .filter((product) => hasProductImage(product));

    const filteredCount = rawContent.length - normalizedContent.length;
    const totalElements =
        typeof payload?.totalElements === 'number'
            ? Math.max(0, payload.totalElements - filteredCount)
            : payload?.totalElements;

    return {
        ...payload,
        content: normalizedContent,
        numberOfElements: normalizedContent.length,
        totalElements,
        empty: normalizedContent.length === 0,
    } as ProductResponse;
};

export interface FetchCategoryProductsParams {
    categoryNo: number;
    page?: number;
    size?: number;
    sort?: string;
    isNew?: boolean;
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
    isNew,
    filters = {},
}: Omit<FetchCategoryProductsParams, 'categoryNo'>) => {
    const query = new URLSearchParams();
    query.set('page', String(page));
    query.set('size', String(size));
    query.set('sort', sort);

    if (typeof isNew === 'boolean') {
        query.set('isNew', String(isNew));
    }

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

    if (typeof window === 'undefined') {
        try {
            const { cookies } = await import('next/headers');
            const cookieStore = await cookies();
            accessToken = cookieStore.get('accessToken')?.value;
            const allCookies = cookieStore.getAll();
            serializedCookies =
                allCookies.length > 0
                    ? allCookies.map(({ name, value }) => `${name}=${value}`).join('; ')
                    : undefined;
        } catch (error) {
            console.warn('[fetchCategoryProducts] cookies() 호출 실패, 비인증 요청으로 진행합니다.', error);
        }
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
    isNew?: boolean;
}

const buildNutritionQuery = ({
    page = 0,
    size = 30,
    sort = 'productName,asc',
    keyword,
    isNew,
}: FetchNutritionProductsParams) => {
    const query = new URLSearchParams();
    query.set('page', String(page));
    query.set('size', String(size));
    query.set('sort', sort);

    if (keyword) {
        query.set('keyword', keyword);
    }

    if (typeof isNew === 'boolean') {
        query.set('isNew', String(isNew));
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

    let response = await fetch(endpoint, {
        cache: init?.cache ?? 'no-store',
        ...init,
        headers: {
            'Content-Type': 'application/json',
            ...(init?.headers ?? {}),
        },
        credentials: 'omit',
    });

    if (response.status === 401) {
        try {
            const { fetchWithAuth } = await import('../../../../lib/api/fetchWithAuth');
            response = await fetchWithAuth(`/product/search?${query.toString()}`, {
                method: init?.method ?? 'GET',
                cache: init?.cache ?? 'no-store',
                ...init,
            });
        } catch (error) {
            console.warn('[fetchProductSearch] 인증 요청 재시도 실패, 원본 응답을 사용합니다.', error);
        }
    }

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
    isNew?: boolean;
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
    isNew,
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

    if (typeof isNew === 'boolean') {
        params.set('isNew', String(isNew));
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

    const isBrowser = typeof window !== 'undefined';

    const performServerRequest = async () => {
        let headers: HeadersInit = {
            'Content-Type': 'application/json',
            ...(init?.headers ?? {}),
        };

        try {
            const { cookies } = await import('next/headers');
            const cookieStore = await cookies();
            const accessToken = cookieStore.get('accessToken')?.value;
            const allCookies = cookieStore.getAll();

            if (allCookies.length > 0) {
                headers = {
                    ...headers,
                    Cookie: allCookies.map(({ name, value }) => `${name}=${value}`).join('; '),
                };
            }

            if (accessToken) {
                headers = {
                    ...headers,
                    Authorization: `Bearer ${accessToken}`,
                };
            }
        } catch (error) {
            console.warn('[fetchProductSearch] 서버 쿠키 조회 실패, 비인증 요청 진행', error);
        }

        return fetch(endpoint, {
            cache: init?.cache ?? 'no-store',
            ...init,
            headers,
            credentials: 'include',
        });
    };

    const performClientRequest = async () => {
        const { fetchWithAuth } = await import('../../../../lib/api/fetchWithAuth');
        return fetchWithAuth(`/product/search?${query.toString()}`, {
            method: init?.method ?? 'GET',
            cache: init?.cache ?? 'no-store',
            ...init,
        });
    };

    const response = await (isBrowser ? performClientRequest() : performServerRequest());

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

