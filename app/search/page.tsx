import SearchResultsClient from './SearchResultsClient';
import styles from './page.module.css';
import { fetchProductSearch } from '@/app/store/api/product';

type RawSearchParams = Record<string, string | string[] | undefined>;

const DEFAULT_PAGE_SIZE = 30;
const DEFAULT_SORT = 'productName,asc';

const parseSingleValue = (value: string | string[] | undefined) => {
    if (Array.isArray(value)) {
        return value[0];
    }
    return value;
};

const parseNumberParam = (value: string | undefined, fallback: number, min = 0) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < min) {
        return fallback;
    }
    return Math.floor(parsed);
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
    const params = await searchParams;

    const rawKeyword = parseSingleValue(params.q) ?? '';
    const keyword = rawKeyword.trim();

    const page = parseNumberParam(parseSingleValue(params.page), 0, 0);
    const size = parseNumberParam(parseSingleValue(params.size), DEFAULT_PAGE_SIZE, 1);
    const sort = parseSingleValue(params.sort) ?? DEFAULT_SORT;

    if (!keyword) {
        return (
            <div className={styles.container}>
                <div className={styles.emptyState}>검색어를 입력하면 결과를 보여드릴게요.</div>
            </div>
        );
    }

    try {
        const data = await fetchProductSearch(
            {
                query: keyword,
                page,
                size,
                sort,
            },
            { cache: 'no-store' },
        );

        const totalElements = data.totalElements ?? data.content.length;

        return (
            <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>
                        <span className={styles.keyword}>'{keyword}'</span>
                        (으)로 검색한 결과입니다.
                    </h1>
                    <p className={styles.meta}>총 {totalElements.toLocaleString()}개 제품</p>
                </header>
                <SearchResultsClient keyword={keyword} data={data} page={page} size={size} />
            </div>
        );
    } catch (error) {
        console.error('[SearchPage] 제품 검색 실패', error);
        return (
            <div className={styles.container}>
                <div className={styles.errorState}>제품 검색 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.</div>
            </div>
        );
    }
}
