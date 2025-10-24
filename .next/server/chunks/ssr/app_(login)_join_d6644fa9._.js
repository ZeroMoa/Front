module.exports = [
"[project]/app/(login)/join/page.module.css [app-ssr] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "boxEmail": "page-module__qO29tG__boxEmail",
  "boxInput": "page-module__qO29tG__boxInput",
  "boxLayer": "page-module__qO29tG__boxLayer",
  "boxSelect": "page-module__qO29tG__boxSelect",
  "button": "page-module__qO29tG__button",
  "buttonGroup": "page-module__qO29tG__buttonGroup",
  "buttonMail": "page-module__qO29tG__buttonMail",
  "card": "page-module__qO29tG__card",
  "checkButton": "page-module__qO29tG__checkButton",
  "checkIcon": "page-module__qO29tG__checkIcon",
  "completionCard": "page-module__qO29tG__completionCard",
  "completionMessage": "page-module__qO29tG__completionMessage",
  "completionSubtitle": "page-module__qO29tG__completionSubtitle",
  "container": "page-module__qO29tG__container",
  "domainDisplayField": "page-module__qO29tG__domainDisplayField",
  "domainInputField": "page-module__qO29tG__domainInputField",
  "emailInput": "page-module__qO29tG__emailInput",
  "errorMessage": "page-module__qO29tG__errorMessage",
  "hasValue": "page-module__qO29tG__hasValue",
  "inputField": "page-module__qO29tG__inputField",
  "inputFieldContainer": "page-module__qO29tG__inputFieldContainer",
  "inputGroup": "page-module__qO29tG__inputGroup",
  "inputInfo": "page-module__qO29tG__inputInfo",
  "joinError": "page-module__qO29tG__joinError",
  "listAdress": "page-module__qO29tG__listAdress",
  "listItem": "page-module__qO29tG__listItem",
  "loginButton": "page-module__qO29tG__loginButton",
  "logo": "page-module__qO29tG__logo",
  "logoContainer": "page-module__qO29tG__logoContainer",
  "nextButton": "page-module__qO29tG__nextButton",
  "on": "page-module__qO29tG__on",
  "prevButton": "page-module__qO29tG__prevButton",
  "requiredField": "page-module__qO29tG__requiredField",
  "requiredInfo": "page-module__qO29tG__requiredInfo",
  "selectArrow": "page-module__qO29tG__selectArrow",
  "selectArrowContainer": "page-module__qO29tG__selectArrowContainer",
  "subtitle": "page-module__qO29tG__subtitle",
  "successMessage": "page-module__qO29tG__successMessage",
  "textAt": "page-module__qO29tG__textAt",
  "textCont": "page-module__qO29tG__textCont",
  "title": "page-module__qO29tG__title",
});
}),
"[project]/app/(login)/join/page.tsx [app-ssr] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>JoinPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/image.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$authSlice$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/store/authSlice.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/app/(login)/join/page.module.css [app-ssr] (css module)");
'use client';
;
;
;
;
;
;
;
function useDebounce(value, delay) {
    const [debouncedValue, setDebouncedValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(value);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        const handler = setTimeout(()=>{
            setDebouncedValue(value);
        }, delay);
        return ()=>{
            clearTimeout(handler);
        };
    }, [
        value,
        delay
    ]);
    return debouncedValue;
}
function JoinPage() {
    const [step, setStep] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(1); // 1: 회원가입 양식, 2: 완료 화면
    const [username, setUsername] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(''); // 아이디
    const [email, setEmail] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(''); // 이메일
    const [nickname, setNickname] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(''); // 닉네임 (선택 사항)
    const [password, setPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [confirmPassword, setConfirmPassword] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    const [passwordMismatchError, setPasswordMismatchError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false); // 비밀번호 불일치 에러 상태
    const [usernameError, setUsernameError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null); // 아이디 중복 에러 메시지
    const [emailError, setEmailError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null); // 이메일 중복/형식 에러 메시지
    const [nicknameError, setNicknameError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null); // 닉네임 유효성 에러 메시지 (현재는 사용하지 않음)
    const [usernameSuccess, setUsernameSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null); // 아이디 사용 가능 메시지
    const [emailSuccess, setEmailSuccess] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null); // 이메일 사용 가능 메시지
    const [emailFront, setEmailFront] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(''); // 이메일 앞 부분
    const [emailBack, setEmailBack] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(''); // 이메일 뒷 부분 (도메인)
    const [showEmailDomainSelect, setShowEmailDomainSelect] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false); // 이메일 도메인 선택 박스 표시 여부
    const [isDirectInput, setIsDirectInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false); // 이메일 도메인 직접 입력 여부
    const [isUsernameValidState, setIsUsernameValidState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null); // 아이디 최종 유효성 상태: null(검사중), true(유효), false(유효하지 않음)
    const [isEmailValidState, setIsEmailValidState] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(null); // 이메일 최종 유효성 상태: null(검사중), true(유효), false(유효하지 않음)
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRouter"])();
    const dispatch = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAppDispatch"])();
    // 아이디 및 이메일 중복 확인 API 호출 함수
    const checkExistence = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(async (field, value)=>{
        if (field === 'username') setIsUsernameValidState(null); // 검사 시작 시 상태 초기화
        if (field === 'email') setIsEmailValidState(null); // 검사 시작 시 상태 초기화
        if (!value) {
            if (field === 'username') {
                setUsernameError(null);
                setUsernameSuccess(null);
                setIsUsernameValidState(false);
            }
            if (field === 'email') {
                setEmailError(null);
                setEmailSuccess(null);
                setIsEmailValidState(false);
            }
            return false; // 빈 값은 유효하지 않음
        }
        // 이메일 형식 유효성 검사 (클라이언트 측)
        if (field === 'email' && !/^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/.test(value)) {
            setEmailError('올바른 이메일 형식이 아닙니다.');
            setEmailSuccess(null);
            setIsEmailValidState(false);
            return false; // 형식 오류 시 유효하지 않음
        }
        try {
            const apiPath = field === 'username' ? '/user/exist' : '/user/exist-email'; // API 엔드포인트 분리
            const response = await fetch(`${("TURBOPACK compile-time value", "http://localhost:8080")}${apiPath}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    [field]: value
                })
            });
            // 이메일 전용: 409 Conflict 응답 처리 (이미 존재하는 경우)
            if (field === 'email' && response.status === 409) {
                setEmailError('이미 사용 중인 이메일입니다.');
                setEmailSuccess(null);
                setIsEmailValidState(false);
                return false; // 중복 시 유효하지 않음
            }
            if (!response.ok) {
                const errorData = await response.json().catch(()=>({
                        message: '서버 오류 발생'
                    })); // JSON 파싱 실패 대비
                if (field === 'username') {
                    setUsernameError(errorData.message || '아이디 확인 중 오류 발생');
                    setUsernameSuccess(null);
                    setIsUsernameValidState(false);
                }
                if (field === 'email') {
                    setEmailError(errorData.message || '이메일 확인 중 오류 발생');
                    setEmailSuccess(null);
                    setIsEmailValidState(false);
                }
                return false; // API 오류 발생 시 유효하지 않음
            }
            // 200 OK 응답 처리 (isExist 값에 따라 성공/실패 메시지 설정)
            const isExist = await response.json(); // isExist는 API 응답에 따라 true/false 또는 { isExist: true/false } 형태일 수 있음
            const isValidResult = field === 'username' ? !Boolean(isExist) : true; // 아이디는 isExist가 false여야 유효, 이메일은 409가 아니면 유효
            if (field === 'username') {
                if (!isValidResult) {
                    setUsernameError('이미 사용 중인 아이디입니다.');
                    setUsernameSuccess(null);
                    setIsUsernameValidState(false); // 이미 사용 중이면 유효하지 않음
                    return false;
                } else {
                    setUsernameError(null);
                    setUsernameSuccess('사용 가능한 아이디입니다.');
                    setIsUsernameValidState(true); // 사용 가능하면 유효
                    return true;
                }
            } else if (field === 'email') {
                // /user/exist-email은 200 OK 시 isExist가 항상 false (409에서 true 처리됨)
                setEmailError(null);
                setEmailSuccess('사용 가능한 이메일입니다.');
                setIsEmailValidState(true); // 사용 가능하면 유효
                return true;
            }
            return false; // 예상치 못한 경우
        } catch (error) {
            console.error('중복 확인 중 오류 발생:', error);
            if (field === 'username') {
                setUsernameError('중복 확인 중 오류가 발생했습니다.');
                setUsernameSuccess(null);
                setIsUsernameValidState(false);
            }
            if (field === 'email') {
                setEmailError('중복 확인 중 오류가 발생했습니다.');
                setEmailSuccess(null);
                setIsEmailValidState(false);
            }
            return false; // 네트워크 또는 기타 오류 시 유효하지 않음
        }
    }, []);
    // Debounced values
    const debouncedUsername = useDebounce(username, 500); // 500ms debounce
    const debouncedEmailFront = useDebounce(emailFront, 500); // 500ms debounce
    const debouncedEmailBack = useDebounce(emailBack, 500); // 500ms debounce
    const debouncedEmail = `${debouncedEmailFront}@${debouncedEmailBack}`;
    // Use useEffect to trigger checkExistence when debounced values change
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (debouncedUsername) {
            // checkExistence의 반환값을 사용하지 않고, 오직 상태 업데이트만 의존합니다.
            // 여기서 직접 isUsernameValidState를 업데이트하도록 변경
            checkExistence('username', debouncedUsername);
        }
    }, [
        debouncedUsername,
        checkExistence
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        if (debouncedEmailFront && debouncedEmailBack && debouncedEmail !== '@') {
            // checkExistence의 반환값을 사용하지 않고, 오직 상태 업데이트만 의존합니다.
            // 여기서 직접 isEmailValidState를 업데이트하도록 변경
            checkExistence('email', debouncedEmail);
        }
    }, [
        debouncedEmail,
        checkExistence,
        debouncedEmailFront,
        debouncedEmailBack
    ]);
    const handleNext = async (e)=>{
        e.preventDefault();
        if (password !== confirmPassword) {
            setPasswordMismatchError(true);
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }
        setPasswordMismatchError(false);
        // 1. 기본 필수 필드 유효성 검사
        const isEmailComplete = emailFront && emailBack && emailFront.trim() !== '' && emailBack.trim() !== '';
        if (!username || !isEmailComplete || !password || !confirmPassword) {
            alert('아이디, 이메일 주소, 비밀번호를 모두 입력해주세요.');
            return;
        }
        // 2. 최종 제출 시점에 중복 확인 강제 트리거 및 결과 대기
        const usernameValidity = await checkExistence('username', username);
        const emailValidity = await checkExistence('email', `${emailFront}@${emailBack}`);
        // `checkExistence` 호출 후 상태 업데이트를 기다립니다.
        // 이 부분이 중요합니다. `checkExistence`는 상태를 비동기적으로 업데이트하므로,
        // `handleNext`에서는 그 상태가 최종적으로 반영되었는지 확인해야 합니다.
        // 실제 상황에서는 `checkExistence` 내부에서 `setIsUsernameValidState`와 `setIsEmailValidState`가
        // 호출되고, 이 상태가 업데이트되는 것을 기다려야 합니다.
        // 여기서는 `checkExistence`의 반환값을 직접 사용하여 `isUsernameValidState`와 `isEmailValidState`를 업데이트합니다.
        setIsUsernameValidState(usernameValidity);
        setIsEmailValidState(emailValidity);
        // 3. 최종 유효성 상태 확인
        // 디바운스된 상태가 아닌, 제출 시점에 직접 검사한 결과를 사용합니다.
        if (!usernameValidity || !emailValidity) {
            alert('아이디 또는 이메일 중복/형식 확인이 필요합니다. 잠시 후 다시 시도해주세요.');
            return;
        }
        // 모든 검사 통과 후 다음 단계로 이동
        console.log('회원가입 정보:', {
            username,
            email: `${emailFront}@${emailBack}`,
            nickname,
            password
        });
        try {
            const response = await fetch(`${("TURBOPACK compile-time value", "http://localhost:8080")}/user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    email: `${emailFront}@${emailBack}`,
                    nickname,
                    password
                })
            });
            if (!response.ok) {
                let errorData = {
                    message: '회원가입 실패: 알 수 없는 오류'
                };
                try {
                    errorData = await response.json();
                } catch (jsonError) {
                    console.error('회원가입 응답 JSON 파싱 실패:', jsonError);
                    errorData.message = response.statusText || '회원가입 실패: 서버 응답 오류';
                }
                alert(`회원가입 실패: ${errorData.message}`);
                console.error('회원가입 실패:', errorData);
                return;
            }
            const successData = await response.json();
            console.log('회원가입 성공:', successData);
            setStep(2); // 회원가입 성공 시 완료 화면으로 이동
        } catch (error) {
            console.error('회원가입 요청 중 오류 발생:', error);
            alert('회원가입 요청 중 네트워크 오류가 발생했습니다.');
        }
    };
    const handlePrev = ()=>{
        setStep(1);
    };
    const handleLoginClick = ()=>{
        dispatch((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$store$2f$authSlice$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["openLoginModal"])());
        router.push('/');
    };
    const handlePasswordChange = (e)=>{
        setPassword(e.target.value);
        if (confirmPassword && e.target.value !== confirmPassword) {
            setPasswordMismatchError(true);
        } else {
            setPasswordMismatchError(false);
        }
    };
    const handleConfirmPasswordChange = (e)=>{
        setConfirmPassword(e.target.value);
        if (password && e.target.value !== password) {
            setPasswordMismatchError(true);
        } else {
            setPasswordMismatchError(false);
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].container,
        children: [
            step === 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].card,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].requiredInfo,
                        children: "은 필수입력사항 입니다."
                    }, void 0, false, {
                        fileName: "[project]/app/(login)/join/page.tsx",
                        lineNumber: 257,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].title,
                        children: "회원가입"
                    }, void 0, false, {
                        fileName: "[project]/app/(login)/join/page.tsx",
                        lineNumber: 258,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].subtitle,
                        children: " "
                    }, void 0, false, {
                        fileName: "[project]/app/(login)/join/page.tsx",
                        lineNumber: 259,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                        onSubmit: handleNext,
                        style: {
                            width: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center'
                        },
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].inputGroup,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        htmlFor: "username",
                                        children: [
                                            "아이디",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].requiredField,
                                                children: "*"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(login)/join/page.tsx",
                                                lineNumber: 263,
                                                columnNumber: 58
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(login)/join/page.tsx",
                                        lineNumber: 263,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].inputFieldContainer,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            id: "username",
                                            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].inputField} ${username ? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].hasValue : ''}`,
                                            value: username,
                                            onChange: (e)=>setUsername(e.target.value),
                                            required: true
                                        }, void 0, false, {
                                            fileName: "[project]/app/(login)/join/page.tsx",
                                            lineNumber: 265,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/(login)/join/page.tsx",
                                        lineNumber: 264,
                                        columnNumber: 29
                                    }, this),
                                    usernameError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].errorMessage,
                                        children: usernameError
                                    }, void 0, false, {
                                        fileName: "[project]/app/(login)/join/page.tsx",
                                        lineNumber: 274,
                                        columnNumber: 47
                                    }, this),
                                    !usernameError && usernameSuccess && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].successMessage,
                                        children: usernameSuccess
                                    }, void 0, false, {
                                        fileName: "[project]/app/(login)/join/page.tsx",
                                        lineNumber: 275,
                                        columnNumber: 67
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(login)/join/page.tsx",
                                lineNumber: 262,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].inputGroup,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        htmlFor: "emailFront",
                                        children: [
                                            "이메일",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].requiredField,
                                                children: "*"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(login)/join/page.tsx",
                                                lineNumber: 279,
                                                columnNumber: 60
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(login)/join/page.tsx",
                                        lineNumber: 279,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].boxEmail,
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].boxInput} ${emailError ? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].joinError : ''} ${emailFront ? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].hasValue : ''}`,
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "text",
                                                    id: "emailFront",
                                                    className: `${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].inputInfo} ${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].emailInput}`,
                                                    placeholder: "이메일 주소 입력",
                                                    value: emailFront,
                                                    onChange: (e)=>setEmailFront(e.target.value),
                                                    required: true
                                                }, void 0, false, {
                                                    fileName: "[project]/app/(login)/join/page.tsx",
                                                    lineNumber: 282,
                                                    columnNumber: 37
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/(login)/join/page.tsx",
                                                lineNumber: 281,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].textAt,
                                                children: "@"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(login)/join/page.tsx",
                                                lineNumber: 292,
                                                columnNumber: 33
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: `${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].boxSelect} ${showEmailDomainSelect ? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].on : ''}`,
                                                children: [
                                                    isDirectInput ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                        type: "text",
                                                        id: "emailDomainDirectInput",
                                                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].inputInfo} ${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].emailInput} ${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].domainInputField} ${emailBack ? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].hasValue : ''}`,
                                                        placeholder: "직접 입력",
                                                        value: emailBack,
                                                        onChange: (e)=>setEmailBack(e.target.value),
                                                        onClick: (e)=>e.stopPropagation(),
                                                        required: !emailError
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(login)/join/page.tsx",
                                                        lineNumber: 297,
                                                        columnNumber: 41
                                                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].inputInfo} ${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].emailInput} ${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].domainDisplayField} ${emailBack ? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].hasValue : ''}`,
                                                        children: [
                                                            " ",
                                                            emailBack || '선택해주세요.'
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/(login)/join/page.tsx",
                                                        lineNumber: 308,
                                                        columnNumber: 41
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].selectArrowContainer,
                                                        onClick: ()=>setShowEmailDomainSelect(!showEmailDomainSelect),
                                                        children: [
                                                            " ",
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].selectArrow,
                                                                children: showEmailDomainSelect ? '▲' : '▼'
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/(login)/join/page.tsx",
                                                                lineNumber: 313,
                                                                columnNumber: 41
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/(login)/join/page.tsx",
                                                        lineNumber: 312,
                                                        columnNumber: 37
                                                    }, this),
                                                    showEmailDomainSelect && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].boxLayer,
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].listAdress,
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                                    className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].listItem,
                                                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                        type: "button",
                                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].buttonMail,
                                                                        onClick: ()=>{
                                                                            setEmailBack('');
                                                                            setIsDirectInput(true);
                                                                            setShowEmailDomainSelect(false);
                                                                        },
                                                                        children: "직접입력"
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/(login)/join/page.tsx",
                                                                        lineNumber: 319,
                                                                        columnNumber: 53
                                                                    }, this)
                                                                }, void 0, false, {
                                                                    fileName: "[project]/app/(login)/join/page.tsx",
                                                                    lineNumber: 318,
                                                                    columnNumber: 49
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
                                                                ].map((domain)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].listItem,
                                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                            type: "button",
                                                                            className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].buttonMail,
                                                                            onClick: ()=>{
                                                                                setEmailBack(domain);
                                                                                setIsDirectInput(false);
                                                                                setShowEmailDomainSelect(false);
                                                                                checkExistence('email', `${emailFront}@${domain}`);
                                                                            },
                                                                            children: domain
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/(login)/join/page.tsx",
                                                                            lineNumber: 323,
                                                                            columnNumber: 57
                                                                        }, this)
                                                                    }, domain, false, {
                                                                        fileName: "[project]/app/(login)/join/page.tsx",
                                                                        lineNumber: 322,
                                                                        columnNumber: 53
                                                                    }, this))
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/(login)/join/page.tsx",
                                                            lineNumber: 317,
                                                            columnNumber: 45
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/(login)/join/page.tsx",
                                                        lineNumber: 316,
                                                        columnNumber: 41
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/(login)/join/page.tsx",
                                                lineNumber: 293,
                                                columnNumber: 33
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(login)/join/page.tsx",
                                        lineNumber: 280,
                                        columnNumber: 29
                                    }, this),
                                    emailError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].errorMessage,
                                        children: emailError
                                    }, void 0, false, {
                                        fileName: "[project]/app/(login)/join/page.tsx",
                                        lineNumber: 331,
                                        columnNumber: 44
                                    }, this),
                                    !emailError && emailSuccess && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].successMessage,
                                        children: emailSuccess
                                    }, void 0, false, {
                                        fileName: "[project]/app/(login)/join/page.tsx",
                                        lineNumber: 332,
                                        columnNumber: 61
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(login)/join/page.tsx",
                                lineNumber: 278,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].inputGroup,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        htmlFor: "nickname",
                                        children: "닉네임"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(login)/join/page.tsx",
                                        lineNumber: 336,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].inputFieldContainer,
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "text",
                                            id: "nickname",
                                            className: `${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].inputField} ${nickname ? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].hasValue : ''}`,
                                            value: nickname,
                                            onChange: (e)=>setNickname(e.target.value)
                                        }, void 0, false, {
                                            fileName: "[project]/app/(login)/join/page.tsx",
                                            lineNumber: 338,
                                            columnNumber: 33
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/(login)/join/page.tsx",
                                        lineNumber: 337,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(login)/join/page.tsx",
                                lineNumber: 335,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].inputGroup,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        htmlFor: "password",
                                        children: [
                                            "비밀번호",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].requiredField,
                                                children: "*"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(login)/join/page.tsx",
                                                lineNumber: 349,
                                                columnNumber: 59
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(login)/join/page.tsx",
                                        lineNumber: 349,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "password",
                                        id: "password",
                                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].inputField} ${password ? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].hasValue : ''}`,
                                        value: password,
                                        onChange: handlePasswordChange,
                                        required: true
                                    }, void 0, false, {
                                        fileName: "[project]/app/(login)/join/page.tsx",
                                        lineNumber: 350,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(login)/join/page.tsx",
                                lineNumber: 348,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].inputGroup,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        htmlFor: "confirmPassword",
                                        children: [
                                            "비밀번호 확인",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].requiredField,
                                                children: "*"
                                            }, void 0, false, {
                                                fileName: "[project]/app/(login)/join/page.tsx",
                                                lineNumber: 361,
                                                columnNumber: 69
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/(login)/join/page.tsx",
                                        lineNumber: 361,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "password",
                                        id: "confirmPassword",
                                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].inputField} ${passwordMismatchError ? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].errorBorder : ''} ${confirmPassword ? __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].hasValue : ''}`,
                                        value: confirmPassword,
                                        onChange: handleConfirmPasswordChange,
                                        required: true
                                    }, void 0, false, {
                                        fileName: "[project]/app/(login)/join/page.tsx",
                                        lineNumber: 362,
                                        columnNumber: 29
                                    }, this),
                                    passwordMismatchError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].errorMessage,
                                        children: "비밀번호가 일치하지 않습니다."
                                    }, void 0, false, {
                                        fileName: "[project]/app/(login)/join/page.tsx",
                                        lineNumber: 371,
                                        columnNumber: 33
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(login)/join/page.tsx",
                                lineNumber: 360,
                                columnNumber: 25
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].buttonGroup,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].button} ${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].prevButton}`,
                                        onClick: handlePrev,
                                        disabled: true,
                                        children: "이전"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(login)/join/page.tsx",
                                        lineNumber: 376,
                                        columnNumber: 29
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "submit",
                                        className: `${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].button} ${__TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].nextButton}`,
                                        children: "다음"
                                    }, void 0, false, {
                                        fileName: "[project]/app/(login)/join/page.tsx",
                                        lineNumber: 377,
                                        columnNumber: 29
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/(login)/join/page.tsx",
                                lineNumber: 375,
                                columnNumber: 25
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/(login)/join/page.tsx",
                        lineNumber: 261,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(login)/join/page.tsx",
                lineNumber: 256,
                columnNumber: 17
            }, this),
            step === 2 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].completionCard,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$image$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        src: "/images/check.png",
                        alt: "회원가입 완료",
                        width: 80,
                        height: 80,
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].checkIcon
                    }, void 0, false, {
                        fileName: "[project]/app/(login)/join/page.tsx",
                        lineNumber: 385,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].completionMessage,
                        children: "회원가입이 완료되었습니다."
                    }, void 0, false, {
                        fileName: "[project]/app/(login)/join/page.tsx",
                        lineNumber: 392,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].completionSubtitle,
                        children: "로그인하시면 더욱 다양한 서비스와 혜택을 받으실 수 있습니다."
                    }, void 0, false, {
                        fileName: "[project]/app/(login)/join/page.tsx",
                        lineNumber: 393,
                        columnNumber: 21
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        type: "button",
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$app$2f28$login$292f$join$2f$page$2e$module$2e$css__$5b$app$2d$ssr$5d$__$28$css__module$29$__["default"].loginButton,
                        onClick: handleLoginClick,
                        children: "로그인"
                    }, void 0, false, {
                        fileName: "[project]/app/(login)/join/page.tsx",
                        lineNumber: 394,
                        columnNumber: 21
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/(login)/join/page.tsx",
                lineNumber: 384,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/(login)/join/page.tsx",
        lineNumber: 254,
        columnNumber: 9
    }, this);
}
}),
];

//# sourceMappingURL=app_%28login%29_join_d6644fa9._.js.map