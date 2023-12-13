import {
    Controller,
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
    @Post(":webtoonId/checkRead")
    checkUserRead(@Req() req, @Param("webtoonId") webtoonId: string) {
        try {
            const userId = req.user.userId;
            return this.userWebtoonService.checkUserRead(userId, webtoonId);
        } catch (e) {
            if (!e.status) {
                console.log(e);
                throw new InternalServerErrorException("예기치 않은 에러입니다.");
            }
        }
    }
}
