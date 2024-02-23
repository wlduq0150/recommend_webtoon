import {
    Controller,
    Delete,
    Get,
    InternalServerErrorException,
    Param,
    Post,
    Req,
    UseGuards,
} from "@nestjs/common";
import { JwtAccessTokenGuard } from "src/auth/guard/accessToken.guard";
import { UserWebtoonService } from "./user-webtoon.service";
import { UserId } from "src/auth/decorators/userId.decorator";

@Controller("user-webtoon")
export class UserWebtoonController {
    constructor(private readonly userWebtoonService: UserWebtoonService) {}

    @UseGuards(JwtAccessTokenGuard)
    @Get(":webtoonId/checkRead")
    checkIsUserRead(@UserId() userId: number, @Param("webtoonId") webtoonId: string) {
        return this.userWebtoonService.checkIsUserRead(userId, webtoonId);
    }

    @UseGuards(JwtAccessTokenGuard)
    @Post(":webtoonId/addRead")
    addUserRead(@UserId() userId: number, @Param("webtoonId") webtoonId: string) {
        return this.userWebtoonService.addUserRead(userId, webtoonId);
    }

    @UseGuards(JwtAccessTokenGuard)
    @Delete(":webtoonId/cancleRead")
    deleteUserRead(@UserId() userId: number, @Param("webtoonId") webtoonId: string) {
        return this.userWebtoonService.deleteUserRead(userId, webtoonId);
    }
}
