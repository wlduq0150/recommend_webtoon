import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AccessTokenPayload } from "src/types/auth.interface";

@Injectable()
export class JwtAccessTokenStrategy extends PassportStrategy(Strategy, "access_token") {
    constructor(
        private readonly configService: ConfigService,
        private readonly jwtService: JwtService,
    ) {
        super({
            // request의 쿠키에서 access token을 가져옴
            jwtFromRequest: ExtractJwt.fromExtractors([
                (req) => {
                    return req.headers.authorization.replace("Bearer ", "");
                }
            ]),
            // access toke  n secret key
            secretOrKey: configService.get<string>("JWT_ACCESS_TOKEN_SECRET"),
            // 만료된 토큰도 통과(예외 처리를 위해)
            ignoreExpiration: true,
            // validate 함수에 첫번째 인자에 request를 넘겨줌
            passReqToCallback: true,
        });
    }

    async validate(req: Request, payload: AccessTokenPayload) {
        try {
            const token = req.headers.authorization.replace("Bearer ", "");

            await this.jwtService.verify(token, {
                secret: this.configService.get<string>("JWT_ACCESS_TOKEN_SECRET"),
            });

            // request에 저장을 해놔야 Guard후에 controller 메서드에서 사용 가능
            req.user = payload;
            return payload;
        } catch (e) {
            if (e.message === "jwt expired") {
                throw new UnauthorizedException("accessToken expired");
            }

            throw new UnauthorizedException("invalid accessToken");
        }
    }
}
