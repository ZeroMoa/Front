import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
    isLoginModalOpen: boolean;
    // 여기에 로그인 상태 (예: isLoggedIn, userToken, user 등)를 추가할 수 있습니다.
    // isLoggedIn: boolean;
    // user: { id: string; username: string; } | null;
}

const initialState: AuthState = {
    isLoginModalOpen: false,
    // isLoggedIn: false,
    // user: null,
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
        // setLoggedIn: (state, action: PayloadAction<boolean>) => {
        //     state.isLoggedIn = action.payload;
        // },
        // setUser: (state, action: PayloadAction<{ id: string; username: string; } | null>) => {
        //     state.user = action.payload;
        // },
    },
});

export const { openLoginModal, closeLoginModal } = authSlice.actions; // setLoggedIn, setUser
export default authSlice.reducer;
