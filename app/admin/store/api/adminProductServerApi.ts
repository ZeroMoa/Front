import { cookies } from 'next/headers'
import { normalizeProduct, type Product } from '@/types/productTypes'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? ''
const ADMIN_PRODUCT_DETAIL_ROUTE = '/product'

type HttpError = Error & { status?: number }

const buildCookieHeader = (rawCookies: Array<{ name: string; value: string }>): string => {
  if (rawCookies.length === 0) {
    return ''
  }
  return rawCookies
    .map(({ name, value }) => `${name}=${encodeURIComponent(value)}`)
    .join('; ')
}

const createHttpError = (status: number, message: string): HttpError => {
  const error: HttpError = new Error(message)
  error.status = status
  return error
}

export const fetchAdminProductDetailServer = async (productNo: number): Promise<Product> => {
  if (!API_BASE_URL) {
    throw createHttpError(500, 'API 기본 경로가 설정되지 않았습니다.')
  }

  const cookieStore = await Promise.resolve(cookies())
  const cookieHeader = buildCookieHeader(cookieStore.getAll())

  const response = await fetch(`${API_BASE_URL}${ADMIN_PRODUCT_DETAIL_ROUTE}/${productNo}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      ...(cookieHeader ? { Cookie: cookieHeader } : {}),
    },
    cache: 'no-store',
    next: { revalidate: 0 },
  })

  if (response.status === 404) {
    throw createHttpError(404, '해당 제품을 찾을 수 없습니다.')
  }

  if (!response.ok) {
    const errorText = await response.text().catch(() => '')
    throw createHttpError(
      response.status,
      errorText || `제품 상세 조회 실패: ${response.status} ${response.statusText}`.trim()
    )
  }

  const data = await response.json()
  return normalizeProduct(data)
}

