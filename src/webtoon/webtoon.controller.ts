import {
    Body,
    Controller,
    Delete,
    Get,
    InternalServerErrorException,
    Param,
    Patch,
    Post,
    Req,
    UseGuards,
} from "@nestjs/common";
import { WebtoonService } from "./webtoon.service";
import { JwtAccessTokenGuard } from "src/auth/guard/accessToken.guard";
import { InsertWebtoonDto } from "./dto/insert-webtoon.dto";
import { UpdateWebtoonDto } from "./dto/update-webtoon.dto";
import { CreateFineTunePrompt } from "./dto/finetuning-prompt.dto";
import { UserId } from "src/auth/decorators/userId.decorator";

@Controller("webtoon")
export class WebtoonController {
    constructor(private webtoonService: WebtoonService) {}

    @Get(":id/content")
    getWebtoon(@Param("id") webtoonId: string) {
        return this.webtoonService.getWebtoonForId(webtoonId);
    }

    @UseGuards(JwtAccessTokenGuard)
    @Get(":id/content")
    getIsUserWebtoonRead(@Param("id") webtoonId: string, @UserId() userId: number) {
        return this.webtoonService.getIsUserWebtoonRead(webtoonId, userId);
    }

    @Get("day/:day")
    getAllWebtoonForDay(@Param("day") day: string) {
        return this.webtoonService.getAllWebtoonForDay(day);
    }

    @Get("finished")
    getAllFinishedWebtoon() {
        return this.webtoonService.getAllFinishedWebtoon();
    }

    @Post("insertWebtoon")
    insertWebtoon(@Body() insertWebtoonDto: InsertWebtoonDto) {
        return this.webtoonService.insertWebtoon(insertWebtoonDto);
    }

    @Post("createFineTunePrompt")
    createFineTunePrompt(@Body() createFineTunePrompt: CreateFineTunePrompt) {
        return this.webtoonService.createFineTuningData(createFineTunePrompt);
    }

    @Patch("updateWebtoon")
    updateWebtoon(@Body() updateWebtoonDto: UpdateWebtoonDto) {
        return this.webtoonService.updateWebtoonForOption(updateWebtoonDto);
    }

    @Delete("deleteWebtoon/:id")
    deleteWebtoon(@Param("id") webtoonId: string) {
        return this.webtoonService.deleteWebtoon(webtoonId);
    }
}
