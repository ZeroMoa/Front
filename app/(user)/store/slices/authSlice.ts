import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store'; // RootState import

interface AuthState {
    isLoginModalOpen: boolean;
    isLoggedIn: boolean; // 로그인 상태 추가
    user: { id: string; username: string; } | null; // 사용자 정보 추가
}

// 초기 로그인 상태는 항상 false에서 시작합니다.
const initialState: AuthState = {
    isLoginModalOpen: false,
    isLoggedIn: false,
    user: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        openLoginModal: (state) => {
            state.isLoginModalOpen = true;
        },
        closeLoginModal: (state) => {
            state.isLoginModalOpen = false;
        },
        setLoggedIn: (state, action: PayloadAction<boolean>) => {
            state.isLoggedIn = action.payload;
        },
        setUser: (state, action: PayloadAction<{ id: string; username: string; } | null>) => {
            state.user = action.payload;
        },
        logout: (state) => {
            state.isLoggedIn = false;
            state.user = null;
        },
    },
});

export const { openLoginModal, closeLoginModal, setLoggedIn, setUser, logout } = authSlice.actions;

// isLoggedIn 상태를 선택하는 셀렉터
export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn;

export default authSlice.reducer;
