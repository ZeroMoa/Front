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
} from '../../../../types/authTypes';
import { fetchWithAuth } from '../../../../lib/common/api/fetchWithAuth';

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

type HttpError = Error & { status?: number };

const ensureApiBaseUrl = () => {
    if (!API_BASE_URL) {
        throw new Error('API 기본 경로가 설정되지 않았습니다.');
    }
};

const buildJsonHeaders = (headers?: HeadersInit): HeadersInit => {
    const merged = new Headers(headers ?? {});
    if (!merged.has('Content-Type')) {
        merged.set('Content-Type', 'application/json');
    }
    return merged;
};

const extractErrorMessage = async (response: Response): Promise<string | null> => {
    try {
        const cloned = response.clone();
        const data = await cloned.json();
        if (data && typeof data === 'object' && 'message' in data) {
            return (data as { message?: string }).message ?? null;
        }
    } catch {
        // ignore json parse failure
    }

    try {
        const text = await response.text();
        if (text) {
            return text;
        }
    } catch {
        // ignore text parse failure
    }

    return null;
};

const createUnauthorizedError = (status: number): HttpError => {
    const error = new Error(`${status} Unauthorized`) as HttpError;
    error.status = status;
    return error;
};

// 1. GET /user/me (사용자 정보 가져오기)
export const getUserData = async (): Promise<UserResponseDTO> => {
    ensureApiBaseUrl();

    const requestUser = () =>
        fetch(`${API_BASE_URL}/user/me`, {
            method: 'GET',
            headers: buildJsonHeaders(),
            credentials: 'include',
            cache: 'no-store',
        });

    let response = await requestUser();

    if (response.status === 401 || response.status === 403) {
        const refreshResponse = await fetch(`${API_BASE_URL}/jwt/refresh`, {
            method: 'POST',
            headers: buildJsonHeaders(),
            credentials: 'include',
        });

        if (!refreshResponse.ok) {
            throw createUnauthorizedError(refreshResponse.status);
        }

        response = await requestUser();
    }

    if (response.status === 401 || response.status === 403) {
        throw createUnauthorizedError(response.status);
    }

    if (!response.ok) {
        const message = (await extractErrorMessage(response)) ?? '사용자 정보를 불러오지 못했습니다.';
        throw new Error(message);
    }

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
        const text = await response.text();
        return { message: text };
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
