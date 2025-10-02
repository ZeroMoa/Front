import Image from 'next/image'
import Link from 'next/link'
import styles from './MainHeader.module.css'
import { useAppDispatch } from '../app/store/store';
import { resetState } from '../app/store/productSlice';
import { openLoginModal } from '../app/store/authSlice'; // openLoginModal 액션 import
import { useRouter } from 'next/navigation';

export default function Header() {
    const dispatch = useAppDispatch();
    const router = useRouter();

    const handleNavigation = (path: string) => {
        dispatch(resetState()); // 상태 초기화
        router.push(path); // 페이지 이동
    };

    const handleLoginClick = () => {
        dispatch(openLoginModal()); // 로그인 모달 열기
    };

    return (
        <header>
            <nav className={styles.wrap}>
                <div className={styles.navContainer}>
                    <div className={styles.logo}>
                        <Link href="/" onClick={() => dispatch(resetState())}>
                            <Image src="/images/logo.png" alt="제로모아" width={190} height={100} priority={true}/>
                        </Link>
                    </div>
                    <ul className={styles.nav_links}>
                        <li>
                            <button onClick={() => handleNavigation('/categories/drinks')} className={styles.linkButton}>
                                <Image src="/images/drinks.png" alt="음료" width={24} height={24} />음료
                            </button>
                        </li>
                        <li>
                            <button onClick={() => handleNavigation('/categories/snacks')} className={styles.linkButton}>
                                <Image src="/images/snack.png" alt="과자" width={24} height={24} />과자
                            </button>
                        </li>
                        <li>
                            <button onClick={() => handleNavigation('/categories/icecream')} className={styles.linkButton}>
                                <Image src="/images/icecream.png" alt="아이스크림" width={24} height={24} />아이스크림
                            </button>
                        </li>
                        {/* <li>
                            <button onClick={() => handleNavigation('/cafe')} className={styles.linkButton}>
                                <Image src="/images/cafe.png" alt="카페" width={24} height={24} />카페
                            </button>
                        </li> */}
                    </ul>
                    <div className={styles.authSection}>
                        <button onClick={handleLoginClick} className={styles.loginButton}>
                            로그인
                        </button>
                    </div>
                </div>
            </nav>
        </header>
    )
}