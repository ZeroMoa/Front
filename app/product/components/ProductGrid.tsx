'use client';

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../page.module.css';
import { Product } from '@/types/product';
import Image from 'next/image';
import { getCdnUrl } from '@/lib/cdn';
import FavoriteToggleButton from './FavoriteToggleButton';

interface ProductGridProps {
    products: Product[];
}

const DEFAULT_IMAGE = getCdnUrl('/images/default-product.png');

const WARN_ICON = getCdnUrl('/images/warning.png');
const CAFFEINE_ICON = getCdnUrl('/images/coffee.png');

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

const prepareImageUrl = (url?: string | null) => {
    if (!url) {
        return DEFAULT_IMAGE;
    }
    return /^https?:\/\//i.test(url) ? url : getCdnUrl(url);
};

const hasPositiveAmount = (value?: number | null) => typeof value === 'number' && !Number.isNaN(value) && value > 0;

const hasAlternativeSweeteners = (product: Product) =>
    hasPositiveAmount(product.sugarAlcoholG) ||
    hasPositiveAmount(product.alluloseG) ||
    hasPositiveAmount(product.erythritolG);

function ProductCard({ product }: { product: Product }) {
    const router = useRouter();

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

    const handleNavigate = useCallback(() => {
        router.push(`/product/${product.productNo}`);
    }, [router, product.productNo]);

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleNavigate();
            }
        },
        [handleNavigate],
    );

    return (
        <div
            className={styles.card}
            role="button"
            tabIndex={0}
            onClick={handleNavigate}
            onKeyDown={handleKeyDown}
        >
            <FavoriteToggleButton
                productNo={product.productNo}
                initialIsFavorite={product.isFavorite}
                initialLikesCount={product.likesCount ?? 0}
                className={styles.cardFavoriteButton}
            />
            <div className={styles.badgeRow}>
                {(hasAlternativeSweeteners(product) || product.caffeineMg > 0) && (
                    <>
                        {hasAlternativeSweeteners(product) && (
                            <span className={styles.badgeWrapper}>
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
                            <span className={styles.badgeWrapper}>
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
            <div className={styles.cardBody}>
                <h3 className={styles.productName}>{product.productName}</h3>
                {product.companyName && <p className={styles.companyName}>{product.companyName}</p>}
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

export default function ProductGrid({ products }: ProductGridProps) {
    const visibleProducts = products.filter((product) => {
        const image = typeof product.imageUrl === 'string' ? product.imageUrl.trim() : '';
        return image.length > 0;
    });

    if (visibleProducts.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>조건에 맞는 제품이 없습니다. 필터를 조정해보세요.</p>
            </div>
        );
    }

    return (
        <div className={styles.grid}>
            {visibleProducts.map((product) => (
                <ProductCard key={product.productNo} product={product} />
            ))}
        </div>
    );
}

