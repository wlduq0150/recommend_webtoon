import {
    Controller,
    Get,
    InternalServerErrorException,
    Param,
    Post,
    Req,
    UseGuards,
} from "@nestjs/common";
import { JwtAccessTokenGuard } from "src/auth/guard/accessToken.guard";
import { UserWebtoonService } from "./user-webtoon.service";

@Controller("user-webtoon")
export class UserWebtoonController {

    constructor(private readonly userWebtoonService: UserWebtoonService) {}

    @UseGuards(JwtAccessTokenGuard)
    @Get(":webtoonId/checkRead")
    checkIsUserRead(@Req() req, @Param("webtoonId") webtoonId: string) {
        const userId = req.user.userId;
        return this.userWebtoonService.checkIsUserRead(userId, webtoonId);
    }

    @UseGuards(JwtAccessTokenGuard)
    @Post(":webtoonId/addRead")
    addUserRead(@Req() req, @Param("webtoonId") webtoonId: string) {
        const userId = req.user.userId;
        return this.userWebtoonService.addUserRead(userId, webtoonId);
    }

}
