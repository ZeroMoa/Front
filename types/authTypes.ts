interface UserResponseDTO {
    username: string;
    social: boolean;
    nickname: string;
    email: string;
    isLock?: boolean;
    isSocial?: boolean;
    roleType?: string;
    createdDate?: string;
    updatedDate?: string;
    isDeleted?: boolean;
    deletedAt?: string | null;
}

interface UserRequestDTO {
    username: string;
    password?: string;
    currentPassword?: string; // currentPassword 필드 추가
    nickname?: string;
    email?: string;
}

interface WithdrawSurveyRequestDTO {
    password: string;
    reasonCodes: string[];
    reasonComment?: string;
}

interface UserWithdrawRequestDTO {
    password: string;
}

interface CheckExistenceResponse {
    isExist: boolean;
}

interface FindIdRequest {
    name: string;
    email: string;
}

interface FindIdResponse {
    username: string;
    createdDate: string;
}

interface InitiatePasswordResetRequest {
    username: string;
    email: string;
}

interface InitiatePasswordResetResponse {
    resetToken: string;
}

interface ResetPasswordRequest {
    resetToken: string;
    password: string;
}

interface LoginRequest {
    username: string;
    password?: string;
    autoLogin?: boolean;
}

interface LoginResponse {
    id: string;
    username: string;
}

export type { 
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
};
