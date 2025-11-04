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