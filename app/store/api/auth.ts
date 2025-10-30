import Cookies from 'js-cookie';
import {
    UserResponseDTO,
    UserRequestDTO,
    WithdrawSurveyRequestDTO,
    UserWithdrawRequestDTO,
    CheckExistenceResponse,
    FindIdRequest,
    FindIdResponse,
    InitiatePasswordResetRequest,
    InitiatePasswordResetResponse,
    ResetPasswordRequest,
    LoginRequest,
    LoginResponse
} from '../../../types/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Helper function for fetching with XSRF token and Authorization header
const fetchWithAuth = async (url: string, options: RequestInit = {}, retried = false): Promise<Response> => {
    const xsrfToken = Cookies.get('XSRF-TOKEN');
    // const accessToken = localStorage.getItem('accessToken'); // HttpOnly: false인 Access Token을 가져옴

    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(xsrfToken && { 'X-XSRF-TOKEN': xsrfToken }),
        // ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }), // Access Token 추가
        ...options.headers,
    };

    let response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers,
        credentials: 'include', // HttpOnly 리프레시 토큰 자동 전송을 위해 유지
    });

    // 401 Unauthorized 응답을 받았고, 아직 재시도하지 않은 경우
    if (response.status === 401 && !retried) {
        console.warn('액세스 토큰 만료 또는 유효하지 않음. 리프레시 토큰으로 재발급 시도.');
        try {
            // HttpOnly 리프레시 토큰은 브라우저가 자동으로 포함하여 백엔드로 전송합니다.
            const refreshResponse = await fetch(`${API_BASE_URL}/jwt/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                // HttpOnly 리프레시 토큰은 브라우저가 'credentials: include' 설정에 따라 자동으로 쿠키에 포함하여 전송합니다.
                credentials: 'include',
            });

            if (refreshResponse.ok) {
                // 백엔드에서 Set-Cookie 헤더를 통해 새로운 Access Token (HttpOnly: false) 및 Refresh Token (HttpOnly: true)을 전달합니다.
                // HttpOnly: false인 Access Token은 브라우저가 Set-Cookie 헤더를 통해 자동으로 처리하므로,
                // 여기서 JSON 응답 본문을 파싱하여 localStorage에 따로 저장할 필요가 없습니다.
                // 백엔드에서 HttpOnly: false로 Access Token을 설정한다면, 브라우저가 자동으로 Authorization 헤더에 추가할 수 있도록 관리합니다.
                
                console.log('액세스 토큰 재발급 성공. 원래 요청을 재시도합니다.');
                // 새로운 액세스 토큰으로 원래 요청을 재시도합니다. (retried 플래그 true)
                response = await fetchWithAuth(url, options, true);
            } else {
                let errorData: { message?: string } = {};
                try {
                    errorData = await refreshResponse.json();
                } catch (e) {
                    errorData.message = '리프레시 토큰 만료 또는 유효하지 않음.';
                }
                console.error('리프레시 토큰 재발급 실패:', errorData.message || '알 수 없는 오류');
                throw new Error(errorData.message || '리프레시 토큰이 만료되었거나 유효하지 않습니다. 다시 로그인하십시오.');
            }
        } catch (error) {
            console.error('토큰 재발급 중 오류 발생:', error);
            throw error;
        }
    } else if (response.status === 401 && retried) {
        let errorData: { message?: string } = {};
        try {
            errorData = await response.json();
        } catch (e) {
            errorData.message = '액세스 토큰 재발급 후에도 인증되지 않았습니다.';
        }
        console.error('액세스 토큰 재발급 후에도 401 에러가 발생했습니다. 다시 로그인하십시오.');
        throw new Error(errorData.message || '토큰 재발급 후에도 인증되지 않았습니다.');
    }

    // 최종 응답이 성공적이지 않으면 오류를 던집니다. (리프레시 토큰 처리 후)
    if (!response.ok) {
        let errorData: { message?: string, status?: string } = {};
        try {
            errorData = await response.json();
        } catch (e) {
            // JSON 파싱 실패 시, text()로 Fallback (백엔드 오류 메시지 예외 처리)
            errorData.message = await response.text().catch(() => '알 수 없는 오류');
        }

        const errorMessage = errorData.message || `API 요청 실패: ${response.status} ${response.statusText}`;

        // 사용자 명세에 따른 401, 403 에러 메시지 처리
        if (response.status === 401) {
            // 백엔드 명세: "액세스 토큰이 없습니다. 로그인해주세요." 또는 "액세스 토큰이 만료되었습니다. 다시 로그인해주세요."
            if (errorMessage.includes("액세스 토큰이 없습니다.") || errorMessage.includes("액세스 토큰이 만료되었습니다.")) {
                throw new Error(errorMessage);
            }
        } else if (response.status === 403) {
            // 백엔드 명세: "탈퇴한 회원입니다. 다시 로그인 해주세요."
            if (errorMessage.includes("탈퇴한 회원입니다.")) {
                // 기존 localStorage에 남아있을 수 있는 accessToken 제거 (안전성 강화)
                localStorage.removeItem('accessToken');
                throw new Error('탈퇴한 회원입니다. 자동으로 로그아웃 처리됩니다.');
            } else if (errorMessage.includes("비밀번호가 일치하지 않습니다.")) { // 회원 탈퇴 시 발생할 수 있는 403
                throw new Error(errorMessage);
            }
        }
        // 그 외 모든 오류는 그대로 던집니다.
        throw new Error(errorMessage);
    }

    return response;
};

// 1. GET /user (사용자 정보 가져오기)
export const getUserData = async (): Promise<UserResponseDTO> => {
    const response = await fetchWithAuth('/user', { method: 'GET' });
    return response.json();
};

// 2. POST /user/check-password (현재 비밀번호 확인)
export const checkCurrentPassword = async (password: string): Promise<boolean> => {
    const response = await fetchWithAuth('/user/check-password', {
        method: 'POST',
        body: JSON.stringify({ password }),
    });
    const result = await response.json(); // API 명세에 따라 boolean 값 반환
    return result;
};

// 3. PUT /user (사용자 정보 수정)
export const updateUserProfile = async (data: UserRequestDTO): Promise<UserResponseDTO> => {
    const response = await fetchWithAuth('/user', {
        method: 'PUT',
        body: JSON.stringify(data),
    });
    return response.json();
};

// 4. POST /user/exist (아이디/이메일 중복 확인)
export const checkExistence = async (field: 'username' | 'email', value: string): Promise<CheckExistenceResponse> => {
    try {
        const apiPath = field === 'username' ? '/user/exist' : '/user/exist-email';
        const response = await fetch(`${API_BASE_URL}${apiPath}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ [field]: value }),
            credentials: 'include',
        });

        if (!response.ok) {
            let errorData: { message?: string } = {};
            try {
                errorData = await response.json();
            } catch (e) {
                errorData.message = response.statusText || '존재 여부 확인 실패: 서버 응답 오류';
            }
            // 백엔드 명세에 따라 409는 별도 메시지로 처리될 수 있음.
            if (response.status === 409 || (errorData.message && errorData.message.includes('이미 사용 중인 이메일입니다.'))) {
                return { isExist: true };
            }
            throw new Error(errorData.message || '존재 여부 확인에 실패했습니다.');
        }
        // 오류를 던지지 않으면 중복이 아님
        return { isExist: false };
    } catch (error: any) {
        // 기타 네트워크 오류 등은 여기서 처리
        throw error;
    }
};

// 5. POST /user (회원가입)
export const joinUser = async (data: UserRequestDTO): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/user`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
    });

    if (!response.ok) {
        let errorData: { message?: string } = {};
        try {
            errorData = await response.json();
        } catch (e) {
            errorData.message = response.statusText || '회원가입 실패: 서버 응답 오류';
        }
        throw new Error(errorData.message || '회원가입에 실패했습니다.');
    }
    return response.json();
};

// 6. POST /survey/withdraw (탈퇴 설문조사)
export const submitWithdrawSurvey = async (data: WithdrawSurveyRequestDTO): Promise<string> => {
    const response = await fetchWithAuth('/survey/withdraw', {
        method: 'POST',
        body: JSON.stringify(data),
    });
    return response.text();
};

// 7. DELETE /user (회원 탈퇴)
export const withdrawUser = async (data: UserWithdrawRequestDTO): Promise<string> => {
    const response = await fetchWithAuth('/user', {
        method: 'DELETE',
        body: JSON.stringify(data),
    });
    return response.text();
};

// 8. POST /user/find-id (아이디 찾기)
export const findUserId = async (data: FindIdRequest): Promise<FindIdResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/user/find-id`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include',
        });

        if (!response.ok) {
            let errorData: { message?: string } = {};
            try {
                errorData = await response.json();
            } catch (e) {
                errorData.message = response.statusText || '아이디 찾기 실패: 서버 응답 오류';
            }
            throw new Error(errorData.message || '아이디 찾기에 실패했습니다.');
        }
        return response.json();
    } catch (error: any) {
        // 백엔드 명세: 404 Not Found에 대해 특정 메시지
        if (error.message.includes('가입 시 입력하신 회원 정보가 맞는지 다시 한번 확인해 주세요.')) {
            throw new Error(error.message);
        }
        throw error;
    }
};

// 9. POST /user/initiate-password-reset (비밀번호 재설정 시작)
export const initiatePasswordReset = async (data: InitiatePasswordResetRequest): Promise<InitiatePasswordResetResponse> => {
    try {
        const response = await fetch(`${API_BASE_URL}/user/initiate-password-reset`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include',
        });

        if (!response.ok) {
            let errorData: { message?: string } = {};
            try {
                errorData = await response.json();
            } catch (e) {
                errorData.message = response.statusText || '비밀번호 재설정 시작 실패: 서버 응답 오류';
            }
            throw new Error(errorData.message || '비밀번호 재설정 시작에 실패했습니다.');
        }
        return response.json();
    } catch (error: any) {
        // 백엔드 명세: 404 Not Found에 대해 특정 메시지
        if (error.message.includes('가입 시 입력하신 회원 정보가 맞는지 다시 한번 확인해 주세요.')) {
            throw new Error(error.message);
        }
        throw error;
    }
};

// 10. POST /user/reset-password (비밀번호 재설정 완료)
export const resetUserPassword = async (data: ResetPasswordRequest): Promise<any> => {
    try {
        const response = await fetch(`${API_BASE_URL}/user/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include',
        });

        if (!response.ok) {
            let errorData: { message?: string } = {};
            try {
                errorData = await response.json();
            } catch (e) {
                errorData.message = response.statusText || '비밀번호 재설정 실패: 서버 응답 오류';
            }
            throw new Error(errorData.message || '비밀번호 재설정에 실패했습니다.');
        }
        return response.json();
    } catch (error: any) {
        // 백엔드 명세: 400 Bad Request에 대해 특정 메시지
        if (error.message.includes('유효하지 않거나 만료된 토큰이거나, 비밀번호 정책에 맞지 않습니다.')) {
            throw new Error(error.message);
        }
        throw error;
    }
};

// 11. POST /login (로그인)
export const loginUser = async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        credentials: 'include',
    });

    if (!response.ok) {
        let errorData: { message?: string } = {};
        try {
            errorData = await response.json();
        } catch (e) {
            errorData.message = response.statusText || '로그인 실패: 서버 응답 오류';
        }
        throw new Error(errorData.message || '로그인에 실패했습니다.');
    }
    return response.json();
};
