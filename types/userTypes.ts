export type SortDirection = 'asc' | 'desc' | null

export type AdminUserSortKey =
  | 'username'
  | 'email'
  | 'nickname'
  | 'isLock'
  | 'isSocial'
  | 'createdDate'
  | 'updateDate'
  | 'isDeleted'
  | 'deletedAt'

export type ManageUserSortKey =
  | 'username'
  | 'email'
  | 'nickname'
  | 'createdDate'
  | 'updatedDate'
  | 'roleType'
  | 'isLock'

export interface AdminUser {
  username: string
  email: string
  nickname: string
  isLock: boolean
  isSocial: boolean
  createdDate: string | null
  updateDate: string | null
  isDeleted: boolean
  deletedAt: string | null
}

export interface ManageUser {
  username: string
  email: string
  nickname: string
  isLock: boolean
  roleType: string
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  number: number
  size: number
}

export interface EditFormState {
  email: string
  nickname: string
}

export interface UserFilters {
  username: string
  email: string
  roleType: 'ALL' | 'USER' | 'ADMIN'
  isLock: 'ALL' | 'true' | 'false'
}

export function normalizeAdminUser(raw: any): AdminUser {
  return {
    username: raw.username ?? '',
    email: raw.email ?? '',
    nickname: raw.nickname ?? '',
    isLock: (raw.isLock ?? raw.is_lock ?? false) as boolean,
    isSocial: (raw.isSocial ?? raw.is_social ?? false) as boolean,
    createdDate: (raw.createdDate ?? raw.created_date ?? null) as string | null,
    updateDate: (raw.updateDate ?? raw.updated_date ?? null) as string | null,
    isDeleted: (raw.isDeleted ?? raw.is_deleted ?? false) as boolean,
    deletedAt: (raw.deletedAt ?? raw.deleted_at ?? null) as string | null,
  }
}

export function normalizeManageUser(raw: any): ManageUser {
  const rawRole = raw.roleType ?? raw.role ?? raw.role_type ?? 'ROLE_USER'
  const normalizedRole =
    typeof rawRole === 'string' && !rawRole.startsWith('ROLE_') ? `ROLE_${rawRole}` : rawRole ?? 'ROLE_USER'
  return {
    username: raw.username ?? '',
    email: raw.email ?? '',
    nickname: raw.nickname ?? '',
    isLock: Boolean(raw.isLock ?? raw.is_lock ?? false),
    roleType: normalizedRole,
  }
}

