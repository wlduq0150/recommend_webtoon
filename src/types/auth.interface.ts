
export interface TokenData {
    accessToken: string;
    refreshToken: string;
}

export interface AccessTokenPayload {
    userId: string;
    name: string;
    age: string;
    sex: string;
}

export interface RefreshTokenPayload {
    userId: string;
}