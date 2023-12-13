import { BadRequestException, Body, Controller, Get, HttpException, InternalServerErrorException, Param, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, SignupDto } from 'src/dto/auth.dto';
import { Request, Response } from 'express';
import { JwtRefreshTokenGuard } from './guard/refreshToken.guard';
import { JwtAccessTokenGuard } from './guard/accessToken.guard';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    // access token 검증 메서드
    @UseGuards(JwtAccessTokenGuard)
    @Get("test")
    test() {
        return "ahha";
    }


    @Get("emailcheck/:email")
    async emailCheck(@Param("email") email: string) {
        try {
            const emailCheck = /^([0-9a-zA-Z_\.-]+)@([0-9a-zA-Z_-]+)(\.[0-9a-zA-Z_-]+){1,2}$/;
            if (!emailCheck.test(email)) {
                throw new BadRequestException("이메일 형식이 유효하지 않습니다");
            }

            return await this.authService.emailCheck(email);
        } catch (e) {
            if (e instanceof HttpException) {
                throw e;
            } else {
                throw new InternalServerErrorException(e.message);
            }
        }
    }

    @Post("signup")
    async signup(@Body() signupDto: SignupDto) {
        try {
            return await this.authService.signup(signupDto);
        } catch (e) {
            throw new InternalServerErrorException(e.message);
        }
    }

    @Post("login")
    async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) res: Response) {
        // access, refresh token 발급
        const tokenData = await this.authService.login(loginDto);

        // 응답 헤더에 토큰 저장
        res.setHeader("Authorization", "Bearer " + Object.values(tokenData));

        return tokenData;
    }

    @UseGuards(JwtRefreshTokenGuard)
    @Post("refresh")
    async refresh(@Req() req: any, @Res({ passthrough: true }) res: Response) {
        const userId: number = req.user?.userId;
        const refreshToken = req.user?.refreshToken;

        // 새로운 access token 발급
        const tokenData = await this.authService.refresh(userId, refreshToken);

        // 응답 헤더의 access token 설정
        res.setHeader("Authorization", "Bearer " + tokenData.accessToken);

        return tokenData;
    }

    @UseGuards(JwtRefreshTokenGuard)
    @Post("logout")
    async logout(@Req() req: any, @Res() res: Response) {
        await this.authService.logout(req.user.userId);
        return res.send(true);
    }

}
