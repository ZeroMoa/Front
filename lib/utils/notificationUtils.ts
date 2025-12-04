export interface NotificationListQueryOptions {
  page: number
  size: number
  sort?: string
  isActive?: 'true' | 'false'
  boardTitle?: string
  boardNo?: string
}

export function createNotificationQueryParams(options: NotificationListQueryOptions) {
  const params = new URLSearchParams()
  params.set('page', String(options.page))
  params.set('size', String(options.size))

  if (options.sort) {
    params.set('sort', options.sort)
  }

  if (options.isActive) {
    params.set('isActive', options.isActive)
  }

  if (options.boardTitle) {
    params.set('boardTitle', options.boardTitle)
  }

  if (options.boardNo) {
    params.set('boardNo', options.boardNo)
  }

  return params
}

