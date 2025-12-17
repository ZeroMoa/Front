import { fetchWithAuth } from '@/lib/common/api/fetchWithAuth'
import {
  ManageUser,
  normalizeAdminUser,
  normalizeManageUser,
  PageResponse,
  SortDirection,
  AdminUser,
  UserFilters,
} from '@/types/userTypes'

type AdminUserListParams = {
  page: number
  size: number
  usernameKeyword?: string | null
  emailKeyword?: string | null
  sortField?: string | null
  sortDirection?: SortDirection | null
}

type AdminUserManageParams = {
  page: number
  size: number
  sortField?: string | null
  sortDirection?: SortDirection | null
  filters?: UserFilters
}

function buildSortParam(sortField?: string | null, sortDirection?: SortDirection | null): string | null {
  if (!sortField || !sortDirection) {
    return null
  }
  return `${sortField},${sortDirection}`
}

function normalizePageResponse<T>(json: any, normalizer: (item: any) => T, fallbackPage = 0, fallbackSize = 20): PageResponse<T> {
  return {
    content: Array.isArray(json.content) ? json.content.map((item) => normalizer(item)) : [],
    totalElements:
      typeof json.totalElements === 'number'
        ? json.totalElements
        : typeof json.total_elements === 'number'
        ? json.total_elements
        : 0,
    totalPages:
      typeof json.totalPages === 'number'
        ? json.totalPages
        : typeof json.total_pages === 'number'
        ? json.total_pages
        : 0,
    number: typeof json.number === 'number' ? json.number : json.page ?? fallbackPage,
    size: typeof json.size === 'number' ? json.size : json.pageSize ?? fallbackSize,
  }
}

function buildEndpointWithQuery(base: string, query: URLSearchParams): string {
  const search = query.toString()
  return search ? `${base}?${search}` : base
}

export async function fetchAdminUsersList(params: AdminUserListParams): Promise<PageResponse<AdminUser>> {
  const query = new URLSearchParams()
  query.set('page', Math.max(params.page, 0).toString())
  query.set('size', params.size.toString())

  const trimmedUsername = params.usernameKeyword?.trim() ?? ''
  const trimmedEmail = params.emailKeyword?.trim() ?? ''
  const hasUsername = Boolean(trimmedUsername)
  const hasEmail = Boolean(trimmedEmail)

  if (hasUsername && hasEmail) {
    throw new Error('아이디와 이메일 검색은 동시에 사용할 수 없습니다.')
  }

  const sortParam = buildSortParam(params.sortField, params.sortDirection)
  if (sortParam) {
    query.set('sort', sortParam)
  }

  let endpoint = '/admin/users'

  if (hasUsername || hasEmail) {
    endpoint = '/admin/users/search'
    if (hasUsername) {
      query.set('username', trimmedUsername)
    } else if (hasEmail) {
      query.set('email', trimmedEmail)
    }
  }

  const response = await fetchWithAuth(buildEndpointWithQuery(endpoint, query))
  const json = await response.json()
  return normalizePageResponse(json, normalizeAdminUser)
}

export async function fetchAdminUserManagement(params: AdminUserManageParams): Promise<PageResponse<ManageUser>> {
  const query = new URLSearchParams()
  query.set('page', Math.max(params.page, 0).toString())
  query.set('size', params.size.toString())

  const sortParam = buildSortParam(params.sortField, params.sortDirection)
  if (sortParam) {
    query.set('sort', sortParam)
  }

  const filters = params.filters
  const trimmedUsername = filters?.username.trim() ?? ''
  const trimmedEmail = filters?.email.trim() ?? ''
  const hasUsername = Boolean(trimmedUsername)
  const hasEmail = Boolean(trimmedEmail)
  const hasRole = filters?.roleType && filters.roleType !== 'ALL'
  const hasLock = filters?.isLock && filters.isLock !== 'ALL'
  const shouldUseSearchEndpoint = hasUsername || hasEmail

  if (hasUsername && hasEmail) {
    throw new Error('아이디와 이메일 검색은 동시에 사용할 수 없습니다.')
  }

  if (hasRole) {
    const role = filters!.roleType === 'ADMIN' ? 'ROLE_ADMIN' : filters!.roleType === 'USER' ? 'ROLE_USER' : filters!.roleType
    query.set('roleType', role)
  }
  if (hasLock) {
    query.set('isLock', filters!.isLock)
  }

  if (shouldUseSearchEndpoint) {
    if (hasUsername) {
      query.set('username', trimmedUsername)
    } else if (hasEmail) {
      query.set('email', trimmedEmail)
    }
  }

  const endpoint = shouldUseSearchEndpoint ? '/admin/users/search' : '/admin/users'

  const response = await fetchWithAuth(buildEndpointWithQuery(endpoint, query))
  const json = await response.json()
  return normalizePageResponse(json, normalizeManageUser, params.page, params.size)
}

export async function fetchAdminUserStats() {
  const fetchCount = async (path: string) => {
    const response = await fetchWithAuth(path)
    const data = await response.json()
    if (typeof data === 'number') return data
    if (data && typeof (data as { count?: number }).count === 'number') return (data as { count: number }).count
    if (data && typeof (data as { total?: number }).total === 'number') return (data as { total: number }).total
    if (data && typeof (data as { value?: number }).value === 'number') return (data as { value: number }).value
    return 0
  }

  const registeredToday = await fetchCount('/admin/users/today-registered-count')
  const deletedToday = await fetchCount('/admin/users/today-deleted-count')

  return { registeredToday, deletedToday }
}

export async function patchAdminUserLock(username: string, isLock: boolean) {
  await fetchWithAuth(`/admin/users/${encodeURIComponent(username)}/lock`, {
    method: 'PATCH',
    body: JSON.stringify({ isLock }),
  })
}

export async function patchAdminUserRole(username: string, roleType: 'ADMIN' | 'USER') {
  await fetchWithAuth(`/admin/users/${encodeURIComponent(username)}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ roleType }),
  })
}

export async function patchAdminUserInfo(username: string, payload: { email?: string; nickname?: string }) {
  await fetchWithAuth(`/admin/users/${encodeURIComponent(username)}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export async function deleteAdminUser(username: string) {
  await fetchWithAuth(`/admin/users/${encodeURIComponent(username)}`, {
    method: 'DELETE',
  })
}

