export const sanitizeImageFileName = (rawName: string): string => {
  const trimmed = rawName.trim()
  if (!trimmed) {
    return 'image.jpeg'
  }

  const lastDot = trimmed.lastIndexOf('.')
  const extension = lastDot >= 0 ? trimmed.slice(lastDot).toLowerCase() : ''
  const baseName = lastDot >= 0 ? trimmed.slice(0, lastDot) : trimmed

  const cleanedBase = baseName
    .replace(/#/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')

  return `${cleanedBase || 'image'}${extension}`
}

export const createSafeImageFile = (file: File): File => {
  const sanitizedName = sanitizeImageFileName(file.name)
  return new File([file], sanitizedName, { type: file.type, lastModified: file.lastModified })
}

export const extractStoredPathFromUrl = (imageUrl?: string | null): string | null => {
  if (!imageUrl) {
    return null
  }
  try {
    const url = new URL(imageUrl)
    const pathname = url.pathname.startsWith('/') ? url.pathname.slice(1) : url.pathname
    return pathname || null
  } catch {
    const trimmed = imageUrl.trim()
    if (!trimmed) {
      return null
    }
    return trimmed.replace(/^https?:\/\/[^/]+\//i, '')
  }
}

