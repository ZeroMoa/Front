'use client';

import { useRouter } from 'next/navigation';
import styles from '../page.module.css';
import { Product } from '@/types/product';
import Image from 'next/image';
import { getCdnUrl } from '@/lib/cdn';

interface ProductGridProps {
    products: Product[];
}

const DEFAULT_IMAGE = getCdnUrl('/images/default-product.png');

const WARN_ICON = getCdnUrl('/images/warning.png');
const CAFFEINE_ICON = getCdnUrl('/images/coffee.png');

const ALT_SWEETENER_TOOLTIP = '대체당은 과다복용시 복통과 설사를 유발할 수 있어요! 조심!';
const CAFFEINE_TOOLTIP = '카페인이 포함돼있어요! 불면증을 조심하세요~';

const formatNumber = (value: number | null | undefined, unit: string) => {
    if (!value || Number.isNaN(value)) {
        return '-';
    }
    return `${Math.round((Number(value) + Number.EPSILON) * 10) / 10}${unit}`;
};

const prepareImageUrl = (url?: string | null) => {
    if (!url) {
        return DEFAULT_IMAGE;
    }
    return /^https?:\/\//i.test(url) ? url : getCdnUrl(url);
};

const hasAlternativeSweeteners = (product: Product) =>
    Boolean(
        product.sugarAlcoholG ||
            product.alluloseG ||
            product.erythritolG,
    );

export default function ProductGrid({ products }: ProductGridProps) {
    const router = useRouter();

    if (products.length === 0) {
        return (
            <div className={styles.emptyState}>
                <p>조건에 맞는 제품이 없습니다. 필터를 조정해보세요.</p>
            </div>
        );
    }

    return (
        <div className={styles.grid}>
            {products.map((product) => {
                const imageSrc = prepareImageUrl(product.imageUrl);

                return (
                    <button
                        key={product.productNo}
                        type="button"
                        className={styles.card}
                        onClick={() => router.push(`/product/${product.productNo}`)}
                    >
                        <div className={styles.badgeRow}>
                            {(hasAlternativeSweeteners(product) || product.caffeineMg > 0) && (
                                <>
                                    {hasAlternativeSweeteners(product) && (
                                        <span className={styles.badgeWrapper}>
                                            <span
                                                className={styles.badge}
                                                tabIndex={0}
                                                aria-label="대체당 경고"
                                            >
                                                <Image src={WARN_ICON} alt="대체당 경고" width={20} height={20} />
                                                <span>대체당</span>
                                            </span>
                                            <span
                                                className={`${styles.badgeTooltip} ${styles.badgeTooltipSweetener}`}
                                                role="tooltip"
                                            >
                                                {ALT_SWEETENER_TOOLTIP}
                                            </span>
                                        </span>
                                    )}
                                    {product.caffeineMg > 0 && (
                                        <span className={styles.badgeWrapper}>
                                            <span
                                                className={styles.badge}
                                                tabIndex={0}
                                                aria-label="카페인 경고"
                                            >
                                                <Image src={CAFFEINE_ICON} alt="카페인 경고" width={20} height={20} />
                                                <span>카페인</span>
                                            </span>
                                            <span
                                                className={`${styles.badgeTooltip} ${styles.badgeTooltipCaffeine}`}
                                                role="tooltip"
                                            >
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
                            {product.companyName && (
                                <p className={styles.companyName}>{product.companyName}</p>
                            )}
                            <div className={styles.nutritionRow}>
                                <span className={styles.nutritionLabel}>열량</span>
                                <span>{formatNumber(product.energyKcal, 'kcal')}</span>
                            </div>
                            <div className={styles.nutritionRow}>
                                <span className={styles.nutritionLabel}>당류</span>
                                <span>{formatNumber(product.sugarG, 'g')}</span>
                            </div>
                            <div className={styles.nutritionRow}>
                                <span className={styles.nutritionLabel}>내용량</span>
                                <span>
                                    {product.servingSize}
                                    {product.servingUnit ?? ''}
                                </span>
                            </div>
                        </div>
                    </button>
                );
            })}
        </div>
    );
}

