'use client'

import { useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './page.module.css';
import { useAdminBoardDetail } from '@/app/admin/hooks/boardHooks';
import { BOARD_TYPE_LABELS } from '@/constants/boardConstants';
import Link from 'next/link';
import { BoardType } from '@/types/boardTypes';

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

    const { data, isLoading, isError, error } = useAdminBoardDetail(boardNo);

    const handleBackClick = () => {
        router.push('/admin/boards');
    };

    const renderBackButton = () => (
        <div className={styles.backButtonRow}>
            <button type="button" className={styles.backButton} onClick={handleBackClick} aria-label="목록 페이지로 이동">
                <span className={styles.backIcon} aria-hidden="true" />
                <span className={styles.backText}>목록으로</span>
            </button>
        </div>
    );

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
                <div className={styles.errorBox}>잘못된 접근입니다.</div>
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
                <div className={styles.loadingBox}>게시글을 불러오는 중입니다...</div>
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className={styles.wrapper}>
                {renderBackButton()}
                <div className={styles.errorBox}>{error instanceof Error ? error.message : '게시글을 불러오지 못했습니다.'}</div>
                <div className={styles.actionRow}>
                    <button className={styles.listButton} onClick={handleBackClick}>목록</button>
                </div>
            </div>
        );
    }

    const attachments = data.attachments ?? [];
    const boardTypeLabel = BOARD_TYPE_LABELS[data.boardType] ?? data.boardType;

    return (
        <div className={styles.wrapper}>
            {renderBackButton()}
            <div className={styles.tabWrap}>
                <ul className={styles.tabList}>
                    <li className={`${styles.tabItem} ${styles.activeTab} ${data ? tabClassMap[data.boardType] : ''}`}>
                        <span>{boardTypeLabel}</span>
                    </li>
                </ul>
            </div>

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
                            <Link href={`/admin/boards/${data.prevBoardNo}`} className={styles.neighborLink}>
                                {data.prevBoardTitle ?? '이전 게시글'}
                            </Link>
                        ) : (
                            <span className={styles.neighborValue}>이전 게시글이 없습니다.</span>
                        )}
                    </div>
                    <div className={styles.neighborItem}>
                        <span className={styles.neighborLabel}>다음</span>
                        {data.nextBoardNo ? (
                            <Link href={`/admin/boards/${data.nextBoardNo}`} className={styles.neighborLink}>
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
