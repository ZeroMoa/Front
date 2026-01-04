'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './FavoriteToggleButton.module.css';
import { FAVORITE_TOGGLE_COOLDOWN_MS, toggleFavoriteProduct } from '@/app/(user)/store/api/userFavoriteApi';
import { useIsLoggedIn } from '@/app/(user)/hooks/useAuth';
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

    useEffect(() => {
        setIsFavorite(Boolean(initialIsFavorite));
        setLikesCount(initialLikesCount);
    }, [initialIsFavorite, initialLikesCount]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const handleFavoriteUpdated = (event: Event) => {
            const detail = (event as CustomEvent).detail;
            if (detail?.resetAllFavorites) {
                setIsFavorite(false);
                setLikesCount(initialLikesCount);
                return;
            }
            if (detail && detail.productNo === productNo) {
                setIsFavorite(detail.isFavorite);
                setLikesCount(detail.likesCount);
            }
        };

        window.addEventListener('favorite-updated', handleFavoriteUpdated);
        return () => {
            window.removeEventListener('favorite-updated', handleFavoriteUpdated);
        };
    }, [initialLikesCount, productNo]);

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

    const persistFavoriteState = (payload: { productNo: number; isFavorite: boolean; likesCount: number }) => {
        if (typeof window === 'undefined') {
            return;
        }
        try {
            window.dispatchEvent(new CustomEvent('favorite-updated', { detail: payload }));
            
            // 전역 맵 업데이트
            const storageKey = 'favorite:map';
            const stored = window.sessionStorage.getItem(storageKey);
            const map = stored ? JSON.parse(stored) : {};
            map[payload.productNo] = {
                isFavorite: payload.isFavorite,
                likesCount: payload.likesCount,
                timestamp: Date.now()
            };
            window.sessionStorage.setItem(storageKey, JSON.stringify(map));
        } catch (error) {
            console.warn('[FavoriteToggleButton] 상태 동기화 실패', error);
        }
    };

    const handleClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
            event.preventDefault();
            event.stopPropagation();

            if (!isLoggedIn) {
                alert('로그인 후 이용해주세요~.~');
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

            const previousIsFavorite = isFavorite;
            const previousLikesCount = likesCount;

        // Optimistic UI Update
                const optimisticIsFavorite = !previousIsFavorite;
                const optimisticLikesCount = Math.max(0, previousLikesCount + (optimisticIsFavorite ? 1 : -1));

                setIsFavorite(optimisticIsFavorite);
                setLikesCount(optimisticLikesCount);
                onChange?.({ isFavorite: optimisticIsFavorite, likesCount: optimisticLikesCount });
        persistFavoriteState({ productNo, isFavorite: optimisticIsFavorite, likesCount: optimisticLikesCount });

        try {
            const result = await toggleFavoriteProduct(productNo);
            const resolvedIsFavorite =
                typeof result.isFavorite === 'boolean' ? result.isFavorite : optimisticIsFavorite;
            const resolvedLikesCount =
                typeof result.likesCount === 'number' && !Number.isNaN(result.likesCount)
                    ? result.likesCount
                    : optimisticLikesCount;

            // Sync with actual response (with fallbacks)
            setIsFavorite(resolvedIsFavorite);
            setLikesCount(resolvedLikesCount);
            onChange?.({ isFavorite: resolvedIsFavorite, likesCount: resolvedLikesCount });
            persistFavoriteState({ productNo, isFavorite: resolvedIsFavorite, likesCount: resolvedLikesCount });
            } catch (error) {
                const rawStatus = (error as Error & { status?: number }).status;
                const statusFromMessage =
                    !rawStatus && error instanceof Error && /\b429\b/.test(error.message) ? 429 : undefined;
                const status = rawStatus ?? statusFromMessage;

                if (status === 401) {
                    alert('로그인 후 이용해주세요~.~');
                } else if (status === 429) {
                    alert('너무 빠르게 누르고 있어요. 잠시 후 다시 시도해주세요.');
                } else {
                    const sanitizedMessage =
                        error instanceof Error && /^API 요청 실패/i.test(error.message)
                            ? '좋아요 처리 중 오류가 발생했습니다.'
                            : error instanceof Error
                              ? error.message
                              : '좋아요 처리 중 오류가 발생했습니다.';
                    alert(sanitizedMessage);
                }

            // Rollback on error
                setIsFavorite(previousIsFavorite);
                setLikesCount(previousLikesCount);
                onChange?.({ isFavorite: previousIsFavorite, likesCount: previousLikesCount });
            persistFavoriteState({ productNo, isFavorite: previousIsFavorite, likesCount: previousLikesCount });
            } finally {
                setIsLoading(false);
            }
    };

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
                    src={getCdnUrl(isFavorite ? '/images/heart2.png' : '/images/blank_heart.png')}
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
