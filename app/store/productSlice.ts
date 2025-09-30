import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Product, ProductResponse } from '../types/product';

interface ProductState {
    products: Product[];
    pageInfo: Omit<ProductResponse, 'content'> | null;
    isLoading: boolean;
    error: string | null;
    filters: {
        isZeroCalorie: boolean;
        isZeroSugar: boolean;
        isLowCalorie: boolean;
        isLowSugar: boolean;
    };
    selectedCategories: string[];
    searchQuery: string;
}

const initialState: ProductState = {
    products: [],
    pageInfo: null,
    isLoading: false,
    error: null,
    filters: {
        isZeroCalorie: false,
        isZeroSugar: false,
        isLowCalorie: false,
        isLowSugar: false
    },
    selectedCategories: [],
    searchQuery: '',
};

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        setProducts:(state, action: PayloadAction<Product[]>) => {
            state.products = action.payload;
        },
        setPageInfo:(state, action: PayloadAction<Omit<ProductResponse, 'content'>>) => {
            state.pageInfo = action.payload;
        },
        setIsLoading:(state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError:(state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
        setFilter: (state, action: PayloadAction<{filterName: keyof ProductState['filters'], value: boolean}>) => {
            const { filterName, value } = action.payload;
            state.filters[filterName] = value;
        },
        setSelectedCategories: (state, action: PayloadAction<string[]>) => {
            state.selectedCategories = action.payload;
        },
        resetFilters: (state) => {
            state.filters = initialState.filters;
            state.searchQuery = '';
        },
        setSearchQuery: (state, action: PayloadAction<string>) => {
            state.searchQuery = action.payload;
        },
        resetState: (state) => {
            return initialState;
        }
    },
});

export const { setProducts, setPageInfo, setIsLoading, setError, setFilter, setSelectedCategories, resetFilters, setSearchQuery, resetState } = productSlice.actions;
export default productSlice.reducer;
