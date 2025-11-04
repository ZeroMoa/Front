export type CategorySlug = 'drinks' | 'snacks' | 'icecream';
export type NutritionSlug = 'zero-calorie' | 'zero-sugar' | 'low-calorie' | 'low-sugar';

export const CATEGORY_LABELS: Record<CategorySlug, string> = {
    drinks: '음료',
    snacks: '제과',
    icecream: '아이스크림',
};

export const CATEGORY_SLUG_ORDER: CategorySlug[] = ['drinks', 'snacks', 'icecream'];

export interface ProductFilterConfig {
    isZeroCalorie?: boolean;
    isZeroSugar?: boolean;
    isLowCalorie?: boolean;
    isLowSugar?: boolean;
}

export interface SubCategoryConfig {
    slug: string;
    label: string;
    categoryNo: number;
}

interface BasePageConfig {
    title: string;
    description: string;
    defaultSort: string;
    pageSizeOptions: number[];
}

export interface CategoryPageConfig extends BasePageConfig {
    kind: 'category';
    slug: CategorySlug;
    categoryNo: number;
    subCategories: SubCategoryConfig[];
    bannerImage?: string;
}

export interface NutritionPageConfig extends BasePageConfig {
    kind: 'nutrition';
    slug: NutritionSlug;
    endpoint: NutritionSlug;
    defaultFilters: Partial<Record<ProductFilterKey, boolean>>;
    lockedFilters: ProductFilterKey[];
    subCategories?: SubCategoryConfig[];
}

export type ProductPageConfig = CategoryPageConfig | NutritionPageConfig;

const DEFAULT_PAGE_SIZE_OPTIONS = [30, 60, 90];

export const DEFAULT_CATEGORY_SLUG: CategorySlug = 'drinks';

export const CATEGORY_CONFIG: Record<CategorySlug, CategoryPageConfig> = {
    drinks: {
        kind: 'category',
        slug: 'drinks',
        title: '음료 카테고리',
        description: '제로부터 저당까지 다양한 음료를 확인해보세요.',
        categoryNo: 1,
        defaultSort: 'productName,asc',
        pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
        subCategories: [
            { slug: 'all', label: '전체', categoryNo: 1 },
            { slug: 'sparkling', label: '탄산', categoryNo: 5 },
            { slug: 'juice', label: '주스', categoryNo: 6 },
            { slug: 'dairy', label: '유제품', categoryNo: 7 },
            { slug: 'tea', label: '차', categoryNo: 8 },
            { slug: 'coffee', label: '커피', categoryNo: 9 },
            { slug: 'energy', label: '에너지 드링크', categoryNo: 10 },
            { slug: 'alcohol', label: '주류', categoryNo: 11 },
            { slug: 'etc', label: '기타', categoryNo: 12 },
        ],
    },
    snacks: {
        kind: 'category',
        slug: 'snacks',
        title: '과자 카테고리',
        description: '간식이 필요한 순간에 어울리는 제품을 골라보세요.',
        categoryNo: 2,
        defaultSort: 'productName,asc',
        pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
        subCategories: [
            { slug: 'all', label: '전체', categoryNo: 2 },
            { slug: 'chips', label: '과자', categoryNo: 13 },
            { slug: 'candy', label: '사탕', categoryNo: 14 },
            { slug: 'jelly', label: '젤리', categoryNo: 15 },
            { slug: 'chocolate', label: '초콜릿', categoryNo: 16 },
            { slug: 'cereal', label: '시리얼', categoryNo: 17 },
            { slug: 'etc', label: '기타', categoryNo: 18 },
        ],
    },
    icecream: {
        kind: 'category',
        slug: 'icecream',
        title: '아이스크림 카테고리',
        description: '시원한 즐거움을 선사하는 아이스크림 제품 모음.',
        categoryNo: 3,
        defaultSort: 'productName,asc',
        pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
        subCategories: [{ slug: 'all', label: '전체', categoryNo: 3 }],
    },
};

export const NUTRITION_CONFIG: Record<NutritionSlug, NutritionPageConfig> = {
    'zero-calorie': {
        kind: 'nutrition',
        slug: 'zero-calorie',
        endpoint: 'zero-calorie',
        title: '제로 칼로리',
        description: '100g(ml)당 4kcal 미만의 제품을 모아봤어요.',
        defaultSort: 'productName,asc',
        pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
        defaultFilters: { isZeroCalorie: true },
        lockedFilters: ['isZeroCalorie'],
        subCategories: [{ slug: 'all', label: '전체', categoryNo: 0 }],
    },
    'zero-sugar': {
        kind: 'nutrition',
        slug: 'zero-sugar',
        endpoint: 'zero-sugar',
        title: '제로 슈가',
        description: '100g(ml)당 0.5g 미만의 당류를 가진 제품만!',
        defaultSort: 'productName,asc',
        pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
        defaultFilters: { isZeroSugar: true },
        lockedFilters: ['isZeroSugar'],
        subCategories: [{ slug: 'all', label: '전체', categoryNo: 0 }],
    },
    'low-calorie': {
        kind: 'nutrition',
        slug: 'low-calorie',
        endpoint: 'low-calorie',
        title: '저칼로리',
        description: '100g당 40kcal, 100ml당 20kcal 미만 제품 선별.',
        defaultSort: 'productName,asc',
        pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
        defaultFilters: { isLowCalorie: true },
        lockedFilters: ['isLowCalorie'],
        subCategories: [{ slug: 'all', label: '전체', categoryNo: 0 }],
    },
    'low-sugar': {
        kind: 'nutrition',
        slug: 'low-sugar',
        endpoint: 'low-sugar',
        title: '저당 식품',
        description: '100g당 5g, 100ml당 2.5g 미만 저당 제품 모음.',
        defaultSort: 'productName,asc',
        pageSizeOptions: DEFAULT_PAGE_SIZE_OPTIONS,
        defaultFilters: { isLowSugar: true },
        lockedFilters: ['isLowSugar'],
        subCategories: [{ slug: 'all', label: '전체', categoryNo: 0 }],
    },
};

export const PRODUCT_FILTER_KEYS = [
    'isZeroCalorie',
    'isZeroSugar',
    'isLowCalorie',
    'isLowSugar',
] as const;

export type ProductFilterKey = typeof PRODUCT_FILTER_KEYS[number];

export const DEFAULT_FILTER_STATE: Record<ProductFilterKey, boolean> = {
    isZeroCalorie: false,
    isZeroSugar: false,
    isLowCalorie: false,
    isLowSugar: false,
};

export function isCategorySlug(value: string): value is CategorySlug {
    return Object.prototype.hasOwnProperty.call(CATEGORY_CONFIG, value);
}

export function isNutritionSlug(value: string): value is NutritionSlug {
    return Object.prototype.hasOwnProperty.call(NUTRITION_CONFIG, value);
}

export function getSubCategorySlug(
    config: CategoryPageConfig,
    slug: string | undefined,
): SubCategoryConfig {
    if (!slug) {
        return config.subCategories[0];
    }

    const matched = config.subCategories.find((item) => item.slug === slug);
    return matched ?? config.subCategories[0];
}

