import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { UserWebtoon } from "src/sequelize/entity/userWebtoon.model";
import { UserService } from "src/user/user.service";
import { WebtoonService } from "src/webtoon/webtoon.service";

@Injectable()
export class UserWebtoonService {

    constructor(
        @Inject("USERWEBTOON")
        private readonly userWebtoonModel: typeof UserWebtoon,

        private readonly userService: UserService,

        private readonly webtoonService: WebtoonService
    ) {}

    async checkIsUserRead(userId: number, webtoonId: string) {
        const user_webtoon = await this.userWebtoonModel.findOne({
            where: { userId, webtoonId },
        });

        if (!user_webtoon) {
            return false;
        }

        return true;
    }

    async addUserRead(userId: number, webtoonId: string) {
        const user = await this.userService.getUserById(userId);
        const webtoon = await this.webtoonService.getWebtoonForId(webtoonId);

        if (!user || !webtoon) {
            throw new NotFoundException("존재하지 않는 사용자 혹은 웹툰입니다.");
        }

        await this.userWebtoonModel.create({
            userId,
            webtoonId
        });

        return true;
    }
}
