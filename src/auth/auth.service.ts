import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LoginDto, SignupDto } from 'src/dto/auth.dto';
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

    async emailCheck(email: string) {
        const user = await this.userService.getUserByEmail(email);

        if (user) {
            return false;
        }

        return true;
    }

    async signup(signupDto: SignupDto): Promise<boolean> {
        const { password } = signupDto;
        
        // 비밀번호 암호화
        const hashPassword = await bcrypt.hash(password, 10);

        return await this.userService.createUser({
            ...signupDto,
            password: hashPassword
        });
    }

    async login(loginDto: LoginDto): Promise<TokenData> {
        // 유저 인증 및 토큰 발급
        const user = await this.validateUser(loginDto);
        const accessToken = await this.createAccessToken(user);
        const refreshToken = await this.createRefreshToken(user);

        // 유저 refresh_token 업데이트
        await this.setUserCurrentRefreshToken(
            user.id,
            refreshToken
        );

        return {
            accessToken,
            refreshToken
        };
    }

    async logout(id: number): Promise<void> {
        // DB의 currentRefreshToken 을 null로 교체
        await this.userService.updateUser({
            id,
            currentRefreshToken: null
        });
    }

    async refresh(id: number, refreshToken: string): Promise<TokenData> {
        // DB의 refresh token과 현재 토큰 비교
        const result = this.compareUserRefreshToken(id, refreshToken);
        if (!result) {
            throw new UnauthorizedException("invalid refreshToken");
        }

        // 새로운 access token 발급
        const user = await this.userService.getUserById(id);
        const accessToken = await this.createAccessToken(user);

        return {
            accessToken,
            refreshToken
        }
    }

    // 유저 id, password 확인
    async validateUser(loginDto: LoginDto): Promise<User> {
        const { email, password } = loginDto;

        const user = await this.userService.getUserByEmail(email);

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
            userId: user.id,
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
            userId: user.id
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
    async compareUserRefreshToken(id: number, refreshToken: string): Promise<boolean> {
        const user = await this.userService.getUserById(id);

        // 사용자에게 저장된 refresh token이 없으면 false 반환
        if (!user.currentRefreshToken) return false;

        console.log(refreshToken);
        console.log(user.currentRefreshToken);

        // refresh_token 비교
        const result = await bcrypt.compare(refreshToken, user.currentRefreshToken);
        if (!result) return false;

        return true;
    }

    // DB user 데이터에 refresh_token 저장
    async setUserCurrentRefreshToken(id: number, refreshToken: string): Promise<void> {
        // refresh_token 암호화
        const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        
        // 현재 날짜 시간 기준으로 토큰 만료 시간을 더함
        const now = new Date();
        const exp = parseInt(this.configService.get<string>("JWT_REFRESH_TOKEN_EXP"));
        const refreshTokenExp = new Date(now.getTime() + exp);

        // DB 업데이트
        await this.userService.updateUser({
            id,
            currentRefreshToken: hashedRefreshToken,
            currentRefreshTokenExp: refreshTokenExp
        });
    }
}
