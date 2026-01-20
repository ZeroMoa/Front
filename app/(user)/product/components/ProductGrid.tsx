'use client';

import { useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../page.module.css';
import { Product } from '@/types/productTypes';
import Image from 'next/image';
import { getCdnUrl } from '@/lib/cdn';
import FavoriteToggleButton from '../../favorites/components/FavoriteToggleButton';
import {
    PRODUCT_GRID_DRAG_THRESHOLD,
    PRODUCT_LIST_SCROLL_STORAGE_KEY,
} from '@/constants/productNavigationConstants';

interface ProductGridProps {
    products: Product[];
    className?: string;
    emptyMessage?: string;
    variant?: 'default' | 'admin';
    onDeleteProduct?: (product: Product) => Promise<void>;
    getProductHref?: (product: Product) => string;
}

const DEFAULT_IMAGE = getCdnUrl('/images/default-product.png');
const PRODUCT_IMAGES_DISABLED = true; // toggle to false once image copyright clearance is ready

const WARN_ICON = getCdnUrl('/images/warning.png');
const CAFFEINE_ICON = getCdnUrl('/images/coffee.png');
const DELETE_ICON = getCdnUrl('/images/delete.png');

const ALT_SWEETENER_TOOLTIP = '대체당은 과다복용시 복통과 설사를 유발할 수 있어요! 조심!';
const CAFFEINE_TOOLTIP = '카페인이 포함돼있어요! 불면증을 조심하세요~';

const hasNumberValue = (value?: number | null): value is number =>
    typeof value === 'number' && !Number.isNaN(value);

const getTrimmedText = (value?: string | null) => {
    if (!value) {
        return undefined;
    }
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : undefined;
};

const getNutritionBasisLabel = (product: Product) => {
    const basisText = getTrimmedText(product.nutritionBasisText);
    if (basisText) {
        return basisText;
    }
    if (hasNumberValue(product.nutritionBasisValue)) {
        const intValue = product.nutritionBasisValue;
        const unit = getTrimmedText(product.nutritionBasisUnit) ?? '';
        return `${intValue}${unit}`;
    }
    return undefined;
};

const getEnergyLabel = (value?: number | null) => {
    if (!hasNumberValue(value)) {
        return undefined;
    }
    return `${value}kcal`;
};

const fixUnencodedPercents = (value: string) => value.replace(/%(?![0-9A-Fa-f]{2})/g, '%25');

const isDefaultImage = (url?: string | null) => {
    if (!url) {
        return true;
    }
    const normalized = url.trim().toLowerCase();
    if (!normalized) {
        return true;
    }
    return (
        normalized.endsWith('/default-product.png') ||
        normalized.includes('/default-product.png') ||
        normalized.includes('default-product')
    );
};

const prepareImageUrl = (url?: string | null) => {
    if (!url || isDefaultImage(url)) {
        return DEFAULT_IMAGE;
    }
    const trimmed = url.trim();
    if (/^https?:\/\//i.test(trimmed)) {
        const corrected = fixUnencodedPercents(trimmed);
        try {
            const parsed = new URL(corrected);
            const encodeSegment = (segment: string) => {
                if (!segment) {
                    return segment;
                }
                try {
                    const decoded = decodeURIComponent(segment);
                    const trimmedSegment = decoded.trim();
                    return encodeURIComponent(trimmedSegment);
                } catch {
                    const trimmedSegment = segment.trim();
                    return trimmedSegment ? encodeURIComponent(trimmedSegment) : '';
                }
            };

            const encodedPath = parsed.pathname
                .split('/')
                .map((segment) => encodeSegment(segment))
                .join('/');
            return `${parsed.origin}${encodedPath}${parsed.search}${parsed.hash}`;
        } catch {
            return encodeURI(corrected);
        }
    }
    const sanitized = fixUnencodedPercents(trimmed);
    return getCdnUrl(sanitized.startsWith('/') ? sanitized : `/${sanitized}`);
};

const hasPositiveAmount = (value?: number | null) => typeof value === 'number' && !Number.isNaN(value) && value > 0;

const hasAlternativeSweeteners = (product: Product) =>
    hasPositiveAmount(product.sugarAlcoholG) ||
    hasPositiveAmount(product.alluloseG) ||
    hasPositiveAmount(product.erythritolG);

type DragState = {
    startX: number;
    startY: number;
    isDragging: boolean;
    didDrag: boolean;
};

function ProductCard({
    product,
    variant = 'default',
    onDeleteProduct,
    getProductHref,
}: {
    product: Product;
    variant?: 'default' | 'admin';
    onDeleteProduct?: (product: Product) => Promise<void>;
    getProductHref?: (product: Product) => string;
}) {
    const router = useRouter();
    const dragStateRef = useRef<DragState>({
        startX: 0,
        startY: 0,
        isDragging: false,
        didDrag: false,
    });
    const stopCardNavigation = (event: React.SyntheticEvent) => {
        event.stopPropagation();
    };

    const recordScrollPosition = useCallback(() => {
        if (typeof window === 'undefined') {
            return;
        }
        const currentPath = `${window.location.pathname}${window.location.search}`;
        window.sessionStorage.setItem(
            PRODUCT_LIST_SCROLL_STORAGE_KEY,
            JSON.stringify({ path: currentPath, scroll: window.scrollY }),
        );
    }, []);

    const imageSrc = prepareImageUrl(product.imageUrl);
    const totalContent = getTrimmedText(product.totalContent);
    const basisLabel = getNutritionBasisLabel(product);
    const energyLabel = getEnergyLabel(product.energyKcal);
    const sugarLabel = hasPositiveAmount(product.sugarG) ? `${product.sugarG}g` : undefined;
    const sugarAlcoholLabel = hasPositiveAmount(product.sugarAlcoholG) ? `${product.sugarAlcoholG}g` : undefined;
    const alluloseLabel = hasPositiveAmount(product.alluloseG) ? `${product.alluloseG}g` : undefined;
    const erythritolLabel = hasPositiveAmount(product.erythritolG) ? `${product.erythritolG}g` : undefined;

    const summaryItems = (
        [
            totalContent ? { label: '총 내용량', value: totalContent } : null,
            basisLabel ? { label: '기준량', value: basisLabel } : null,
            energyLabel ? { label: '칼로리', value: energyLabel } : null,
            sugarLabel ? { label: '당류', value: sugarLabel } : null,
            sugarAlcoholLabel ? { label: '당알코올', value: sugarAlcoholLabel } : null,
            alluloseLabel ? { label: '알룰로스', value: alluloseLabel } : null,
            erythritolLabel ? { label: '에리스리톨', value: erythritolLabel } : null,
        ].filter(Boolean) as Array<{ label: string; value: string }>
    );
    const hasCompany = Boolean(product.companyName && product.companyName.trim());

    const handleNavigate = useCallback(
        (event?: React.MouseEvent<HTMLDivElement>) => {
            if (dragStateRef.current.didDrag) {
                dragStateRef.current.didDrag = false;
                return;
            }

            const target = getProductHref ? getProductHref(product) : `/product/${product.productNo}`;
            const shouldOpenInNewTab =
                Boolean(event && (event.metaKey || event.ctrlKey || event.shiftKey || event.button === 1));
            if (!shouldOpenInNewTab) {
                recordScrollPosition();
            }
            if (shouldOpenInNewTab && typeof window !== 'undefined') {
                window.open(target, '_blank', 'noopener,noreferrer');
                return;
            }
            router.push(target);
        },
        [router, product, getProductHref, recordScrollPosition],
    );

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleNavigate();
            }
        },
        [handleNavigate],
    );

    const handleDelete = useCallback(
        async (event: React.MouseEvent<HTMLButtonElement>) => {
            event.stopPropagation();
            event.preventDefault();
            if (!onDeleteProduct) {
                return;
            }
            if (variant !== 'admin') {
                const confirmed = window.confirm('정말로 삭제하시겠습니까?');
                if (!confirmed) {
                    return;
                }
            }
            try {
                await onDeleteProduct(product);
            } catch (error) {
                const message = error instanceof Error ? error.message : '제품 삭제 중 오류가 발생했습니다.';
                alert(message);
            }
        },
        [onDeleteProduct, product, variant],
    );

    return (
            <div
                className={styles.card}
                role="button"
                tabIndex={0}
                onClick={(event) => handleNavigate(event)}
                onKeyDown={handleKeyDown}
                onPointerDown={(event) => {
                    dragStateRef.current.startX = event.clientX;
                    dragStateRef.current.startY = event.clientY;
                    dragStateRef.current.isDragging = false;
                    dragStateRef.current.didDrag = false;
                }}
                onPointerMove={(event) => {
                    if (dragStateRef.current.isDragging) {
                        return;
                    }
                    const deltaX = event.clientX - dragStateRef.current.startX;
                    const deltaY = event.clientY - dragStateRef.current.startY;
                    const distance = Math.hypot(deltaX, deltaY);
                    if (distance >= PRODUCT_GRID_DRAG_THRESHOLD) {
                        dragStateRef.current.isDragging = true;
                    }
                }}
                onPointerUp={() => {
                    if (dragStateRef.current.isDragging) {
                        dragStateRef.current.didDrag = true;
                    }
                    dragStateRef.current.isDragging = false;
                }}
            >
            {variant === 'admin' ? (
                <div className={styles.cardFavoriteButton}>
                    <button type="button" className={styles.deleteButton} onClick={handleDelete}>
                        <Image src={DELETE_ICON} alt="삭제" width={20} height={20} className={styles.deleteButtonIcon} />
                    </button>
                </div>
            ) : (
            <FavoriteToggleButton
                productNo={product.productNo}
                initialIsFavorite={product.isFavorite}
                initialLikesCount={product.likesCount ?? 0}
                className={styles.cardFavoriteButton}
            />
            )}
            <div className={styles.badgeRow}>
                {(hasAlternativeSweeteners(product) || product.caffeineMg > 0) && (
                    <>
                        {hasAlternativeSweeteners(product) && (
                            <span
                                className={styles.badgeWrapper}
                                onClick={stopCardNavigation}
                                onPointerDown={stopCardNavigation}
                                onKeyDown={stopCardNavigation}
                            >
                                <span className={styles.badge} tabIndex={0} aria-label="대체당 경고">
                                    <Image src={WARN_ICON} alt="대체당 경고" width={20} height={20} />
                                    <span>대체당</span>
                                </span>
                                <span className={`${styles.badgeTooltip} ${styles.badgeTooltipSweetener}`} role="tooltip">
                                    {ALT_SWEETENER_TOOLTIP}
                                </span>
                            </span>
                        )}
                        {product.caffeineMg > 0 && (
                            <span
                                className={styles.badgeWrapper}
                                onClick={stopCardNavigation}
                                onPointerDown={stopCardNavigation}
                                onKeyDown={stopCardNavigation}
                            >
                                <span className={styles.badge} tabIndex={0} aria-label="카페인 경고">
                                    <Image src={CAFFEINE_ICON} alt="카페인 경고" width={20} height={20} />
                                    <span>카페인</span>
                                </span>
                                <span className={`${styles.badgeTooltip} ${styles.badgeTooltipCaffeine}`} role="tooltip">
                                    {CAFFEINE_TOOLTIP}
                                </span>
                            </span>
                        )}
                    </>
                )}
            </div>
            {PRODUCT_IMAGES_DISABLED ? (
                <div className={styles.imagePlaceholder}>
                    <span>제품 사진은 추후 저작권 확보 후 제공됩니다.</span>
                </div>
            ) : (
                <div className={styles.imageWrapper}>
                    <Image
                        src={imageSrc}
                        alt={product.productName || '제품 이미지'}
                        width={220}
                        height={220}
                        className={styles.productImage}
                        priority={false}
                        onError={(event) => {
                            const target = event.target as HTMLImageElement;
                            target.src = DEFAULT_IMAGE;
                        }}
                    />
                </div>
            )}
            <div className={styles.cardBody}>
                <h3 className={styles.productName}>{product.productName}</h3>
                <span className={styles.cardDivider} aria-hidden="true" />
                {hasCompany && (
                    <>
                        <p className={styles.companyName}>{product.companyName}</p>
                        {summaryItems.length > 0 && <span className={styles.cardDivider} aria-hidden="true" />}
                    </>
                )}
                {summaryItems.map((item) => (
                    <div key={item.label} className={styles.nutritionRow}>
                        <span className={styles.nutritionLabel}>{item.label}</span>
                        <span>{item.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function ProductGrid({
    products,
    className,
    emptyMessage,
    variant = 'default',
    onDeleteProduct,
    getProductHref,
}: ProductGridProps) {
    if (products.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>{emptyMessage ?? '조건에 맞는 제품이 없습니다. 필터를 조정해보세요.'}</p>
            </div>
        );
    }

    return (
        <div className={`${styles.grid} ${className ?? ''}`.trim()}>
            {products.map((product) => (
                <ProductCard
                    key={product.productNo}
                    product={product}
                    variant={variant}
                    onDeleteProduct={onDeleteProduct}
                    getProductHref={getProductHref}
                />
            ))}
        </div>
    );
}

