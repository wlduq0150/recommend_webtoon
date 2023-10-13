import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from 'src/dto/auth.dto';
import { User } from 'src/sequelize/entity/user.model';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { TokenData } from 'src/types/auth.interface';

import * as bcrypt from "bcrypt";


@Injectable()
export class AuthService {

    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
    ) {}

    async login(loginDto: LoginDto): Promise<TokenData> {
        // 유저 인증 및 토큰 발급
        const user = await this.validateUser(loginDto);
        const accessToken = await this.createAccessToken(user);
        const refreshToken = await this.createRefreshToken(user);

        // 유저 refresh_token 업데이트
        await this.setUserCurrentRefreshToken(
            user.userId,
            refreshToken
        );

        return {
            accessToken,
            refreshToken
        };
    }

    async logout(userId: string): Promise<void> {
        // DB의 currentRefreshToken 을 null로 교체
        await this.userService.updateUser({
            userId,
            currentRefreshToken: null
        });
    }

    async refresh(userId: string, refreshToken: string): Promise<TokenData> {
        // DB의 refresh token과 현재 토큰 비교
        const result = this.compareUserRefreshToken(userId, refreshToken);
        if (!result) {
            throw new UnauthorizedException("You need to log in first");
        }

        // 새로운 access token 발급
        const user = await this.userService.getUser(userId);
        const accessToken = await this.createAccessToken(user);

        return {
            accessToken,
            refreshToken
        }
    }

    // 유저 id, password 확인
    async validateUser(loginDto: LoginDto): Promise<User> {
        const { userId, password } = loginDto;

        const user = await this.userService.getUser(userId);

        // 비밀번호 비교
        const comparePassword = await bcrypt.compare(password, user.password);
        if (!comparePassword) {
            throw new UnauthorizedException("password is wrong");
        }

        return user;
    }

    // access_token 발급
    async createAccessToken(user: User): Promise<string> {
        const payload = {
            userId: user.userId,
            name: user.name,
            age: user.age,
            sex: user.sex
        };

        const access_token = await this.jwtService.signAsync(
            payload,
            {
                secret: this.configService.get<string>("JWT_ACCESS_TOKEN_SECRET"),
                expiresIn: parseInt(this.configService.get<string>("JWT_ACCESS_TOKEN_EXP"))
            }
        );  

        return access_token;
    }

    // refresh_token 발급
    async createRefreshToken(user: User): Promise<string> {
        const payload = {
            userId: user.userId
        };

        const refreshToken = await this.jwtService.signAsync(
            payload,
            {
                secret: this.configService.get<string>("JWT_REFRESH_TOKEN_SECRET"),
                expiresIn: parseInt(this.configService.get<string>("JWT_REFRESH_TOKEN_EXP"))
            }
        );

        return refreshToken;
    }

    // DB의 refresh_token과 현재 refresh_token 비교
    async compareUserRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
        const user = await this.userService.getUser(userId);

        // 사용자에게 저장된 refresh token이 없으면 false 반환
        if (!user.currentRefreshToken) return false;

        // refresh_token 비교
        const result = await bcrypt.compare(refreshToken, user.currentRefreshToken);
        if (!result) return false;

        return true;
    }

    // DB user 데이터에 refresh_token 저장
    async setUserCurrentRefreshToken(userId: string, refreshToken: string): Promise<void> {
        // refresh_token 암호화
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        
        // 현재 날짜 시간 기준으로 토큰 만료 시간을 더함
        const now = new Date();
        const exp = parseInt(this.configService.get<string>("JWT_REFRESH_TOKEN_EXP"));
        const refreshTokenExp = new Date(now.getTime() + exp);

        // DB 업데이트
        await this.userService.updateUser({
            userId,
            currentRefreshToken: hashedRefreshToken,
            currentRefreshTokenExp: refreshTokenExp
        });
    }
}
