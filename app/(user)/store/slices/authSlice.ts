import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store'; // RootState import

interface AuthState {
    isLoginModalOpen: boolean;
    isLoggedIn: boolean; // 로그인 상태 추가
    user: { id: string; username: string; } | null; // 사용자 정보 추가
}

// localStorage에서 초기 로그인 상태를 로드하는 대신, 초기값은 false로 설정합니다.
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
            if (typeof window !== 'undefined') {
                if (action.payload) {
                    localStorage.setItem('isLoggedIn', 'true');
                } else {
                    localStorage.removeItem('isLoggedIn');
                }
            }
        },
        setUser: (state, action: PayloadAction<{ id: string; username: string; } | null>) => {
            state.user = action.payload;
            if (typeof window !== 'undefined') {
                if (action.payload) {
                    localStorage.setItem('user', JSON.stringify(action.payload));
                } else {
                    localStorage.removeItem('user');
                }
            }
        },
        logout: (state) => {
            state.isLoggedIn = false;
            state.user = null;
            if (typeof window !== 'undefined') {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('user');
            }
        },
    },
});

export const { openLoginModal, closeLoginModal, setLoggedIn, setUser, logout } = authSlice.actions;

// isLoggedIn 상태를 선택하는 셀렉터
export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn;

export default authSlice.reducer;
