import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Cache } from "cache-manager";
import { UserCacheTTL, UserReadCacheTTL } from "src/constatns/cache.constants";
import { CreateUserDataDto, UpdateUserDataDto } from "src/dto/user.dto";
import { User } from "src/sequelize/entity/user.model";
import { Webtoon } from "src/sequelize/entity/webtoon.model";

@Injectable()
export class UserService {
    constructor(
        @Inject("USER") private readonly userModel: typeof User,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    ) {}

    async getUserById(id: number): Promise<User> {
        const userCacheKey: string = `userCache-id${id}`;

        const userCache: string = await this.cacheManager.get(userCacheKey);
        if (userCache) {
            const userInfo = JSON.parse(userCache) as User;
            return userInfo;
        }

        // currentRefreshToken을 제외한 사용자 정보를 id를 통해 가져오기
        const exUser: User = await this.userModel.findOne({
            where: { id },
        });
        // 사용자가 없다면 에러 throw
        if (!exUser) {
            throw new NotFoundException(`userId ${id} is not exist.`);
        }

        await this.cacheManager.set(userCacheKey, JSON.stringify(exUser), UserCacheTTL);

        return exUser;
    }

    async getUserByEmail(email: string): Promise<User> {
        // currentRefreshToken을 제외한 사용자 정보를 email을 통해 가져오기
        const exUser: User = await this.userModel.findOne({
            where: { email },
        });

        return exUser;
    }

    async getUserReadWebtoonIds(userId: number): Promise<string[]> {
        const exUser: User = await this.userModel.findOne({
            where: { id: userId },
            include: {
                model: Webtoon,
                attributes: ["id"],
            },
        });

        // 웹툰 목록을 id 배열로 바꾸기
        const readwebtoonIds: string[] = exUser.readWebtoons.map((webtoon) => {
            return webtoon.id;
        });

        return readwebtoonIds;
    }

    async createUser(createUserData: CreateUserDataDto): Promise<boolean> {
        const { email, password } = createUserData;

        const exUser = await this.getUserByEmail(email);
        if (exUser) {
            throw new ConflictException(`userId ${email} is already exist.`);
        }

        await this.userModel.create({
            ...createUserData, // 데이터베이스에는 암호환된 비밀번호 저장
        });

        console.log(`[Info]userId ${email} is created.`);

        return true;
    }

    async deleteUser(id: number): Promise<boolean> {
        await this.getUserById(id);

        await this.userModel.destroy({
            where: { id },
        });

        const userCacheKey: string = `userCache-id${id}`;
        await this.cacheManager.del(userCacheKey);

        console.log(`[Info]userId ${id} is removed.`);

        return true;
    }

    async updateUser(updateUserData: UpdateUserDataDto): Promise<boolean> {
        const { id }: { id: number } = updateUserData;
        await this.getUserById(id);

        // updateUserData의 있는 변경된 사항들만 update
        this.userModel.update(
            {
                ...updateUserData,
            },
            {
                where: { id },
            },
        );

        const userCacheKey: string = `userCache-id${id}`;
        await this.cacheManager.del(userCacheKey);

        console.log(`[Info]userId ${id} is changed.`);

        return true;
    }
}
