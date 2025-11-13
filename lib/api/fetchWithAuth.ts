'use client'

import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, '') ?? ''

function headersToRecord(headers: Headers): Record<string, string> {
  const record: Record<string, string> = {}
  headers.forEach((value, key) => {
    record[key] = value
  })
  return record
}

function buildHeaders(
  options: RequestInit,
  xsrfToken?: string,
  accessToken?: string,
  includeAuthorization = true
): HeadersInit {
  const headers = new Headers(options.headers ?? {})
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  if (!headers.has('Content-Type') && !isFormData) {
    headers.set('Content-Type', 'application/json')
  }

  if (xsrfToken) {
    headers.set('X-XSRF-TOKEN', xsrfToken)
  }

  if (includeAuthorization && accessToken && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  return headersToRecord(headers)
}

async function parseErrorResponse(response: Response): Promise<{ message?: string }> {
  try {
    const data = await response.json()
    if (data && typeof data === 'object' && !Array.isArray(data) && 'message' in data) {
      return { message: (data as { message?: string }).message }
    }
  } catch {
    // ignore json parse failure
  }

  try {
    const text = await response.text()
    if (text) {
      return { message: text }
    }
  } catch {
    // ignore text parse failure
  }

  return {}
}

export async function fetchWithAuth(path: string, options: RequestInit = {}, retried = false): Promise<Response> {
  if (!API_BASE_URL) {
    throw new Error('API 기본 경로가 설정되지 않았습니다.')
  }

  const xsrfToken = Cookies.get('XSRF-TOKEN')
  const accessToken = Cookies.get('accessToken')
  const headers = buildHeaders(options, xsrfToken, accessToken)

  let response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (response.status === 401 && !retried) {
    try {
      const refreshHeaders = buildHeaders({}, xsrfToken, undefined, false)
      const refreshResponse = await fetch(`${API_BASE_URL}/jwt/refresh`, {
        method: 'POST',
        headers: refreshHeaders,
        credentials: 'include',
      })

      if (refreshResponse.ok) {
        response = await fetchWithAuth(path, options, true)
      } else {
        const { message } = await parseErrorResponse(refreshResponse)
        throw new Error(message || '리프레시 토큰이 만료되었거나 유효하지 않습니다. 다시 로그인하십시오.')
      }
    } catch (error) {
      console.error('토큰 재발급 중 오류 발생:', error)
      throw error instanceof Error ? error : new Error('토큰 재발급 중 알 수 없는 오류가 발생했습니다.')
    }
  } else if (response.status === 401 && retried) {
    const { message } = await parseErrorResponse(response)
    throw new Error(message || '토큰 재발급 후에도 인증되지 않았습니다.')
  }

  if (!response.ok) {
    const { message } = await parseErrorResponse(response)
    const fallbackMessage = message || `API 요청 실패: ${response.status} ${response.statusText}`

    if (response.status === 401) {
      if (fallbackMessage.includes('액세스 토큰이 없습니다.') || fallbackMessage.includes('액세스 토큰이 만료되었습니다.')) {
        throw new Error(fallbackMessage)
      }
    } else if (response.status === 403) {
      if (fallbackMessage.includes('탈퇴한 회원입니다.')) {
        try {
          localStorage.removeItem('accessToken')
        } catch {
          // ignore storage access errors
        }
        throw new Error('탈퇴한 회원입니다. 자동으로 로그아웃 처리됩니다.')
      }
      if (fallbackMessage.includes('비밀번호가 일치하지 않습니다.')) {
        throw new Error(fallbackMessage)
      }
    }

    throw new Error(fallbackMessage)
  }

  return response
}
