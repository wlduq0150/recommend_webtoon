import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { RefreshTokenPayload } from "src/types/auth.interface";
import { AuthService } from "../auth.service";
import { JwtService } from "@nestjs/jwt";

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(Strategy, "refresh_token") {

    constructor(
        private readonly configService: ConfigService,
        private readonly authService: AuthService,
        private readonly jwtService: JwtService
    ) {
        super({
            // access token strategy와 동일
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req) => { return req.headers.authorization.replace("Bearer ", ""); }
            ]), 
            secretOrKey: configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
            ignoreExpiration: true,
            passReqToCallback: true
        });
    }

    async validate(req: Request, payload: RefreshTokenPayload) {
        try {
            const token = req.headers.authorization.replace("Bearer ", "");

            await this.jwtService.verify(token, {
                secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
            });

            req.user = {
                ...payload,
                refreshToken: token
            };
            return req.user;
        } catch (e) {
            if (e.message === "jwt expired") {
                throw new UnauthorizedException("refreshToken expired");
            }

            throw new UnauthorizedException("invalid refreshToken");
        }
    }
}