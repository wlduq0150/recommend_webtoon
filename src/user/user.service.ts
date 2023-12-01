import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { UserCacheTTL, UserReadCacheTTL } from 'src/constatns/cache.constants';
import { CreateUserDataDto, UpdateUserDataDto } from 'src/dto/user.dto';
import { User } from 'src/sequelize/entity/user.model';
import { Webtoon } from 'src/sequelize/entity/webtoon.model';

import * as bcrypt from "bcrypt";

@Injectable()
export class UserService {

    constructor(
        @Inject("USER") private readonly userModel: typeof User,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
    ) {}

    async getUser(email: string): Promise<User> {
        const userCacheKey: string = `userCache-${email}`;

        const userCache: string = await this.cacheManager.get(userCacheKey);
        if (userCache) {
            const userInfo = JSON.parse(userCache) as User;
            return userInfo;
        }

        // currentRefreshToken을 제외한 사용자 정보를 id를 통해 가져오기
        const exUser: User = await this.userModel.findOne({
            where: { email },
        });
        // 사용자가 없다면 에러 throw
        if (!exUser) { 
            throw new NotFoundException(`userId ${email} is not exist.`);
        }

        await this.cacheManager.set(
            userCacheKey,
            JSON.stringify(exUser),
            UserCacheTTL
        );
        
        return exUser;
    }

    async getUserReadWebtoonIds(userId: string): Promise<string[]> {
        const userReadCacheKey: string = `userReadCache-${userId}`;

        const userReadCache: string = await this.cacheManager.get(userReadCacheKey);
        if (userReadCache) {
            return JSON.parse(userReadCache);
        }

        const exUser: User = await this.getUser(userId);

        // 사용자가 이미 읽은 웹툰 목록 
        const readWebtoons: Webtoon[] = await exUser.$get("readWebtoons", {
            attributes: ["webtoonId"],
        });

        // 웹툰 목록을 id 배열로 바꾸기
        const readwebtoonIds: string[] = readWebtoons.map((webtoon) => {
            return webtoon.id;
        });

        await this.cacheManager.set(
            userReadCacheKey,
            JSON.stringify(readwebtoonIds),
            UserReadCacheTTL,
        );

        return readwebtoonIds;
    }

    async createUser(createUserData: CreateUserDataDto): Promise<boolean> {
        const { email, password } = createUserData;
        // 비밀번호 암호화
        const hashPassword = await bcrypt.hash(password, 10);

        const exUser = await this.userModel.findOne({ where: { email } });
        if (exUser) {
            throw new ConflictException(`userId ${email} is already exist.`);
        }

        await this.userModel.create({
            ...createUserData,
            password: hashPassword, // 데이터베이스에는 암호환된 비밀번호 저장
        });
        
        console.log(`[Info]userId ${email} is created.`);

        return true;
    }

    async deleteUser(email: string): Promise<boolean> {
        await this.getUser(email);

        await this.userModel.destroy({
            where: { email },
        });

        const userCacheKey: string = `userCache-${email}`;
        await this.cacheManager.del(userCacheKey);

        console.log(`[Info]userId ${email} is removed.`);

        return true;
    }

    async updateUser(updateUserData: UpdateUserDataDto): Promise<boolean> {
        const { email }: { email: string } = updateUserData;
        await this.getUser(email);

        // updateUserData의 있는 변경된 사항들만 update
        this.userModel.update({
            ...updateUserData,
        }, {
            where: { email },
        });

        const userCacheKey: string = `userCache-${email}`;
        await this.cacheManager.del(userCacheKey);

        console.log(`[Info]userId ${email} is changed.`);

        return true;
    }
}
