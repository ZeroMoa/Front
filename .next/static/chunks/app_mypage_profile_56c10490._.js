(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/mypage/profile/page.module.css [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "bottomButton": "page-module__CdI7za__bottomButton",
  "boxEmail": "page-module__CdI7za__boxEmail",
  "boxInput": "page-module__CdI7za__boxInput",
  "boxLayer": "page-module__CdI7za__boxLayer",
  "boxSelect": "page-module__CdI7za__boxSelect",
  "buttonGroup": "page-module__CdI7za__buttonGroup",
  "buttonMail": "page-module__CdI7za__buttonMail",
  "domainDisplayField": "page-module__CdI7za__domainDisplayField",
  "domainInputField": "page-module__CdI7za__domainInputField",
  "emailDirectInput": "page-module__CdI7za__emailDirectInput",
  "emailDomainButton": "page-module__CdI7za__emailDomainButton",
  "emailDomainOptionItem": "page-module__CdI7za__emailDomainOptionItem",
  "emailDomainSelectWrapper": "page-module__CdI7za__emailDomainSelectWrapper",
  "emailIdInput": "page-module__CdI7za__emailIdInput",
  "emailInput": "page-module__CdI7za__emailInput",
  "emailInputContainer": "page-module__CdI7za__emailInputContainer",
  "emailSeparator": "page-module__CdI7za__emailSeparator",
  "error": "page-module__CdI7za__error",
  "errorBorder": "page-module__CdI7za__errorBorder",
  "errorMessage": "page-module__CdI7za__errorMessage",
  "formSection": "page-module__CdI7za__formSection",
  "hasValue": "page-module__CdI7za__hasValue",
  "headerSection": "page-module__CdI7za__headerSection",
  "input": "page-module__CdI7za__input",
  "inputField": "page-module__CdI7za__inputField",
  "inputFieldContainer": "page-module__CdI7za__inputFieldContainer",
  "inputGroup": "page-module__CdI7za__inputGroup",
  "inputInfo": "page-module__CdI7za__inputInfo",
  "joinError": "page-module__CdI7za__joinError",
  "label": "page-module__CdI7za__label",
  "listAdress": "page-module__CdI7za__listAdress",
  "listItem": "page-module__CdI7za__listItem",
  "loading": "page-module__CdI7za__loading",
  "noData": "page-module__CdI7za__noData",
  "on": "page-module__CdI7za__on",
  "pageTitle": "page-module__CdI7za__pageTitle",
  "pageWrapper": "page-module__CdI7za__pageWrapper",
  "passwordToggle": "page-module__CdI7za__passwordToggle",
  "profileCard": "page-module__CdI7za__profileCard",
  "readOnlyInput": "page-module__CdI7za__readOnlyInput",
  "saveButton": "page-module__CdI7za__saveButton",
  "selectArrow": "page-module__CdI7za__selectArrow",
  "selectArrowContainer": "page-module__CdI7za__selectArrowContainer",
  "successMessage": "page-module__CdI7za__successMessage",
  "textAt": "page-module__CdI7za__textAt",
  "textCont": "page-module__CdI7za__textCont",
  "withdrawButton": "page-module__CdI7za__withdrawButton",
});
}),
"[project]/app/mypage/profile/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>ProfilePage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/store.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$authSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/authSlice.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/app/mypage/profile/page.module.css [app-client] (css module)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/js-cookie/dist/js.cookie.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-client] (ecmascript)"); // Image 컴포넌트 사용을 위해 import
;
var _s = __turbopack_context__.k.signature(), _s1 = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
function useDebounce(value, delay) {
    _s();
    const [debouncedValue, setDebouncedValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(value);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useDebounce.useEffect": ()=>{
            const handler = setTimeout({
                "useDebounce.useEffect.handler": ()=>{
                    setDebouncedValue(value);
                }
            }["useDebounce.useEffect.handler"], delay);
            return ({
                "useDebounce.useEffect": ()=>{
                    clearTimeout(handler);
                }
            })["useDebounce.useEffect"];
        }
    }["useDebounce.useEffect"], [
        value,
        delay
    ]);
    return debouncedValue;
}
_s(useDebounce, "KDuPAtDOgxm8PU6legVJOb3oOmA=");
function ProfilePage() {
    _s1();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const isLoggedIn = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppSelector"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$authSlice$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["selectIsLoggedIn"]);
    const [userData, setUserData] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [currentPassword, setCurrentPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [newPassword, setNewPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [newPasswordConfirm, setNewPasswordConfirm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [nickname, setNickname] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [emailFront, setEmailFront] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(''); // 이메일 앞 부분
    const [emailBack, setEmailBack] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(''); // 이메일 뒷 부분 (도메인)
    const [isSocialUser, setIsSocialUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [error, setError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // 이메일 중복/형식 에러 메시지 및 성공 메시지 상태 추가
    const [emailError, setEmailError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [emailSuccess, setEmailSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    // 이메일 도메인 선택 박스 표시 여부 및 직접 입력 여부 상태 추가
    const [showEmailDomainSelect, setShowEmailDomainSelect] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false); // 이메일 도메인 선택 박스 표시 여부
    const [isDirectInput, setIsDirectInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false); // 이메일 도메인 직접 입력 여부
    // 비밀번호 가시성 상태 추가
    const [showCurrentPassword, setShowCurrentPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showNewPassword, setShowNewPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [showNewPasswordConfirm, setShowNewPasswordConfirm] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    // 폼 제출 관련 에러 메시지 상태 추가
    const [passwordMismatchError, setPasswordMismatchError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [currentPasswordError, setCurrentPasswordError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [currentPasswordMismatchError, setCurrentPasswordMismatchError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null); // 현재 비밀번호 불일치 에러 메시지 추가
    const [generalUpdateError, setGeneralUpdateError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const availableDomains = [
        'naver.com',
        'gmail.com',
        'hanmail.net',
        'nate.com',
        'hotmail.com',
        'daum.net',
        'outlook.com',
        'kakao.com',
        '직접입력'
    ];
    // 디바운스된 이메일 값
    const debouncedEmailFront = useDebounce(emailFront, 500); // 500ms debounce
    const debouncedEmailBack = useDebounce(emailBack, 500); // 500ms debounce
    const debouncedFullEmail = "".concat(debouncedEmailFront, "@").concat(debouncedEmailBack);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProfilePage.useEffect": ()=>{
            // userData가 이미 로드된 경우 fetchUserData를 다시 호출하지 않음
            if (userData) {
                setLoading(false); // 이미 데이터가 있으면 로딩 완료 처리
                return;
            }
            const fetchUserData = {
                "ProfilePage.useEffect.fetchUserData": async ()=>{
                    setLoading(true); // 데이터 fetch 시작 시 로딩 상태 설정
                    try {
                        const xsrfToken = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('XSRF-TOKEN');
                        const response = await fetch("".concat(("TURBOPACK compile-time value", "http://localhost:8080"), "/user"), {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                                ...xsrfToken && {
                                    'X-XSRF-TOKEN': xsrfToken
                                }
                            },
                            credentials: 'include'
                        });
                        if (!response.ok) {
                            if (response.status === 401) {
                                // Redux 상태가 isLoggedIn=false로 업데이트되고,
                                // useEffect의 시작 부분에서 처리될 것이므로 여기서 추가 로직은 불필요
                                // 그러나 안전을 위해 여기서도 라우팅 및 alert를 포함할 수 있으나, 중복 방지를 위해 생략
                                // dispatch(logout()); // Redux 상태에서 로그아웃 처리
                                // alert('세션이 만료되었거나 로그인이 필요합니다.');
                                // router.push('/');
                                return;
                            }
                            const errorData = await response.json();
                            throw new Error(errorData.message || '사용자 정보를 불러오는데 실패했습니다.');
                        }
                        const data = await response.json();
                        setUserData(data);
                        setNickname(data.nickname);
                        setIsSocialUser(data.social);
                        if (data.email) {
                            const [id, domain] = data.email.split('@');
                            setEmailFront(id);
                            setEmailBack(domain);
                            // 기존 이메일 도메인이 availableDomains에 없으면 직접입력 상태로 설정
                            if (!availableDomains.includes(domain)) {
                                setIsDirectInput(true);
                            }
                        }
                    } catch (err) {
                        setError(err.message);
                        console.error("오류: ".concat(err.message)); // 개발자 도구에만 출력
                    // alert(`오류: ${err.message}`); // 중복 알림 방지를 위해 제거
                    } finally{
                        setLoading(false);
                    }
                }
            }["ProfilePage.useEffect.fetchUserData"];
            fetchUserData();
        }
    }["ProfilePage.useEffect"], [
        isLoggedIn,
        router,
        userData
    ]); // userData를 의존성 배열에 추가
    // 현재 비밀번호 확인 함수
    const checkCurrentPassword = async (password)=>{
        if (!password) {
            setCurrentPasswordMismatchError(null); // 비밀번호가 비어있으면 에러 메시지 초기화
            console.log('Password is empty, setting currentPasswordMismatchError to null.');
            return false; // API 호출 없이 바로 false 반환
        }
        try {
            const xsrfToken = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('XSRF-TOKEN');
            const response = await fetch("".concat(("TURBOPACK compile-time value", "http://localhost:8080"), "/user/check-password"), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...xsrfToken && {
                        'X-XSRF-TOKEN': xsrfToken
                    }
                },
                credentials: 'include',
                body: JSON.stringify({
                    password
                })
            });
            if (response.status === 401) {
                setCurrentPasswordMismatchError('로그인이 필요합니다.');
                return false;
            }
            if (!response.ok) {
                const errorData = await response.json();
                setCurrentPasswordMismatchError(errorData.message || '현재 비밀번호 확인에 실패했습니다.');
                return false;
            }
            // API 명세에 따라 응답 본문이 직접 boolean 값(true/false)을 반환하므로, 이를 직접 할당
            const isMatch = await response.json();
            if (!isMatch) {
                setCurrentPasswordMismatchError('현재 비밀번호가 일치하지 않습니다.');
                return false;
            }
            // isMatch가 true인 경우 (비밀번호 일치), 오류 메시지 초기화
            setCurrentPasswordMismatchError(null);
            return true;
        } catch (error) {
            console.error('현재 비밀번호 확인 중 오류 발생:', error);
            setCurrentPasswordMismatchError("오류 발생: ".concat(error.message));
            return false;
        }
    };
    // 디바운스된 이메일 값이 변경될 때마다 중복 확인
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ProfilePage.useEffect": ()=>{
            if (!isSocialUser && debouncedEmailFront && debouncedEmailBack && debouncedFullEmail !== '@') {
                // 현재 이메일과 변경된 이메일이 다를 때만 중복 확인 호출
                if (userData && userData.email !== debouncedFullEmail) {
                    handleEmailDuplicationCheck(debouncedFullEmail);
                } else if (!userData) {
                // 아무것도 하지 않음
                } else {
                    setEmailError(null);
                    setEmailSuccess(null);
                }
            } else {
                setEmailError(null);
                setEmailSuccess(null);
            }
        }
    }["ProfilePage.useEffect"], [
        debouncedFullEmail,
        userData,
        isSocialUser,
        debouncedEmailFront,
        debouncedEmailBack
    ]);
    const handleEmailDomainChange = (domain)=>{
        if (domain === '직접입력') {
            setEmailBack(''); // 직접입력 선택 시 도메인 값 초기화
            setIsDirectInput(true);
        } else {
            setEmailBack(domain);
            setIsDirectInput(false);
        }
        setShowEmailDomainSelect(false);
        setEmailError(null);
        setEmailSuccess(null);
        if (emailFront && domain !== '직접입력') {
            handleEmailDuplicationCheck("".concat(emailFront, "@").concat(domain));
        }
    };
    const handleEmailDuplicationCheck = async (email)=>{
        // 클라이언트 측 이메일 형식 유효성 검사
        if (!/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(email)) {
            setEmailError('올바른 이메일 형식이 아닙니다.');
            setEmailSuccess(null);
            return false; // 형식 오류 시 유효하지 않음
        }
        // 이메일 변경이 없고 기존 이메일과 동일하면 중복 검사 건너뛰기
        if (userData && userData.email === email) {
            setEmailError(null);
            setEmailSuccess('현재 이메일입니다.');
            return true;
        }
        try {
            const response = await fetch("".concat(("TURBOPACK compile-time value", "http://localhost:8080"), "/user/exist-email"), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email
                })
            });
            if (response.status === 409) {
                setEmailError('이미 사용 중인 이메일입니다.');
                setEmailSuccess(null);
                return false; // 중복
            }
            if (!response.ok) {
                const errorData = await response.json();
                setEmailError(errorData.message || '이메일 중복 검사 실패');
                setEmailSuccess(null);
                // throw new Error(errorData.message || '이메일 중복 검사 실패'); // throw 대신 상태 업데이트
                return false;
            }
            setEmailError(null);
            setEmailSuccess('사용 가능한 이메일입니다.');
            return true; // 중복 아님 (200 OK)
        } catch (error) {
            console.error('이메일 중복 검사 중 오류 발생:', error);
            setEmailError("이메일 중복 검사 오류: ".concat(error.message));
            setEmailSuccess(null);
            return false;
        }
    };
    const handleSubmit = async (e)=>{
        e.preventDefault();
        // 모든 에러 상태 초기화
        setPasswordMismatchError(false);
        setCurrentPasswordError(null);
        setCurrentPasswordMismatchError(null); // 현재 비밀번호 불일치 에러 메시지 초기화
        setGeneralUpdateError(null);
        setEmailError(null); // 이메일 에러도 초기화
        setEmailSuccess(null); // 이메일 성공 메시지도 초기화
        if (!userData) {
            setGeneralUpdateError('사용자 정보를 불러오지 못했습니다.');
            return;
        }
        const updatedData = {
            username: userData.username,
            nickname: nickname,
            email: userData.email
        };
        let isEmailChanged = false;
        const newFullEmail = "".concat(emailFront, "@").concat(emailBack);
        if (userData.email !== newFullEmail) {
            isEmailChanged = true;
        }
        if (!isSocialUser) {
            // 자체 로그인 사용자만 비밀번호와 이메일 수정 가능
            if (newPassword) {
                if (newPassword !== newPasswordConfirm) {
                    setPasswordMismatchError(true);
                    return;
                }
                // 현재 비밀번호 유효성 검사
                const isCurrentPasswordValid = await checkCurrentPassword(currentPassword);
                if (!isCurrentPasswordValid) {
                    // checkCurrentPassword 함수 내부에서 이미 에러 메시지를 설정했으므로 추가 설정은 필요 없습니다.
                    return; // 비밀번호 불일치 시 제출 중단
                }
                updatedData.password = newPassword;
                updatedData.currentPassword = currentPassword; // 현재 비밀번호 추가
            }
            // 이메일이 변경된 경우에만 중복 확인 및 업데이트
            if (isEmailChanged) {
                const emailExists = await handleEmailDuplicationCheck(newFullEmail);
                if (!emailExists) {
                    // alert('이미 사용 중인 이메일입니다.'); // alert 제거, handleEmailDuplicationCheck에서 상태 설정
                    return;
                }
                updatedData.email = newFullEmail; // 변경된 이메일로 업데이트
            }
        } else {
            // 소셜 로그인 사용자는 이메일 및 비밀번호 변경 불가
            if (isEmailChanged) {
                setGeneralUpdateError('소셜 로그인 사용자는 이메일을 변경할 수 없습니다.');
                // alert('소셜 로그인 사용자는 이메일을 변경할 수 없습니다.'); // alert 제거
                return;
            }
            if (newPassword) {
                setGeneralUpdateError('소셜 로그인 사용자는 비밀번호를 변경할 수 없습니다.');
                // alert('소셜 로그인 사용자는 비밀번호를 변경할 수 없습니다.'); // alert 제거
                return;
            }
        }
        try {
            const xsrfToken = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$js$2d$cookie$2f$dist$2f$js$2e$cookie$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('XSRF-TOKEN');
            const response = await fetch("".concat(("TURBOPACK compile-time value", "http://localhost:8080"), "/user"), {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...xsrfToken && {
                        'X-XSRF-TOKEN': xsrfToken
                    }
                },
                credentials: 'include',
                body: JSON.stringify(updatedData)
            });
            if (response.ok) {
                // alert('회원 정보가 성공적으로 수정되었습니다.'); // alert 제거
                setGeneralUpdateError('회원 정보가 성공적으로 수정되었습니다.'); // 성공 메시지 표시
                // 성공적으로 업데이트 후 사용자 정보를 다시 불러와 UI를 업데이트하거나 Redux 상태를 업데이트할 수 있습니다.
                // fetchUserData(); // 사용자 정보를 다시 불러옴
                setUserData((prevData)=>({
                        ...prevData,
                        nickname: updatedData.nickname || prevData.nickname,
                        email: updatedData.email || prevData.email
                    }));
                // 비밀번호 변경 성공 시 비밀번호 필드 초기화 (보안상 좋음)
                setCurrentPassword('');
                setNewPassword('');
                setNewPasswordConfirm('');
            } else if (response.status === 403) {
                const errorData = await response.json();
                setGeneralUpdateError("권한 오류: ".concat(errorData.error || '수정 권한이 없습니다.'));
            // alert(`권한 오류: ${errorData.error || '수정 권한이 없습니다.'}`); // alert 제거
            } else {
                const contentType = response.headers.get('Content-Type');
                if (contentType && contentType.includes('application/json')) {
                    const errorData = await response.json();
                    setGeneralUpdateError(errorData.message || '회원 정보 수정에 실패했습니다.');
                } else {
                    const errorText = await response.text();
                    setGeneralUpdateError("회원 정보 수정에 실패했습니다. (응답: ".concat(response.status, " ").concat(errorText, ")"));
                }
            }
        } catch (err) {
            console.error('회원 정보 수정 중 오류 발생:', err);
            setGeneralUpdateError("회원 정보 수정 중 오류 발생: ".concat(err.message));
        // alert(`오류: ${err.message}`); // alert 제거
        }
    };
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].loading,
        children: "Loading..."
    }, void 0, false, {
        fileName: "[project]/app/mypage/profile/page.tsx",
        lineNumber: 386,
        columnNumber: 25
    }, this);
    if (error) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].error,
        children: [
            "Error: ",
            error
        ]
    }, void 0, true, {
        fileName: "[project]/app/mypage/profile/page.tsx",
        lineNumber: 387,
        columnNumber: 23
    }, this);
    if (!userData) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].noData,
        children: "사용자 정보를 찾을 수 없습니다."
    }, void 0, false, {
        fileName: "[project]/app/mypage/profile/page.tsx",
        lineNumber: 388,
        columnNumber: 27
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].pageWrapper,
        children: [
            " ",
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].profileCard,
                children: [
                    " ",
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].headerSection,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].pageTitle,
                            children: "개인 정보 수정"
                        }, void 0, false, {
                            fileName: "[project]/app/mypage/profile/page.tsx",
                            lineNumber: 394,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/mypage/profile/page.tsx",
                        lineNumber: 393,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].formSection,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                            onSubmit: handleSubmit,
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputGroup,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            htmlFor: "username",
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                                            children: "아이디"
                                        }, void 0, false, {
                                            fileName: "[project]/app/mypage/profile/page.tsx",
                                            lineNumber: 399,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputFieldContainer,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                "data-testid": "input-box",
                                                id: "username",
                                                name: "username",
                                                type: "text",
                                                readOnly: true,
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].readOnlyInput,
                                                value: userData.username
                                            }, void 0, false, {
                                                fileName: "[project]/app/mypage/profile/page.tsx",
                                                lineNumber: 401,
                                                columnNumber: 33
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/mypage/profile/page.tsx",
                                            lineNumber: 400,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/mypage/profile/page.tsx",
                                    lineNumber: 398,
                                    columnNumber: 25
                                }, this),
                                !isSocialUser && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputGroup,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "currentPassword",
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                                                    children: "현재 비밀번호"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/mypage/profile/page.tsx",
                                                    lineNumber: 416,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputFieldContainer,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            "data-testid": "input-box",
                                                            id: "currentPassword",
                                                            name: "currentPassword",
                                                            placeholder: "현재 비밀번호를 입력해 주세요",
                                                            type: showCurrentPassword ? 'text' : 'password',
                                                            autoComplete: "off",
                                                            className: "".concat(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].input, " ").concat(currentPasswordError || currentPasswordMismatchError ? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].errorBorder : ''),
                                                            value: currentPassword,
                                                            onChange: (e)=>{
                                                                setCurrentPassword(e.target.value);
                                                                setCurrentPasswordError(null); // 입력 시작 시 에러 메시지 초기화
                                                                setCurrentPasswordMismatchError(null); // 입력 시작 시 불일치 에러 초기화
                                                            },
                                                            onBlur: async ()=>{
                                                                if (!isSocialUser && currentPassword) {
                                                                    console.log('onBlur event triggered for currentPassword with value:', currentPassword);
                                                                    await checkCurrentPassword(currentPassword);
                                                                } else if (!currentPassword) {
                                                                    console.log('currentPassword is empty on blur, setting currentPasswordMismatchError to null.');
                                                                    setCurrentPasswordMismatchError(null);
                                                                }
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/mypage/profile/page.tsx",
                                                            lineNumber: 418,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].passwordToggle,
                                                            onClick: ()=>setShowCurrentPassword((prev)=>!prev),
                                                            "aria-label": showCurrentPassword ? '비밀번호 숨기기' : '비밀번호 보이기',
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                src: showCurrentPassword ? '/images/open_eye.png' : '/images/closed_eye.png',
                                                                alt: showCurrentPassword ? '비밀번호 숨기기' : '비밀번호 보이기',
                                                                width: 20,
                                                                height: 20
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/mypage/profile/page.tsx",
                                                                lineNumber: 448,
                                                                columnNumber: 45
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/mypage/profile/page.tsx",
                                                            lineNumber: 442,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/mypage/profile/page.tsx",
                                                    lineNumber: 417,
                                                    columnNumber: 37
                                                }, this),
                                                currentPasswordMismatchError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].errorMessage,
                                                    children: currentPasswordMismatchError
                                                }, void 0, false, {
                                                    fileName: "[project]/app/mypage/profile/page.tsx",
                                                    lineNumber: 456,
                                                    columnNumber: 70
                                                }, this),
                                                currentPasswordError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].errorMessage,
                                                    children: currentPasswordError
                                                }, void 0, false, {
                                                    fileName: "[project]/app/mypage/profile/page.tsx",
                                                    lineNumber: 457,
                                                    columnNumber: 62
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/mypage/profile/page.tsx",
                                            lineNumber: 415,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputGroup,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "newPassword",
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                                                    children: "새 비밀번호"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/mypage/profile/page.tsx",
                                                    lineNumber: 461,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputFieldContainer,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            "data-testid": "input-box",
                                                            id: "newPassword",
                                                            name: "newPassword",
                                                            placeholder: "새 비밀번호를 입력해 주세요",
                                                            type: showNewPassword ? 'text' : 'password',
                                                            autoComplete: "off",
                                                            className: "".concat(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputField, " ").concat(passwordMismatchError ? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].errorBorder : '', " ").concat(newPassword ? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].hasValue : ''),
                                                            value: newPassword,
                                                            onChange: (e)=>{
                                                                setNewPassword(e.target.value);
                                                                if (newPasswordConfirm && e.target.value !== newPasswordConfirm) {
                                                                    setPasswordMismatchError(true);
                                                                } else {
                                                                    setPasswordMismatchError(false);
                                                                }
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/mypage/profile/page.tsx",
                                                            lineNumber: 463,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].passwordToggle,
                                                            onClick: ()=>setShowNewPassword((prev)=>!prev),
                                                            "aria-label": showNewPassword ? '비밀번호 숨기기' : '비밀번호 보이기',
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                src: showNewPassword ? '/images/open_eye.png' : '/images/closed_eye.png',
                                                                alt: showNewPassword ? '비밀번호 숨기기' : '비밀번호 보이기',
                                                                width: 20,
                                                                height: 20
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/mypage/profile/page.tsx",
                                                                lineNumber: 487,
                                                                columnNumber: 45
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/mypage/profile/page.tsx",
                                                            lineNumber: 481,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/mypage/profile/page.tsx",
                                                    lineNumber: 462,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/mypage/profile/page.tsx",
                                            lineNumber: 460,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputGroup,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    htmlFor: "newPasswordConfirm",
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                                                    children: "새 비밀번호 확인"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/mypage/profile/page.tsx",
                                                    lineNumber: 498,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputFieldContainer,
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            "data-testid": "input-box",
                                                            id: "newPasswordConfirm",
                                                            name: "newPasswordConfirm",
                                                            placeholder: "새 비밀번호를 다시 입력해 주세요",
                                                            type: showNewPasswordConfirm ? 'text' : 'password',
                                                            autoComplete: "off",
                                                            className: "".concat(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputField, " ").concat(passwordMismatchError ? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].errorBorder : '', " ").concat(newPasswordConfirm ? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].hasValue : ''),
                                                            value: newPasswordConfirm,
                                                            onChange: (e)=>{
                                                                setNewPasswordConfirm(e.target.value);
                                                                if (newPassword && e.target.value !== newPassword) {
                                                                    setPasswordMismatchError(true);
                                                                } else {
                                                                    setPasswordMismatchError(false);
                                                                }
                                                            }
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/mypage/profile/page.tsx",
                                                            lineNumber: 500,
                                                            columnNumber: 41
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                            type: "button",
                                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].passwordToggle,
                                                            onClick: ()=>setShowNewPasswordConfirm((prev)=>!prev),
                                                            "aria-label": showNewPasswordConfirm ? '비밀번호 숨기기' : '비밀번호 보이기',
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                                src: showNewPasswordConfirm ? '/images/open_eye.png' : '/images/closed_eye.png',
                                                                alt: showNewPasswordConfirm ? '비밀번호 숨기기' : '비밀번호 보이기',
                                                                width: 20,
                                                                height: 20
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/mypage/profile/page.tsx",
                                                                lineNumber: 524,
                                                                columnNumber: 45
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/mypage/profile/page.tsx",
                                                            lineNumber: 518,
                                                            columnNumber: 41
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/mypage/profile/page.tsx",
                                                    lineNumber: 499,
                                                    columnNumber: 37
                                                }, this),
                                                passwordMismatchError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].errorMessage,
                                                    children: "새 비밀번호와 비밀번호 확인이 일치하지 않습니다."
                                                }, void 0, false, {
                                                    fileName: "[project]/app/mypage/profile/page.tsx",
                                                    lineNumber: 532,
                                                    columnNumber: 63
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/mypage/profile/page.tsx",
                                            lineNumber: 497,
                                            columnNumber: 33
                                        }, this)
                                    ]
                                }, void 0, true),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputGroup,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            htmlFor: "nickname",
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                                            children: "닉네임"
                                        }, void 0, false, {
                                            fileName: "[project]/app/mypage/profile/page.tsx",
                                            lineNumber: 538,
                                            columnNumber: 29
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputFieldContainer,
                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                "data-testid": "input-box",
                                                id: "nickname",
                                                name: "nickname",
                                                placeholder: "닉네임을 입력해 주세요",
                                                type: "text",
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].input,
                                                value: nickname,
                                                onChange: (e)=>setNickname(e.target.value)
                                            }, void 0, false, {
                                                fileName: "[project]/app/mypage/profile/page.tsx",
                                                lineNumber: 540,
                                                columnNumber: 33
                                            }, this)
                                        }, void 0, false, {
                                            fileName: "[project]/app/mypage/profile/page.tsx",
                                            lineNumber: 539,
                                            columnNumber: 29
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/mypage/profile/page.tsx",
                                    lineNumber: 537,
                                    columnNumber: 25
                                }, this),
                                !isSocialUser && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputGroup,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                            htmlFor: "emailFront",
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                                            children: "이메일"
                                        }, void 0, false, {
                                            fileName: "[project]/app/mypage/profile/page.tsx",
                                            lineNumber: 555,
                                            columnNumber: 33
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].boxEmail,
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "".concat(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].boxInput, " ").concat(emailError ? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].joinError : '', " ").concat(emailFront ? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].hasValue : ''),
                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        id: "emailFront",
                                                        className: "".concat(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputInfo, " ").concat(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].emailInput),
                                                        placeholder: "이메일 주소 입력",
                                                        value: emailFront,
                                                        onChange: (e)=>setEmailFront(e.target.value),
                                                        required: true
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/mypage/profile/page.tsx",
                                                        lineNumber: 558,
                                                        columnNumber: 41
                                                    }, this)
                                                }, void 0, false, {
                                                    fileName: "[project]/app/mypage/profile/page.tsx",
                                                    lineNumber: 557,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].textAt,
                                                    children: "@"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/mypage/profile/page.tsx",
                                                    lineNumber: 568,
                                                    columnNumber: 37
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "".concat(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].boxSelect, " ").concat(showEmailDomainSelect ? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].on : ''),
                                                    children: [
                                                        isDirectInput ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                            type: "text",
                                                            id: "emailDomainDirectInput",
                                                            className: "".concat(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputInfo, " ").concat(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].emailInput, " ").concat(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].domainInputField, " ").concat(emailBack ? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].hasValue : ''),
                                                            placeholder: "직접 입력",
                                                            value: emailBack,
                                                            onChange: (e)=>setEmailBack(e.target.value),
                                                            onClick: (e)=>e.stopPropagation(),
                                                            required: !emailError
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/mypage/profile/page.tsx",
                                                            lineNumber: 573,
                                                            columnNumber: 45
                                                        }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "".concat(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].inputInfo, " ").concat(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].emailInput, " ").concat(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].domainDisplayField, " ").concat(emailBack ? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].hasValue : ''),
                                                            children: [
                                                                " ",
                                                                emailBack || '선택해주세요.'
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/mypage/profile/page.tsx",
                                                            lineNumber: 584,
                                                            columnNumber: 45
                                                        }, this),
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].selectArrowContainer,
                                                            onClick: ()=>setShowEmailDomainSelect(!showEmailDomainSelect),
                                                            children: [
                                                                " ",
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].selectArrow,
                                                                    children: showEmailDomainSelect ? '▲' : '▼'
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/mypage/profile/page.tsx",
                                                                    lineNumber: 589,
                                                                    columnNumber: 45
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/mypage/profile/page.tsx",
                                                            lineNumber: 588,
                                                            columnNumber: 41
                                                        }, this),
                                                        showEmailDomainSelect && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].boxLayer,
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].listAdress,
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].listItem,
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            type: "button",
                                                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].buttonMail,
                                                                            onClick: ()=>{
                                                                                handleEmailDomainChange('직접입력');
                                                                            },
                                                                            children: "직접입력"
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/mypage/profile/page.tsx",
                                                                            lineNumber: 595,
                                                                            columnNumber: 57
                                                                        }, this)
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/mypage/profile/page.tsx",
                                                                        lineNumber: 594,
                                                                        columnNumber: 53
                                                                    }, this),
                                                                    [
                                                                        'naver.com',
                                                                        'gmail.com',
                                                                        'hanmail.net',
                                                                        'nate.com',
                                                                        'hotmail.com',
                                                                        'daum.net',
                                                                        'outlook.com',
                                                                        'kakao.com'
                                                                    ].map((domain)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].listItem,
                                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                                type: "button",
                                                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].buttonMail,
                                                                                onClick: ()=>{
                                                                                    handleEmailDomainChange(domain);
                                                                                },
                                                                                children: domain
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/mypage/profile/page.tsx",
                                                                                lineNumber: 599,
                                                                                columnNumber: 61
                                                                            }, this)
                                                                        }, domain, false, {
                                                                            fileName: "[project]/app/mypage/profile/page.tsx",
                                                                            lineNumber: 598,
                                                                            columnNumber: 57
                                                                        }, this))
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/mypage/profile/page.tsx",
                                                                lineNumber: 593,
                                                                columnNumber: 49
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/mypage/profile/page.tsx",
                                                            lineNumber: 592,
                                                            columnNumber: 45
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/mypage/profile/page.tsx",
                                                    lineNumber: 569,
                                                    columnNumber: 37
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/mypage/profile/page.tsx",
                                            lineNumber: 556,
                                            columnNumber: 33
                                        }, this),
                                        emailError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].errorMessage,
                                            children: emailError
                                        }, void 0, false, {
                                            fileName: "[project]/app/mypage/profile/page.tsx",
                                            lineNumber: 607,
                                            columnNumber: 48
                                        }, this),
                                        !emailError && emailSuccess && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].successMessage,
                                            children: emailSuccess
                                        }, void 0, false, {
                                            fileName: "[project]/app/mypage/profile/page.tsx",
                                            lineNumber: 608,
                                            columnNumber: 65
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/mypage/profile/page.tsx",
                                    lineNumber: 554,
                                    columnNumber: 29
                                }, this),
                                generalUpdateError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "".concat(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].errorMessage, " ").concat(generalUpdateError.includes('성공적으로') ? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].successMessage : ''),
                                    children: generalUpdateError
                                }, void 0, false, {
                                    fileName: "[project]/app/mypage/profile/page.tsx",
                                    lineNumber: 613,
                                    columnNumber: 29
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].buttonGroup,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "submit",
                                        className: "".concat(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].bottomButton, " ").concat(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].saveButton),
                                        children: "수정 내용 저장하기"
                                    }, void 0, false, {
                                        fileName: "[project]/app/mypage/profile/page.tsx",
                                        lineNumber: 617,
                                        columnNumber: 29
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/mypage/profile/page.tsx",
                                    lineNumber: 616,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("hr", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].buttonSeparator
                                }, void 0, false, {
                                    fileName: "[project]/app/mypage/profile/page.tsx",
                                    lineNumber: 620,
                                    columnNumber: 25
                                }, this),
                                " ",
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].buttonGroup,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>router.push('/mypage/profile/withdraw'),
                                        className: "".concat(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].bottomButton, " ").concat(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$mypage$2f$profile$2f$page$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].withdrawButton),
                                        children: "탈퇴하기"
                                    }, void 0, false, {
                                        fileName: "[project]/app/mypage/profile/page.tsx",
                                        lineNumber: 622,
                                        columnNumber: 29
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/mypage/profile/page.tsx",
                                    lineNumber: 621,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/mypage/profile/page.tsx",
                            lineNumber: 397,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/mypage/profile/page.tsx",
                        lineNumber: 396,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/mypage/profile/page.tsx",
                lineNumber: 392,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/mypage/profile/page.tsx",
        lineNumber: 391,
        columnNumber: 9
    }, this);
}
_s1(ProfilePage, "m+YBY5feVPu6rHDprTU0h98m5kM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$store$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAppSelector"],
        useDebounce,
        useDebounce
    ];
});
_c = ProfilePage;
var _c;
__turbopack_context__.k.register(_c, "ProfilePage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=app_mypage_profile_56c10490._.js.map