import { AdminUserSortKey, ManageUserSortKey } from '@/types/userTypes'

export const PAGE_SIZE_OPTIONS = [20, 40, 60]

export const ADMIN_USER_TABLE_COLUMNS: Array<{
  key: AdminUserSortKey
  label: string
  width?: string
}> = [
  { key: 'username', label: '회원명' },
  { key: 'email', label: '이메일' },
  { key: 'nickname', label: '닉네임' },
  { key: 'isLock', label: '정지 여부', width: '140px' },
  { key: 'isSocial', label: '소셜 여부', width: '140px' },
  { key: 'createdDate', label: '가입 날짜', width: '160px' },
  { key: 'updateDate', label: '정보 변경 날짜', width: '170px' },
  { key: 'isDeleted', label: '탈퇴 여부', width: '140px' },
  { key: 'deletedAt', label: '탈퇴 날짜', width: '160px' },
]

export const SORT_FIELD_MAP: Record<AdminUserSortKey, string> = {
  username: 'username',
  email: 'email',
  nickname: 'nickname',
  isLock: 'isLock',
  isSocial: 'isSocial',
  createdDate: 'createdDate',
  updateDate: 'updatedDate',
  isDeleted: 'isDeleted',
  deletedAt: 'deletedAt',
}

export const MANAGE_USER_FILTER_OPTIONS = {
  role: [
    { value: 'ALL', label: '전체' },
    { value: 'USER', label: 'USER' },
    { value: 'ADMIN', label: 'ADMIN' },
  ],
  lock: [
    { value: 'ALL', label: '전체' },
    { value: 'false', label: '활성' },
    { value: 'true', label: '정지' },
  ],
}

export const USER_TOGGLE_LABELS = {
  lock: ['활성', '정지'] as const,
  role: ['유저', '어드민'] as const,
}

export const MANAGE_USER_TABLE_COLUMNS: Array<{
  key: ManageUserSortKey
  label: string
}> = [
  { key: 'username', label: '회원명' },
  { key: 'email', label: '이메일' },
  { key: 'nickname', label: '닉네임' },
  { key: 'isLock', label: '정지' },
  { key: 'roleType', label: '역할' },
]


