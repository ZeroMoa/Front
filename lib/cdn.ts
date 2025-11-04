const RAW_CDN_DOMAIN = process.env.NEXT_PUBLIC_CLOUDFRONT_DOMAIN ?? '';

const CDN_BASE_URL = RAW_CDN_DOMAIN
    ? RAW_CDN_DOMAIN.startsWith('http')
        ? RAW_CDN_DOMAIN.replace(/\/$/, '')
        : `https://${RAW_CDN_DOMAIN}`.replace(/\/$/, '')
    : '';

export const getCdnUrl = (path: string) => {
    if (!path) {
        return path;
    }

    if (/^https?:\/\//i.test(path)) {
        return path;
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`;

    if (!CDN_BASE_URL) {
        return normalizedPath;
    }

    return `${CDN_BASE_URL}${normalizedPath}`;
};

export const cdnBaseUrl = CDN_BASE_URL;

