'use client'

import Cookies from 'js-cookie'

let sessionRedirectScheduled = false

function handleSessionExpiry(originPathname: string, loginTarget: string) {
  if (typeof window === 'undefined' || sessionRedirectScheduled) {
    return
  }

  sessionRedirectScheduled = true
  window.stop()

  const isAdminScope = originPathname.startsWith('/admin')
  const alertMessage = '로그인이 풀렸습니다! 다시 로그인 부탁드립니다~'

  const logoutEndpoint = isAdminScope ? '/admin/logout' : '/logout'

  // 시도만 하고 실패해도 무시
  void fetch(`${API_BASE_URL}${logoutEndpoint}`, {
    method: 'POST',
    credentials: 'include',
  })
    .catch(() => {
      // ignore logout failure
    })
    .finally(() => {
      window.alert(alertMessage)

      setTimeout(() => {
        window.location.replace(loginTarget)
      }, 0)
    })
}

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
  // accessToken?: string, // accessToken 파라미터 제거
  // includeAuthorization = true // includeAuthorization 파라미터 제거
): HeadersInit {
  const headers = new Headers(options.headers ?? {})
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData

  if (!headers.has('Content-Type') && !isFormData) {
    headers.set('Content-Type', 'application/json')
  }

  if (xsrfToken) {
    headers.set('X-XSRF-TOKEN', xsrfToken)
  }

  // HttpOnly 쿠키의 경우 Authorization 헤더를 수동으로 추가하지 않음.
  // 브라우저가 credentials: 'include'를 통해 자동으로 쿠키를 전송하도록 함.
  // if (includeAuthorization && accessToken && !headers.has('Authorization')) {
  //   headers.set('Authorization', `Bearer ${accessToken}`)
  // }

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

  const originPathname = typeof window !== 'undefined' ? window.location.pathname : ''
  const isAdminScope = originPathname.startsWith('/admin')
  const loginRedirectTarget = isAdminScope ? '/admin/login' : '/'

  const xsrfToken = Cookies.get('XSRF-TOKEN')
  // const accessToken = Cookies.get('accessToken') // accessToken 쿠키 직접 읽기 제거
  const headers = buildHeaders(options, xsrfToken) // accessToken 관련 파라미터 제거

  let response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  })

  if (response.status === 401 && !retried) {
    try {
      const refreshHeaders = buildHeaders({}, xsrfToken) // accessToken 관련 파라미터 제거
      const refreshResponse = await fetch(`${API_BASE_URL}/jwt/refresh`, {
        method: 'POST',
        headers: refreshHeaders,
        credentials: 'include',
      })

      if (refreshResponse.ok) {
        // 리프레시 성공 후, 브라우저가 새 accessToken 쿠키를 자동으로 처리하므로
        // 다시 요청할 때 fetchWithAuth가 업데이트된 쿠키를 사용하도록 함
        response = await fetchWithAuth(path, options, true)
      } else {
        const { message } = await parseErrorResponse(refreshResponse)
        const errorMessage = message || '리프레시 토큰이 만료되었거나 유효하지 않습니다. 다시 로그인하십시오.'
        handleSessionExpiry(originPathname, loginRedirectTarget)
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('토큰 재발급 중 오류 발생:', error)
      handleSessionExpiry(originPathname, loginRedirectTarget)
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
      throw new Error('비밀번호를 잘못 입력하셨습니다.')
    }

    throw new Error(fallbackMessage)
  }

  return response
}
