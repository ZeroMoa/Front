export interface Pageable {
    pageNumber: number;
    pageSize: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
}

export interface ProductResponse {
    content: Product[];
    pageable: Pageable;
    last: boolean;
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
    sort: {
        empty: boolean;
        sorted: boolean;
        unsorted: boolean;
    };
    first: boolean;
    numberOfElements: number;
    empty: boolean;
}

interface NutritionCriteria {
    type: "zero_calorie" | "zero_sugar" | "low_calorie" | "low_sugar";
}

export interface SearchBody {
    query: string;
    top_k: number;
    category_no?: number;
    parent_category_no?: number;
    nutrition_criteria?: NutritionCriteria;
}

export const CATEGORY_MAPPING = {
    '음료': 1,
    '제과': 2,
    '아이스크림': 3,
    '탄산': 4,
    '주스': 5,
    '유제품': 6,
    '차': 7,
    '커피': 8,
    '에너지 드링크': 9,
    '주류': 10,
    '과자': 12,
    '사탕': 13,
    '젤리': 14,
    '초콜릿': 15,
    '시리얼': 16
} as const;

export type CategoryType = keyof typeof CATEGORY_MAPPING;

export interface Product {
    productNo: number; // BIGSERIAL
    productName: string; // VARCHAR(255)
    imageUrl: string; // VARCHAR(255)
    imageurl?: string; // legacy
  
    categoryNo: number; // BIGINT
    parentCategoryNo: number; // BIGINT
    companyName: string; // VARCHAR(255)
    manufacturerName: string; // VARCHAR(255)
    distributorName: string; // VARCHAR(255)
  
    // 용량 정보
    totalContent: string; // VARCHAR(255)
    servingSize: number; // NUMERIC
    servingUnit: string; // VARCHAR(255)
  
    // 영양성분표 기준
    nutritionBasisText: string; // VARCHAR(255)
    nutritionBasisValue: number; // NUMERIC
    nutritionBasisUnit: string; // VARCHAR(50)
  
    // 기본 영양성분
    energyKcal: number; // NUMERIC
    carbohydrateG: number; // NUMERIC
    proteinG: number; // NUMERIC
    fatG: number; // NUMERIC
    saturatedFattyAcidsG: number; // NUMERIC
    transFattyAcidsG: number; // NUMERIC
    cholesterolMg: number; // NUMERIC
    sodiumMg: number; // NUMERIC
  
    // 당 관련 성분
    sugarG: number; // NUMERIC
    sugarAlcoholG: number; // NUMERIC
    alluloseG: number; // NUMERIC
    erythritolG: number; // NUMERIC
  
    // 기타 영양성분
    caffeineMg: number; // NUMERIC
    taurineMg: number; // NUMERIC
    otherNutrition: string; // TEXT
  
    // 원재료/알레르기
    ingredients: string; // TEXT
    allergens: string; // TEXT
    crossContaminationWarning: string; // TEXT
  
    // 제품 특성
    isRenewal: boolean; // BOOLEAN DEFAULT FALSE
    foodType: string; // VARCHAR(255)
  
    // 시간 기록
    createdAt: string; // TIMESTAMP
    updatedAt: string; // TIMESTAMP
  
    // 건강 분류
    isZeroCalorie: boolean; // BOOLEAN DEFAULT FALSE
    isZeroSugar: boolean; // BOOLEAN DEFAULT FALSE
    isLowCalorie: boolean; // BOOLEAN DEFAULT FALSE
    isLowSugar: boolean; // BOOLEAN DEFAULT FALSE
    likesCount?: number;
    isFavorite?: boolean;
  }
  
  export interface Sort {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  }
  
  export interface Pageable {
    pageNumber: number;
    pageSize: number;
    sort: Sort;
    offset: number;
    paged: boolean;
    unpaged: boolean;
  }
  
  export interface PageResponse {
    content: Product[];
    pageable: Pageable;
    last: boolean;
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    sort: Sort;
    first: boolean;
    numberOfElements: number;
    empty: boolean;
  }

type RawValue = string | number | boolean | null | undefined;

const coalesce = (...values: RawValue[]): RawValue | undefined => {
    for (const value of values) {
        if (value !== null && value !== undefined) {
            return value;
        }
    }
    return undefined;
};

const coerceString = (value: RawValue): string => {
    if (value === null || value === undefined) {
        return '';
    }
    if (typeof value === 'string') {
        return value.trim();
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
        return String(value);
    }
    return '';
};

const coerceNumber = (value: RawValue, fallback = 0): number => {
    if (value === null || value === undefined) {
        return fallback;
    }
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : fallback;
    }
    if (typeof value === 'string') {
        const sanitized = value.trim().replace(/,/g, '');
        if (!sanitized) {
            return fallback;
        }
        const parsed = Number(sanitized);
        return Number.isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
};

const coerceBoolean = (value: RawValue): boolean => {
    if (typeof value === 'boolean') {
        return value;
    }
    if (typeof value === 'number') {
        return value !== 0;
    }
    if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase();
        if (normalized === 'true' || normalized === '1') {
            return true;
        }
        if (normalized === 'false' || normalized === '0') {
            return false;
        }
    }
    return false;
};

type RawProduct = Partial<Product> & Record<string, unknown>;

export const normalizeProduct = (rawProduct: RawProduct): Product => {
    const productNo = coerceNumber(coalesce(rawProduct.productNo as RawValue, rawProduct['product_no'] as RawValue));
    const categoryNo = coerceNumber(coalesce(rawProduct.categoryNo as RawValue, rawProduct['category_no'] as RawValue));
    const parentCategoryNo = coerceNumber(
        coalesce(
            rawProduct.parentCategoryNo as RawValue,
            rawProduct['parent_category_no'] as RawValue,
            rawProduct.categoryNo as RawValue,
            rawProduct['category_no'] as RawValue,
        ),
    );

    const normalized: Product = {
        productNo: Number.isNaN(productNo) ? 0 : productNo,
        productName: coerceString(coalesce(rawProduct.productName as RawValue, rawProduct['product_name'] as RawValue)),
        imageUrl: coerceString(coalesce(rawProduct.imageUrl as RawValue, rawProduct['image_url'] as RawValue, rawProduct['imageurl'] as RawValue)),
        imageurl: coerceString(rawProduct['imageurl'] as RawValue) || undefined,
        categoryNo: Number.isNaN(categoryNo) ? 0 : categoryNo,
        parentCategoryNo: Number.isNaN(parentCategoryNo) ? Number.isNaN(categoryNo) ? 0 : categoryNo : parentCategoryNo,
        companyName: coerceString(coalesce(rawProduct.companyName as RawValue, rawProduct['company_name'] as RawValue)),
        manufacturerName: coerceString(coalesce(rawProduct.manufacturerName as RawValue, rawProduct['manufacturer_name'] as RawValue)),
        distributorName: coerceString(coalesce(rawProduct.distributorName as RawValue, rawProduct['distributor_name'] as RawValue)),
        totalContent: coerceString(coalesce(rawProduct.totalContent as RawValue, rawProduct['total_content'] as RawValue)),
        servingSize: coerceNumber(coalesce(rawProduct.servingSize as RawValue, rawProduct['serving_size'] as RawValue)),
        servingUnit: coerceString(coalesce(rawProduct.servingUnit as RawValue, rawProduct['serving_unit'] as RawValue)),
        nutritionBasisText: coerceString(coalesce(rawProduct.nutritionBasisText as RawValue, rawProduct['nutrition_basis_text'] as RawValue)),
        nutritionBasisValue: coerceNumber(
            coalesce(rawProduct.nutritionBasisValue as RawValue, rawProduct['nutrition_basis_value'] as RawValue),
        ),
        nutritionBasisUnit: coerceString(
            coalesce(rawProduct.nutritionBasisUnit as RawValue, rawProduct['nutrition_basis_unit'] as RawValue),
        ),
        energyKcal: coerceNumber(coalesce(rawProduct.energyKcal as RawValue, rawProduct['energy_kcal'] as RawValue)),
        carbohydrateG: coerceNumber(coalesce(rawProduct.carbohydrateG as RawValue, rawProduct['carbohydrate_g'] as RawValue)),
        proteinG: coerceNumber(coalesce(rawProduct.proteinG as RawValue, rawProduct['protein_g'] as RawValue)),
        fatG: coerceNumber(coalesce(rawProduct.fatG as RawValue, rawProduct['fat_g'] as RawValue)),
        saturatedFattyAcidsG: coerceNumber(
            coalesce(rawProduct.saturatedFattyAcidsG as RawValue, rawProduct['saturated_fatty_acids_g'] as RawValue),
        ),
        transFattyAcidsG: coerceNumber(
            coalesce(rawProduct.transFattyAcidsG as RawValue, rawProduct['trans_fatty_acids_g'] as RawValue),
        ),
        cholesterolMg: coerceNumber(coalesce(rawProduct.cholesterolMg as RawValue, rawProduct['cholesterol_mg'] as RawValue)),
        sodiumMg: coerceNumber(coalesce(rawProduct.sodiumMg as RawValue, rawProduct['sodium_mg'] as RawValue)),
        sugarG: coerceNumber(coalesce(rawProduct.sugarG as RawValue, rawProduct['sugar_g'] as RawValue)),
        sugarAlcoholG: coerceNumber(coalesce(rawProduct.sugarAlcoholG as RawValue, rawProduct['sugar_alcohol_g'] as RawValue)),
        alluloseG: coerceNumber(coalesce(rawProduct.alluloseG as RawValue, rawProduct['allulose_g'] as RawValue)),
        erythritolG: coerceNumber(coalesce(rawProduct.erythritolG as RawValue, rawProduct['erythritol_g'] as RawValue)),
        caffeineMg: coerceNumber(coalesce(rawProduct.caffeineMg as RawValue, rawProduct['caffeine_mg'] as RawValue)),
        taurineMg: coerceNumber(coalesce(rawProduct.taurineMg as RawValue, rawProduct['taurine_mg'] as RawValue)),
        otherNutrition: coerceString(coalesce(rawProduct.otherNutrition as RawValue, rawProduct['other_nutrition'] as RawValue)),
        ingredients: coerceString(coalesce(rawProduct.ingredients as RawValue, rawProduct['ingredients'] as RawValue)),
        allergens: coerceString(coalesce(rawProduct.allergens as RawValue, rawProduct['allergens'] as RawValue)),
        crossContaminationWarning: coerceString(
            coalesce(rawProduct.crossContaminationWarning as RawValue, rawProduct['cross_contamination_warning'] as RawValue),
        ),
        isRenewal: coerceBoolean(coalesce(rawProduct.isRenewal as RawValue, rawProduct['is_renewal'] as RawValue)),
        foodType: coerceString(coalesce(rawProduct.foodType as RawValue, rawProduct['food_type'] as RawValue)),
        createdAt: coerceString(coalesce(rawProduct.createdAt as RawValue, rawProduct['created_at'] as RawValue)),
        updatedAt: coerceString(coalesce(rawProduct.updatedAt as RawValue, rawProduct['updated_at'] as RawValue)),
        isZeroCalorie: coerceBoolean(coalesce(rawProduct.isZeroCalorie as RawValue, rawProduct['is_zero_calorie'] as RawValue)),
        isZeroSugar: coerceBoolean(coalesce(rawProduct.isZeroSugar as RawValue, rawProduct['is_zero_sugar'] as RawValue)),
        isLowCalorie: coerceBoolean(coalesce(rawProduct.isLowCalorie as RawValue, rawProduct['is_low_calorie'] as RawValue)),
        isLowSugar: coerceBoolean(coalesce(rawProduct.isLowSugar as RawValue, rawProduct['is_low_sugar'] as RawValue)),
    };

    if ('likesCount' in rawProduct || 'likes_count' in rawProduct) {
        const likesCount = coerceNumber(
            coalesce(rawProduct['likesCount'] as RawValue, rawProduct['likes_count'] as RawValue),
        );
        normalized.likesCount = likesCount;
    }

    if ('isFavorite' in rawProduct || 'is_favorite' in rawProduct) {
        normalized.isFavorite = coerceBoolean(
            coalesce(rawProduct['isFavorite'] as RawValue, rawProduct['is_favorite'] as RawValue),
        );
    }

    return normalized;
};