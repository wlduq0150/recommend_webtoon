
export interface TokenData {
    userId?: number;
    accessToken?: string;
    refreshToken?: string;
}

export interface AccessTokenPayload {
    userId: number;
    name: string;
    age: string;
    sex: string;
}

export interface RefreshTokenPayload {
    userId: number;
}