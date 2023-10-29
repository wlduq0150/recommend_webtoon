import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RecommendService } from './recommend.service';
import { InitRecommendGenreOptionDto } from 'src/dto/recommend.dto';

@Controller('recommend')
export class RecommendController {

    constructor(private readonly recommendService: RecommendService) {}

    @Get("recommendGenre/:id")
    recommendGenre(@Param("id") id: string) {
        return this.recommendService.createRecommendGenre(id);
    }

    @Post("initWebtoonRecommendGenre")
    initWebtoonRecommendGenre(@Body() initRecommendGenreOptionDto: InitRecommendGenreOptionDto) {
        return this.recommendService.initWebtoonRecommendGenre(initRecommendGenreOptionDto);
    }

}
