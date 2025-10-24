(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/store/productSlice.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>__TURBOPACK__default__export__,
    "resetFilters",
    ()=>resetFilters,
    "resetState",
    ()=>resetState,
    "setError",
    ()=>setError,
    "setFilter",
    ()=>setFilter,
    "setIsLoading",
    ()=>setIsLoading,
    "setPageInfo",
    ()=>setPageInfo,
    "setProducts",
    ()=>setProducts,
    "setSearchQuery",
    ()=>setSearchQuery,
    "setSelectedCategories",
    ()=>setSelectedCategories
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
;
const initialState = {
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
    searchQuery: ''
};
const productSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'product',
    initialState,
    reducers: {
        setProducts: (state, action)=>{
            state.products = action.payload;
        },
        setPageInfo: (state, action)=>{
            state.pageInfo = action.payload;
        },
        setIsLoading: (state, action)=>{
            state.isLoading = action.payload;
        },
        setError: (state, action)=>{
            state.error = action.payload;
        },
        setFilter: (state, action)=>{
            const { filterName, value } = action.payload;
            state.filters[filterName] = value;
        },
        setSelectedCategories: (state, action)=>{
            state.selectedCategories = action.payload;
        },
        resetFilters: (state)=>{
            state.filters = initialState.filters;
            state.searchQuery = '';
        },
        setSearchQuery: (state, action)=>{
            state.searchQuery = action.payload;
        },
        resetState: (state)=>{
            return initialState;
        }
    }
});
const { setProducts, setPageInfo, setIsLoading, setError, setFilter, setSelectedCategories, resetFilters, setSearchQuery, resetState } = productSlice.actions;
const __TURBOPACK__default__export__ = productSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/store/authSlice.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "closeLoginModal",
    ()=>closeLoginModal,
    "default",
    ()=>__TURBOPACK__default__export__,
    "logout",
    ()=>logout,
    "openLoginModal",
    ()=>openLoginModal,
    "selectIsLoggedIn",
    ()=>selectIsLoggedIn,
    "setLoggedIn",
    ()=>setLoggedIn,
    "setUser",
    ()=>setUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
;
// localStorage에서 초기 로그인 상태를 로드하는 대신, 초기값은 false로 설정합니다.
const initialState = {
    isLoginModalOpen: false,
    isLoggedIn: false,
    user: null
};
const authSlice = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createSlice"])({
    name: 'auth',
    initialState,
    reducers: {
        openLoginModal: (state)=>{
            state.isLoginModalOpen = true;
        },
        closeLoginModal: (state)=>{
            state.isLoginModalOpen = false;
        },
        setLoggedIn: (state, action)=>{
            state.isLoggedIn = action.payload;
            if ("TURBOPACK compile-time truthy", 1) {
                if (action.payload) {
                    localStorage.setItem('isLoggedIn', 'true');
                } else {
                    localStorage.removeItem('isLoggedIn');
                }
            }
        },
        setUser: (state, action)=>{
            state.user = action.payload;
            if ("TURBOPACK compile-time truthy", 1) {
                if (action.payload) {
                    localStorage.setItem('user', JSON.stringify(action.payload));
                } else {
                    localStorage.removeItem('user');
                }
            }
        },
        logout: (state)=>{
            state.isLoggedIn = false;
            state.user = null;
            if ("TURBOPACK compile-time truthy", 1) {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('user');
            }
        }
    }
});
const { openLoginModal, closeLoginModal, setLoggedIn, setUser, logout } = authSlice.actions;
const selectIsLoggedIn = (state)=>state.auth.isLoggedIn;
const __TURBOPACK__default__export__ = authSlice.reducer;
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/store/store.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "store",
    ()=>store,
    "useAppDispatch",
    ()=>useAppDispatch,
    "useAppSelector",
    ()=>useAppSelector
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$productSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/productSlice.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$authSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/authSlice.ts [app-client] (ecmascript)"); // authSlice import
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-redux/dist/react-redux.mjs [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
;
;
const store = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$reduxjs$2f$toolkit$2f$dist$2f$redux$2d$toolkit$2e$modern$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["configureStore"])({
    reducer: {
        product: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$productSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"],
        auth: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$authSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"]
    }
});
const useAppDispatch = ()=>{
    _s();
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDispatch"])();
};
_s(useAppDispatch, "jI3HA1r1Cumjdbu14H7G+TUj798=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDispatch"]
    ];
});
const useAppSelector = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSelector"];
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/provider.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "Providers",
    ()=>Providers
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/react-redux/dist/react-redux.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/store.ts [app-client] (ecmascript)");
'use client';
;
;
;
function Providers(param) {
    let { children } = param;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$react$2d$redux$2f$dist$2f$react$2d$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Provider"], {
        store: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["store"],
        children: children
    }, void 0, false, {
        fileName: "[project]/app/provider.tsx",
        lineNumber: 8,
        columnNumber: 9
    }, this);
}
_c = Providers;
var _c;
__turbopack_context__.k.register(_c, "Providers");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/MainHeader.module.css [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "authLinkButton": "MainHeader-module__04TKmW__authLinkButton",
  "authLinks": "MainHeader-module__04TKmW__authLinks",
  "authSection": "MainHeader-module__04TKmW__authSection",
  "authSeparator": "MainHeader-module__04TKmW__authSeparator",
  "closeButton": "MainHeader-module__04TKmW__closeButton",
  "headerIcon": "MainHeader-module__04TKmW__headerIcon",
  "iconButton": "MainHeader-module__04TKmW__iconButton",
  "iconGroup": "MainHeader-module__04TKmW__iconGroup",
  "linkButton": "MainHeader-module__04TKmW__linkButton",
  "loginButton": "MainHeader-module__04TKmW__loginButton",
  "logo": "MainHeader-module__04TKmW__logo",
  "logoutItem": "MainHeader-module__04TKmW__logoutItem",
  "navContainer": "MainHeader-module__04TKmW__navContainer",
  "nav_icons": "MainHeader-module__04TKmW__nav_icons",
  "nav_links": "MainHeader-module__04TKmW__nav_links",
  "noNotifications": "MainHeader-module__04TKmW__noNotifications",
  "notificationFooter": "MainHeader-module__04TKmW__notificationFooter",
  "notificationHeader": "MainHeader-module__04TKmW__notificationHeader",
  "notificationIcon": "MainHeader-module__04TKmW__notificationIcon",
  "notificationIconContainer": "MainHeader-module__04TKmW__notificationIconContainer",
  "notificationItem": "MainHeader-module__04TKmW__notificationItem",
  "notificationList": "MainHeader-module__04TKmW__notificationList",
  "notificationMessage": "MainHeader-module__04TKmW__notificationMessage",
  "notificationText": "MainHeader-module__04TKmW__notificationText",
  "notificationTimestamp": "MainHeader-module__04TKmW__notificationTimestamp",
  "notificationTooltip": "MainHeader-module__04TKmW__notificationTooltip",
  "profileButtonContainer": "MainHeader-module__04TKmW__profileButtonContainer",
  "profileTooltip": "MainHeader-module__04TKmW__profileTooltip",
  "read": "MainHeader-module__04TKmW__read",
  "tooltipItem": "MainHeader-module__04TKmW__tooltipItem",
  "viewAllButton": "MainHeader-module__04TKmW__viewAllButton",
  "wrap": "MainHeader-module__04TKmW__wrap",
});
}),
"[project]/components/MainHeader.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Header
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/components/MainHeader.module.css [app-client] (css module)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$productSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/productSlice.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$authSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/authSlice.ts [app-client] (ecmascript)"); // openLoginModal 액션 import, logout 액션 import
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"); // useState, useRef, useEffect 임포트
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/js-cookie/dist/js.cookie.mjs [app-client] (ecmascript)"); // Cookies 임포트
;
var _s = __turbopack_context__.k.signature();
;
;
;
;
;
;
;
;
;
;
;
function Header() {
    _s();
    const dispatch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppDispatch"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const isLoggedIn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppSelector"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$authSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["selectIsLoggedIn"]); // Redux 스토어에서 로그인 상태 가져오기
    const [isNotificationModalOpen, setIsNotificationModalOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false); // 알림 모달 상태 (이제 사용하지 않음)
    const [isProfileTooltipOpen, setIsProfileTooltipOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false); // 프로필 툴팁 상태
    const [isNotificationTooltipOpen, setIsNotificationTooltipOpen] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false); // 알림 툴팁 상태
    // 툴팁 외부 클릭 감지를 위한 ref
    const profileTooltipRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const notificationTooltipRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "Header.useEffect": ()=>{
            const handleClickOutside = {
                "Header.useEffect.handleClickOutside": (event)=>{
                    if (profileTooltipRef.current && !profileTooltipRef.current.contains(event.target) && notificationTooltipRef.current && !notificationTooltipRef.current.contains(event.target)) {
                        setIsProfileTooltipOpen(false);
                        setIsNotificationTooltipOpen(false);
                    }
                    // 단일 툴팁만 닫는 로직: 한 툴팁이 열려있고, 그 툴팁 밖을 클릭했는데 다른 툴팁은 클릭하지 않았을 경우
                    if (isProfileTooltipOpen && profileTooltipRef.current && !profileTooltipRef.current.contains(event.target)) {
                        setIsProfileTooltipOpen(false);
                    }
                    if (isNotificationTooltipOpen && notificationTooltipRef.current && !notificationTooltipRef.current.contains(event.target)) {
                        setIsNotificationTooltipOpen(false);
                    }
                }
            }["Header.useEffect.handleClickOutside"];
            document.addEventListener('mousedown', handleClickOutside);
            return ({
                "Header.useEffect": ()=>{
                    document.removeEventListener('mousedown', handleClickOutside);
                }
            })["Header.useEffect"];
        }
    }["Header.useEffect"], [
        isProfileTooltipOpen,
        isNotificationTooltipOpen
    ]);
    // 알림 툴팁에서 사용할 임시 알림 데이터 (NotificationModal에서 가져옴)
    const dummyNotifications = [
        {
            id: 1,
            type: 'order',
            message: '주문하신 상품이 배송을 시작했습니다.',
            isRead: false,
            timestamp: '2025-10-20T10:00:00Z',
            imageUrl: '/images/delivery.png'
        },
        {
            id: 2,
            type: 'event',
            message: '새로운 이벤트가 시작되었습니다! 지금 확인하세요.',
            isRead: true,
            timestamp: '2025-10-19T14:30:00Z',
            imageUrl: '/images/event.png'
        },
        {
            id: 3,
            type: 'new_item',
            message: '새로운 상품이 등록되었습니다: 고구마 스틱.',
            isRead: false,
            timestamp: '2025-10-18T09:15:00Z',
            imageUrl: '/images/new_item.png'
        },
        {
            id: 4,
            type: 'order',
            message: '주문하신 상품이 성공적으로 배송 완료되었습니다.',
            isRead: true,
            timestamp: '2025-10-17T18:00:00Z',
            imageUrl: '/images/delivery.png'
        },
        {
            id: 5,
            type: 'event',
            message: '할인쿠폰이 발급되었습니다! 마이페이지에서 확인하세요.',
            isRead: false,
            timestamp: '2025-10-16T11:00:00Z',
            imageUrl: '/images/coupon.png'
        }
    ];
    const handleNavigation = (path)=>{
        dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$productSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resetState"])()); // 상태 초기화
        router.push(path); // 페이지 이동
    };
    const handleLoginClick = ()=>{
        dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$authSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["openLoginModal"])()); // 로그인 모달 열기
    };
    const handleJoinPageClick = ()=>{
        router.push('/login/join'); // 회원가입 페이지 경로
    };
    const handleProfileIconClick = ()=>{
        setIsProfileTooltipOpen((prev)=>!prev);
        setIsNotificationTooltipOpen(false); // 다른 툴팁 닫기
    };
    const handleNotificationIconClick = ()=>{
        setIsNotificationTooltipOpen((prev)=>!prev);
        setIsProfileTooltipOpen(false); // 다른 툴팁 닫기
    };
    const handleProfileClick = ()=>{
        setIsProfileTooltipOpen(false); // 내 정보 확인 클릭 시 툴팁 닫기
        router.push('/mypage/profile'); // 프로필 페이지 경로
    };
    const handleNotificationClick = ()=>{
        setIsNotificationTooltipOpen(false); // 전체 알림 보기 클릭 시 툴팁 닫기
        router.push('/notifications'); // 전체 알림 페이지로 이동
    };
    const handleFavoritesClick = ()=>{
        router.push('/favorites'); // 좋아요 상품 페이지 경로
    };
    const handleLogoutClick = async ()=>{
        try {
            const xsrfToken = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('XSRF-TOKEN');
            const response = await fetch("".concat(("TURBOPACK compile-time value", "http://localhost:8080"), "/logout"), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...xsrfToken && {
                        'X-XSRF-TOKEN': xsrfToken
                    }
                },
                credentials: 'include'
            });
            if (response.ok) {
                console.log('로그아웃 성공');
            } else {
                const errorData = await response.json();
                console.error('로그아웃 실패:', errorData.message || '알 수 없는 오류');
            }
        } catch (error) {
            console.error('로그아웃 중 오류 발생:', error);
        } finally{
            dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$authSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["logout"])());
            router.push('/');
            setIsProfileTooltipOpen(false); // 툴팁 닫기
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("nav", {
            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].wrap,
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].navContainer,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].logo,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: "/",
                            onClick: ()=>dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$productSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["resetState"])()),
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                src: "/images/logo.png",
                                alt: "제로모아",
                                width: 190,
                                height: 100,
                                priority: true
                            }, void 0, false, {
                                fileName: "[project]/components/MainHeader.tsx",
                                lineNumber: 163,
                                columnNumber: 29
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/MainHeader.tsx",
                            lineNumber: 162,
                            columnNumber: 25
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/MainHeader.tsx",
                        lineNumber: 161,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].nav_links,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>handleNavigation('/categories/drinks'),
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].linkButton,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            src: "/images/drinks.png",
                                            alt: "음료",
                                            width: 24,
                                            height: 24
                                        }, void 0, false, {
                                            fileName: "[project]/components/MainHeader.tsx",
                                            lineNumber: 169,
                                            columnNumber: 33
                                        }, this),
                                        "음료"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/MainHeader.tsx",
                                    lineNumber: 168,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/MainHeader.tsx",
                                lineNumber: 167,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>handleNavigation('/categories/snacks'),
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].linkButton,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            src: "/images/snack.png",
                                            alt: "과자",
                                            width: 24,
                                            height: 24
                                        }, void 0, false, {
                                            fileName: "[project]/components/MainHeader.tsx",
                                            lineNumber: 174,
                                            columnNumber: 33
                                        }, this),
                                        "과자"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/MainHeader.tsx",
                                    lineNumber: 173,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/MainHeader.tsx",
                                lineNumber: 172,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: ()=>handleNavigation('/categories/icecream'),
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].linkButton,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                            src: "/images/icecream.png",
                                            alt: "아이스크림",
                                            width: 24,
                                            height: 24
                                        }, void 0, false, {
                                            fileName: "[project]/components/MainHeader.tsx",
                                            lineNumber: 179,
                                            columnNumber: 33
                                        }, this),
                                        "아이스크림"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/MainHeader.tsx",
                                    lineNumber: 178,
                                    columnNumber: 29
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/components/MainHeader.tsx",
                                lineNumber: 177,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/components/MainHeader.tsx",
                        lineNumber: 166,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].authSection,
                        children: isLoggedIn ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].iconGroup,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].profileButtonContainer,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: handleProfileIconClick,
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].iconButton,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                src: "/images/profile.png",
                                                alt: "프로필",
                                                width: 50,
                                                height: 50,
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].headerIcon
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainHeader.tsx",
                                                lineNumber: 193,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/MainHeader.tsx",
                                            lineNumber: 192,
                                            columnNumber: 37
                                        }, this),
                                        isProfileTooltipOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            ref: profileTooltipRef,
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].profileTooltip,
                                            children: [
                                                " ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: handleProfileClick,
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tooltipItem,
                                                    children: "내 정보 확인"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/MainHeader.tsx",
                                                    lineNumber: 197,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    onClick: handleLogoutClick,
                                                    className: "".concat(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tooltipItem, " ").concat(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].logoutItem),
                                                    children: "로그아웃"
                                                }, void 0, false, {
                                                    fileName: "[project]/components/MainHeader.tsx",
                                                    lineNumber: 198,
                                                    columnNumber: 45
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/MainHeader.tsx",
                                            lineNumber: 196,
                                            columnNumber: 41
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/MainHeader.tsx",
                                    lineNumber: 191,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].notificationIconContainer,
                                    onClick: handleNotificationIconClick,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].iconButton,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                src: "/images/bell.png",
                                                alt: "알림",
                                                width: 30,
                                                height: 30,
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].headerIcon
                                            }, void 0, false, {
                                                fileName: "[project]/components/MainHeader.tsx",
                                                lineNumber: 208,
                                                columnNumber: 41
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/MainHeader.tsx",
                                            lineNumber: 207,
                                            columnNumber: 37
                                        }, this),
                                        isNotificationTooltipOpen && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            ref: notificationTooltipRef,
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].notificationTooltip,
                                            children: [
                                                " ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].notificationHeader,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                            children: "알림"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/MainHeader.tsx",
                                                            lineNumber: 213,
                                                            columnNumber: 49
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            onClick: (e)=>{
                                                                e.stopPropagation();
                                                                setIsNotificationTooltipOpen(false);
                                                            },
                                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].closeButton,
                                                            children: "×"
                                                        }, void 0, false, {
                                                            fileName: "[project]/components/MainHeader.tsx",
                                                            lineNumber: 214,
                                                            columnNumber: 49
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/components/MainHeader.tsx",
                                                    lineNumber: 212,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].notificationList,
                                                    children: dummyNotifications.length > 0 ? dummyNotifications.map((notification)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "".concat(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].notificationItem, " ").concat(notification.isRead ? __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].read : ''),
                                                            children: [
                                                                notification.imageUrl && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                    src: notification.imageUrl,
                                                                    alt: "알림 아이콘",
                                                                    width: 30,
                                                                    height: 30,
                                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].notificationIcon
                                                                }, void 0, false, {
                                                                    fileName: "[project]/components/MainHeader.tsx",
                                                                    lineNumber: 221,
                                                                    columnNumber: 65
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].notificationText,
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].notificationMessage,
                                                                            children: notification.message
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/MainHeader.tsx",
                                                                            lineNumber: 224,
                                                                            columnNumber: 65
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].notificationTimestamp,
                                                                            children: new Date(notification.timestamp).toLocaleString()
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/components/MainHeader.tsx",
                                                                            lineNumber: 225,
                                                                            columnNumber: 65
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/components/MainHeader.tsx",
                                                                    lineNumber: 223,
                                                                    columnNumber: 61
                                                                }, this)
                                                            ]
                                                        }, notification.id, true, {
                                                            fileName: "[project]/components/MainHeader.tsx",
                                                            lineNumber: 219,
                                                            columnNumber: 57
                                                        }, this)) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].noNotifications,
                                                        children: "새로운 알림이 없습니다."
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainHeader.tsx",
                                                        lineNumber: 230,
                                                        columnNumber: 53
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/MainHeader.tsx",
                                                    lineNumber: 216,
                                                    columnNumber: 45
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].notificationFooter,
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        onClick: handleNotificationClick,
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].viewAllButton,
                                                        children: "전체 알림 보기"
                                                    }, void 0, false, {
                                                        fileName: "[project]/components/MainHeader.tsx",
                                                        lineNumber: 234,
                                                        columnNumber: 49
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/components/MainHeader.tsx",
                                                    lineNumber: 233,
                                                    columnNumber: 45
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/components/MainHeader.tsx",
                                            lineNumber: 211,
                                            columnNumber: 41
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/MainHeader.tsx",
                                    lineNumber: 203,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleFavoritesClick,
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].iconButton,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                        src: "/images/favorite.png",
                                        alt: "좋아요",
                                        width: 30,
                                        height: 30,
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].headerIcon
                                    }, void 0, false, {
                                        fileName: "[project]/components/MainHeader.tsx",
                                        lineNumber: 243,
                                        columnNumber: 37
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/components/MainHeader.tsx",
                                    lineNumber: 242,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/MainHeader.tsx",
                            lineNumber: 190,
                            columnNumber: 29
                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].authLinks,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleLoginClick,
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].authLinkButton,
                                    children: "로그인"
                                }, void 0, false, {
                                    fileName: "[project]/components/MainHeader.tsx",
                                    lineNumber: 248,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].authSeparator,
                                    children: "|"
                                }, void 0, false, {
                                    fileName: "[project]/components/MainHeader.tsx",
                                    lineNumber: 249,
                                    columnNumber: 33
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: handleJoinPageClick,
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].authLinkButton,
                                    children: "회원가입"
                                }, void 0, false, {
                                    fileName: "[project]/components/MainHeader.tsx",
                                    lineNumber: 250,
                                    columnNumber: 33
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/MainHeader.tsx",
                            lineNumber: 247,
                            columnNumber: 29
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/components/MainHeader.tsx",
                        lineNumber: 188,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/MainHeader.tsx",
                lineNumber: 160,
                columnNumber: 17
            }, this)
        }, void 0, false, {
            fileName: "[project]/components/MainHeader.tsx",
            lineNumber: 159,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/MainHeader.tsx",
        lineNumber: 158,
        columnNumber: 9
    }, this);
}
_s(Header, "JEKfyIf+2SaNfwEfjY1d95es5w0=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppDispatch"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppSelector"]
    ];
});
_c = Header;
var _c;
__turbopack_context__.k.register(_c, "Header");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/LoginModal.module.css [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "autoLogin": "LoginModal-module__bikqZa__autoLogin",
  "button": "LoginModal-module__bikqZa__button",
  "buttonGroup": "LoginModal-module__bikqZa__buttonGroup",
  "closeButton": "LoginModal-module__bikqZa__closeButton",
  "findLinks": "LoginModal-module__bikqZa__findLinks",
  "heroTitle": "LoginModal-module__bikqZa__heroTitle",
  "inputField": "LoginModal-module__bikqZa__inputField",
  "inputFieldContainer": "LoginModal-module__bikqZa__inputFieldContainer",
  "inputGroup": "LoginModal-module__bikqZa__inputGroup",
  "loginButton": "LoginModal-module__bikqZa__loginButton",
  "logo": "LoginModal-module__bikqZa__logo",
  "logoContainer": "LoginModal-module__bikqZa__logoContainer",
  "modalContent": "LoginModal-module__bikqZa__modalContent",
  "modalOverlay": "LoginModal-module__bikqZa__modalOverlay",
  "optionsContainer": "LoginModal-module__bikqZa__optionsContainer",
  "passwordToggle": "LoginModal-module__bikqZa__passwordToggle",
  "separator": "LoginModal-module__bikqZa__separator",
  "signupButton": "LoginModal-module__bikqZa__signupButton",
  "socialIcon": "LoginModal-module__bikqZa__socialIcon",
  "socialIconContainer": "LoginModal-module__bikqZa__socialIconContainer",
  "socialIcons": "LoginModal-module__bikqZa__socialIcons",
  "socialLoginTitle": "LoginModal-module__bikqZa__socialLoginTitle",
});
}),
"[project]/components/LoginModal.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>LoginModal
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/store.ts [app-client] (ecmascript)"); // Redux dispatch 사용을 위해 import
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$authSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/authSlice.ts [app-client] (ecmascript)"); // 로그인 상태 업데이트 액션 import
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/components/LoginModal.module.css [app-client] (css module)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
;
;
function LoginModal(param) {
    let { isOpen, onClose } = param;
    _s();
    const [username, setUsername] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [password, setPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [autoLogin, setAutoLogin] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loginError, setLoginError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null); // 로그인 에러 메시지 상태 추가
    // 비밀번호 가시성 상태 추가
    const [showPassword, setShowPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const dispatch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppDispatch"])(); // dispatch 초기화
    if (!isOpen) return null;
    const handleLogin = async (e)=>{
        e.preventDefault();
        setLoginError(null); // 로그인 시도 시 에러 메시지 초기화
        console.log('로그인 시도:', {
            username,
            password,
            autoLogin
        });
        try {
            const response = await fetch("".concat(("TURBOPACK compile-time value", "http://localhost:8080"), "/login"), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password,
                    autoLogin
                }),
                credentials: 'include'
            });
            if (!response.ok) {
                let errorData = {
                    message: response.statusText || '로그인 실패: 서버 응답 오류'
                }; // 기본 오류 메시지를 statusText로 설정
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    try {
                        errorData = await response.json();
                    } catch (jsonError) {
                        console.error('응답 JSON 파싱 실패:', jsonError);
                    // JSON 파싱 실패 시, 이미 statusText로 기본 메시지가 설정되어 있음
                    }
                }
                setLoginError(errorData.message || '로그인 실패: 알 수 없는 오류'); // errorData.message가 비어있을 경우를 대비
                console.error('로그인 실패:', errorData);
                return;
            }
            const userData = await response.json();
            console.log('로그인 성공:', userData);
            // Redux 상태 업데이트
            dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$authSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setLoggedIn"])(true));
            dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$authSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setUser"])({
                id: userData.id,
                username: userData.username
            }));
            onClose(); // 모달 닫기
            router.push('/'); // 메인 페이지로 이동 또는 로그인 후 리다이렉트 처리
        } catch (error) {
            console.error('로그인 요청 중 오류 발생:', error);
            setLoginError('네트워크 오류 또는 서버 응답 없음');
        }
    };
    const handleSocialLogin = (provider)=>{
        console.log("".concat(provider, " 소셜 로그인 시도"));
    // 여기에 각 소셜 로그인 제공업체별 로직 구현
    };
    const handleSignup = ()=>{
        onClose(); // 모달 닫기
        router.push('/login/join'); // 회원가입 페이지로 이동
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalOverlay,
        onClick: onClose,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].modalContent,
            onClick: (e)=>e.stopPropagation(),
            children: [
                " ",
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].closeButton,
                    onClick: onClose,
                    children: "×"
                }, void 0, false, {
                    fileName: "[project]/components/LoginModal.tsx",
                    lineNumber: 91,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].logoContainer,
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        src: "/images/logo.png",
                        alt: "YANGPA 로고",
                        width: 486,
                        height: 171,
                        priority: true,
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].logo
                    }, void 0, false, {
                        fileName: "[project]/components/LoginModal.tsx",
                        lineNumber: 94,
                        columnNumber: 21
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/components/LoginModal.tsx",
                    lineNumber: 93,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleLogin,
                    style: {
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                    },
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputGroup,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    htmlFor: "username",
                                    children: "아이디"
                                }, void 0, false, {
                                    fileName: "[project]/components/LoginModal.tsx",
                                    lineNumber: 106,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    id: "username",
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputField,
                                    value: username,
                                    onChange: (e)=>setUsername(e.target.value),
                                    required: true
                                }, void 0, false, {
                                    fileName: "[project]/components/LoginModal.tsx",
                                    lineNumber: 107,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/LoginModal.tsx",
                            lineNumber: 105,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputGroup,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    htmlFor: "password",
                                    children: "비밀번호"
                                }, void 0, false, {
                                    fileName: "[project]/components/LoginModal.tsx",
                                    lineNumber: 117,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputFieldContainer,
                                    children: [
                                        " ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: showPassword ? 'text' : 'password',
                                            id: "password",
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputField,
                                            value: password,
                                            onChange: (e)=>setPassword(e.target.value),
                                            required: true
                                        }, void 0, false, {
                                            fileName: "[project]/components/LoginModal.tsx",
                                            lineNumber: 119,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].passwordToggle,
                                            onClick: ()=>setShowPassword((prev)=>!prev),
                                            "aria-label": showPassword ? '비밀번호 숨기기' : '비밀번호 보이기',
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                src: showPassword ? '/images/open_eye.png' : '/images/closed_eye.png',
                                                alt: showPassword ? '비밀번호 숨기기' : '비밀번호 보이기',
                                                width: 20,
                                                height: 20
                                            }, void 0, false, {
                                                fileName: "[project]/components/LoginModal.tsx",
                                                lineNumber: 133,
                                                columnNumber: 33
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/components/LoginModal.tsx",
                                            lineNumber: 127,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/LoginModal.tsx",
                                    lineNumber: 118,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/LoginModal.tsx",
                            lineNumber: 116,
                            columnNumber: 21
                        }, this),
                        loginError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].errorMessage,
                            children: loginError
                        }, void 0, false, {
                            fileName: "[project]/components/LoginModal.tsx",
                            lineNumber: 142,
                            columnNumber: 36
                        }, this),
                        " ",
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].optionsContainer,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].autoLogin,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "checkbox",
                                            checked: autoLogin,
                                            onChange: (e)=>setAutoLogin(e.target.checked)
                                        }, void 0, false, {
                                            fileName: "[project]/components/LoginModal.tsx",
                                            lineNumber: 146,
                                            columnNumber: 29
                                        }, this),
                                        "자동 로그인"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/components/LoginModal.tsx",
                                    lineNumber: 145,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/login/find/id",
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].findLinks,
                                    onClick: onClose,
                                    children: "아이디찾기"
                                }, void 0, false, {
                                    fileName: "[project]/components/LoginModal.tsx",
                                    lineNumber: 153,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].separator,
                                    children: "|"
                                }, void 0, false, {
                                    fileName: "[project]/components/LoginModal.tsx",
                                    lineNumber: 153,
                                    columnNumber: 112
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/login/find/pw",
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].findLinks,
                                    onClick: onClose,
                                    children: "비밀번호 찾기"
                                }, void 0, false, {
                                    fileName: "[project]/components/LoginModal.tsx",
                                    lineNumber: 153,
                                    columnNumber: 155
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/LoginModal.tsx",
                            lineNumber: 144,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].buttonGroup,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    className: "".concat(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].button, " ").concat(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].signupButton),
                                    onClick: handleSignup,
                                    children: "회원가입"
                                }, void 0, false, {
                                    fileName: "[project]/components/LoginModal.tsx",
                                    lineNumber: 157,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    className: "".concat(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].button, " ").concat(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].loginButton),
                                    children: "로그인"
                                }, void 0, false, {
                                    fileName: "[project]/components/LoginModal.tsx",
                                    lineNumber: 160,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/components/LoginModal.tsx",
                            lineNumber: 156,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/LoginModal.tsx",
                    lineNumber: 104,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].socialLoginTitle,
                    children: "간편 로그인"
                }, void 0, false, {
                    fileName: "[project]/components/LoginModal.tsx",
                    lineNumber: 166,
                    columnNumber: 17
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].socialIcons,
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].socialIconContainer,
                            onClick: ()=>handleSocialLogin('Google'),
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                src: "/images/google.png",
                                alt: "Google",
                                width: 20,
                                height: 20,
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].socialIcon
                            }, void 0, false, {
                                fileName: "[project]/components/LoginModal.tsx",
                                lineNumber: 169,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/LoginModal.tsx",
                            lineNumber: 168,
                            columnNumber: 21
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].socialIconContainer,
                            onClick: ()=>handleSocialLogin('Naver'),
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                src: "/images/naver.png",
                                alt: "Naver",
                                width: 20,
                                height: 20,
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].socialIcon
                            }, void 0, false, {
                                fileName: "[project]/components/LoginModal.tsx",
                                lineNumber: 172,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/components/LoginModal.tsx",
                            lineNumber: 171,
                            columnNumber: 21
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/components/LoginModal.tsx",
                    lineNumber: 167,
                    columnNumber: 17
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/components/LoginModal.tsx",
            lineNumber: 90,
            columnNumber: 13
        }, this)
    }, void 0, false, {
        fileName: "[project]/components/LoginModal.tsx",
        lineNumber: 89,
        columnNumber: 9
    }, this);
}
_s(LoginModal, "u0MT9zTPz3ZcU18mP9YZTrv46ZE=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppDispatch"]
    ];
});
_c = LoginModal;
var _c;
__turbopack_context__.k.register(_c, "LoginModal");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/ClientRootLayout.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ClientRootLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/MainHeader.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/LoginModal.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$authSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/authSlice.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
;
function ClientRootLayout(param) {
    let { children } = param;
    _s();
    const dispatch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppDispatch"])();
    const isLoginModalOpen = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppSelector"])({
        "ClientRootLayout.useAppSelector[isLoginModalOpen]": (state)=>state.auth.isLoginModalOpen
    }["ClientRootLayout.useAppSelector[isLoginModalOpen]"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ClientRootLayout.useEffect": ()=>{
            if ("TURBOPACK compile-time truthy", 1) {
                const storedIsLoggedIn = localStorage.getItem('isLoggedIn');
                const storedUser = localStorage.getItem('user');
                if (storedIsLoggedIn === 'true') {
                    dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$authSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setLoggedIn"])(true));
                }
                if (storedUser) {
                    try {
                        dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$authSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setUser"])(JSON.parse(storedUser)));
                    } catch (e) {
                        console.error("Failed to parse user from localStorage", e);
                        dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$authSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setUser"])(null));
                        localStorage.removeItem('user');
                    }
                }
            }
        }
    }["ClientRootLayout.useEffect"], [
        dispatch
    ]);
    const handleCloseLoginModal = ()=>{
        dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$authSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["closeLoginModal"])());
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$MainHeader$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {}, void 0, false, {
                fileName: "[project]/app/ClientRootLayout.tsx",
                lineNumber: 40,
                columnNumber: 13
            }, this),
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$LoginModal$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                isOpen: isLoginModalOpen,
                onClose: handleCloseLoginModal
            }, void 0, false, {
                fileName: "[project]/app/ClientRootLayout.tsx",
                lineNumber: 42,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true);
}
_s(ClientRootLayout, "UvGL88Y20zk5POOSubDxgTSMkGY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppDispatch"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppSelector"]
    ];
});
_c = ClientRootLayout;
var _c;
__turbopack_context__.k.register(_c, "ClientRootLayout");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/app/layout.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>RootLayout
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/provider.tsx [app-client] (ecmascript)");
// import { useAppSelector, useAppDispatch } from './store/store'; // Redux 훅 import
// import { closeLoginModal } from './store/authSlice'; // closeLoginModal 액션 import
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$ClientRootLayout$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/ClientRootLayout.tsx [app-client] (ecmascript)"); // 수정된 경로
"use client";
;
;
;
;
function RootLayout(param) {
    let { children } = param;
    // const dispatch = useAppDispatch(); // RootLayout에서는 Redux 훅 사용 불가
    // const isLoginModalOpen = useAppSelector((state) => state.auth.isLoginModalOpen);
    // const handleCloseLoginModal = () => {
    //   dispatch(closeLoginModal());
    // };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("html", {
        lang: "ko",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("body", {
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$provider$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Providers"], {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$ClientRootLayout$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                    children: children
                }, void 0, false, {
                    fileName: "[project]/app/layout.tsx",
                    lineNumber: 26,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/layout.tsx",
                lineNumber: 25,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/layout.tsx",
            lineNumber: 24,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/layout.tsx",
        lineNumber: 23,
        columnNumber: 5
    }, this);
}
_c = RootLayout;
var _c;
__turbopack_context__.k.register(_c, "RootLayout");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_65b8e34b._.js.map