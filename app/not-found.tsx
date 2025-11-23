'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './not-found.module.css';
import { getCdnUrl } from '@/lib/cdn';

function BackButtons() {
    const router = useRouter();

    const handleGoBack = () => {
        if (typeof window !== 'undefined' && window.history.length > 1) {
            router.back();
            return;
        }
        router.replace('/');
    };

    return (
        <div className={styles.buttonRow}>
            <button type="button" className={styles.secondaryButton} onClick={handleGoBack}>
                이전 페이지로
            </button>
            <Link href="/" className={styles.primaryButton}>
                메인으로 이동
            </Link>
        </div>
    );
}

export default function NotFound() {
    return (
        <div className={styles.wrapper}>
            <Image
                src={getCdnUrl('/images/error.jpg')}
                alt="페이지를 찾을 수 없습니다."
                width={360}
                height={270}
                className={styles.image}
                priority
            />
            <p className={styles.message}>
                요청하신 페이지를 찾을 수 없어요.
                <br />
                주소가 정확한지 다시 한 번 확인해 주세요.
            </p>
            <BackButtons />
        </div>
    );
}
