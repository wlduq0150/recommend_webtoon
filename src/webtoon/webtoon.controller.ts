import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { WebtoonService } from './webtoon.service';
import { CreateFineTunePrompt, InsertWebtoonDto, UpdateWebtoonDto } from 'src/dto/webtoon.dto';

@Controller('webtoon')
export class WebtoonController {

    constructor(private webtoonService: WebtoonService) {}

    @Get("content/:id")
    getWebtoon(@Param("id") webtoonId: string) {
        return this.webtoonService.getWebtoonForId(webtoonId);
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
