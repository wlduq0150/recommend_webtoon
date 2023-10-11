import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { RefreshTokenPayload } from "src/types/auth.type";
import { AuthService } from "../auth.service";

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, "refresh_token") {

    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
    ) {
        super({
            // access token strategy와 동일
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request) => { return request?.cookies?.refresh_token }
            ]), 
            secretOrKey: configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
            ignoreExpiration: false,
            passReqToCallback: true
        });
    }

    async validate(req: Request, payload: RefreshTokenPayload) {
        const refreshToken = req?.cookies?.refresh_token;

        // refresh token이 없을 경우 예외 발생
        if (!refreshToken) {
            throw new UnauthorizedException("refresh token is undefined");
        }

        // 저장된 refresh token과 비교
        const result = await this.authService.compareUserRefreshToken(
            payload.userId,
            refreshToken
        );
        // 결과가 틀렸다면 예외 발생
        if (!result) {
            throw new UnauthorizedException("refresh token is wrong");
        }
        req.user = payload;

        return payload;
    }
}