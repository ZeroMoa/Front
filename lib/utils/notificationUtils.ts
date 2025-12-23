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

const FIRST_IMAGE_REGEX = /<img[^>]+src=["']?([^"'>\s]+)["']?[^>]*>/i

function decodeHtmlEntitiesLite(value: string) {
  return value
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

export function extractFirstImageSrcFromContent(content?: string | null) {
  if (!content) {
    return null
  }

  const normalized = decodeHtmlEntitiesLite(content.trim())
  const match = normalized.match(FIRST_IMAGE_REGEX)

  if (!match) {
    return null
  }

  return match[1]
}

