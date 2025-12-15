'use client'

import { useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './page.module.css';
import { useBoardDetail } from '../../hooks/useBoard';
import { BOARD_TYPE_LABELS } from '@/constants/boardConstants';
import Link from 'next/link';
import { BoardType } from '@/types/boardTypes';
import Image from 'next/image';
import CircularProgress from '@mui/material/CircularProgress';
import { getCdnUrl } from '@/lib/cdn';

const tabClassMap: Record<BoardType, string> = {
    NOTICE: styles.tabNOTICE,
    FAQ: styles.tabFAQ,
    EVENT: styles.tabEVENT,
};

export default function BoardDetailPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const boardIdParam = params?.id ?? '';
    const boardNo = Number(boardIdParam);

    const { data, isLoading, isError, error } = useBoardDetail(boardNo);
    const boardTypeLabel = data ? BOARD_TYPE_LABELS[data.boardType] ?? data.boardType : undefined;
    const activeTabClass = data ? tabClassMap[data.boardType] : '';

    const handleBackClick = () => {
        router.push('/board');
    };

    const renderBackButton = () => (
        <div className={styles.backButtonRow}>
            <button type="button" className={styles.backButton} onClick={handleBackClick} aria-label="목록 페이지로 이동">
                <span className={styles.backIcon} aria-hidden="true" />
                <span className={styles.backText}>목록으로</span>
            </button>
        </div>
    );

    const renderTabSection = () => {
        if (!data?.boardType || !boardTypeLabel) {
            return null;
        }
        return (
            <div className={styles.metaRow}>
                <div className={styles.tabWrap}>
                    <ul className={styles.tabList}>
                        <li className={`${styles.tabItem} ${styles.activeTab} ${activeTabClass}`}>
                            <span>{boardTypeLabel}</span>
                        </li>
                    </ul>
                </div>
            </div>
        );
    };

    const formattedDate = useMemo(() => {
        if (!data?.createdAt) return '';
        const date = new Date(data.createdAt);
        return new Intl.DateTimeFormat('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        }).format(date);
    }, [data?.createdAt]);

    if (!boardIdParam || Number.isNaN(boardNo)) {
        return (
            <div className={styles.wrapper}>
                {renderBackButton()}
                <div className={styles.errorBox}>
                    <Image src={getCdnUrl('/images/error.jpg')} alt="오류" width={600} height={600} className={styles.statusIcon} />
                    <span>잘못된 접근입니다.</span>
                </div>
                <div className={styles.actionRow}>
                    <button className={styles.listButton} onClick={handleBackClick}>목록</button>
                </div>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className={styles.wrapper}>
                {renderBackButton()}
                <div className={styles.loadingBox}>
                    <CircularProgress size={32} />
                    <span>게시글을 불러오는 중입니다...</span>
                </div>
            </div>
        );
    }

    if (isError || !data) {
        const rawMessage = error instanceof Error ? error.message : '게시글을 불러오지 못했습니다.';
        const normalized = rawMessage.toLowerCase();
        const isNotFound = normalized.includes('404') || normalized.includes('not found');
        const displayMessage = isNotFound ? '잘못된 접근입니다.' : rawMessage;
        return (
            <div className={styles.wrapper}>
                {renderBackButton()}
                <div className={styles.errorBox}>
                    <Image src={getCdnUrl('/images/error.jpg')} alt="오류" width={600} height={600} className={styles.statusIcon} />
                    <span>{displayMessage}</span>
                </div>
                <div className={styles.actionRow}>
                    <button className={styles.listButton} onClick={handleBackClick}>목록</button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.wrapper}>
            {renderBackButton()}
            {renderTabSection()}
            <div className={styles.detailCard}>
                <div className={styles.detailHeader}>
                    <div className={styles.titleRow}>
                        <h1 className={styles.title}>{data.title}</h1>
                        <span className={styles.titleDate}>{formattedDate}</span>
                    </div>
                </div>
                <div
                    className={styles.contentBox}
                    dangerouslySetInnerHTML={{ __html: data.content }}
                />
            </div>

            <div className={styles.actionRow}>
                <button className={styles.listButton} onClick={handleBackClick}>목록</button>
            </div>

            {(data.prevBoardNo || data.nextBoardNo) && (
                <div className={styles.neighborSection}>
                    <div className={styles.neighborItem}>
                        <span className={styles.neighborLabel}>이전</span>
                        {data.prevBoardNo ? (
                            <Link href={`/board/${data.prevBoardNo}`} className={styles.neighborLink}>
                                {data.prevBoardTitle ?? '이전 게시글'}
                            </Link>
                        ) : (
                            <span className={styles.neighborValue}>이전 게시글이 없습니다.</span>
                        )}
                    </div>
                    <div className={styles.neighborItem}>
                        <span className={styles.neighborLabel}>다음</span>
                        {data.nextBoardNo ? (
                            <Link href={`/board/${data.nextBoardNo}`} className={styles.neighborLink}>
                                {data.nextBoardTitle ?? '다음 게시글'}
                            </Link>
                        ) : (
                            <span className={styles.neighborValue}>다음 게시글이 없습니다.</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
