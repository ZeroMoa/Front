'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import styles from '../page.module.css';
import { FAVORITE_TOGGLE_COOLDOWN_MS, toggleFavoriteProduct } from '@/app/store/api/favorite';
import { useIsLoggedIn } from '@/app/hooks/useAuth';
import { getCdnUrl } from '@/lib/cdn';

interface FavoriteToggleButtonProps {
    productNo: number;
    initialIsFavorite?: boolean;
    initialLikesCount?: number;
    className?: string;
    onChange?: (payload: { isFavorite: boolean; likesCount: number }) => void;
}

export default function FavoriteToggleButton({
    productNo,
    initialIsFavorite = false,
    initialLikesCount = 0,
    className,
    onChange,
}: FavoriteToggleButtonProps) {
    const { isLoggedIn } = useIsLoggedIn();
    const [isFavorite, setIsFavorite] = useState(Boolean(initialIsFavorite));
    const [likesCount, setLikesCount] = useState<number>(initialLikesCount);
    const [isLoading, setIsLoading] = useState(false);
    const lastClickRef = useRef<number>(0);

    const combinedClassName = useMemo(() => {
        const classes = [styles.favoriteButton];
        if (isFavorite) {
            classes.push(styles.favoriteButtonActive);
        }
        if (className) {
            classes.push(className);
        }
        return classes.join(' ');
    }, [className, isFavorite]);

    const handleClick = useCallback(
        async (event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            event.stopPropagation();

            if (!isLoggedIn) {
                alert('로그인 후 이용해주세요');
                return;
            }

            const now = Date.now();
            if (now - lastClickRef.current < FAVORITE_TOGGLE_COOLDOWN_MS) {
                alert('너무 빠르게 누르고 있어요. 잠시 후 다시 시도해주세요.');
                return;
            }

            if (isLoading) {
                return;
            }

            lastClickRef.current = now;
            setIsLoading(true);

            try {
                const response = await toggleFavoriteProduct(productNo);
                const nextIsFavorite = Boolean(response.isFavorite);
                const nextLikesCount = typeof response.likesCount === 'number' ? response.likesCount : likesCount;

                setIsFavorite(nextIsFavorite);
                setLikesCount(nextLikesCount);
                onChange?.({ isFavorite: nextIsFavorite, likesCount: nextLikesCount });
            } catch (error) {
                const status = (error as Error & { status?: number }).status;

                if (status === 401) {
                    alert('로그인 후 이용해주세요');
                } else if (status === 429) {
                    alert('너무 빠르게 누르고 있어요. 잠시 후 다시 시도해주세요.');
                } else {
                    const message = error instanceof Error ? error.message : '좋아요 처리 중 오류가 발생했습니다.';
                    alert(message);
                }
            } finally {
                setIsLoading(false);
            }
        },
        [isLoggedIn, isLoading, likesCount, onChange, productNo],
    );

    return (
        <button
            type="button"
            className={combinedClassName}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? '좋아요 취소' : '좋아요 추가'}
            onClick={handleClick}
            disabled={isLoading}
        >
            <span className={styles.favoriteButtonInner}>
                <Image
                    src={getCdnUrl(isFavorite ? '/images/heart.png' : '/images/blank_heart.png')}
                    alt="좋아요 아이콘"
                    width={20}
                    height={18}
                    className={styles.favoriteHeartImage}
                    priority={false}
                />
            </span>
        </button>
    );
}
