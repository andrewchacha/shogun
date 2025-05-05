export const ApiStatus = {
    Success: 200,
    BadRequest: 400,
    Unauthorized: 401,

    ErrorAccessTokenExpired: 4000,
    ErrorUserNotFound: 4001,
    ErrorUpdateUsernameBlocked: 4002,
    ErrorUpdateNameBlocked: 4003,
};

export interface ApiRes<T> {
    data?: T;
    status: number;
    error?: string;
}

export interface ApiError {
    status: number;
    error?: string;
}

export type ApiSuccess = {
    success: boolean;
};
