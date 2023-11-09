import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RecommendService } from './recommend.service';
import { CreateRecommendWebtoonDto, InitRecommendGenreOptionDto, RecommendWebtoonDto } from 'src/dto/recommend.dto';

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

    @Post("initWebtoonGenreEMB")
    initWebtoonGenreEMB(@Body() initRecommendGenreOptionDto: InitRecommendGenreOptionDto) {
        return this.recommendService.initWebtoonGenreEMB(initRecommendGenreOptionDto);
    }

    @Post("initWebtoonDescriptionEMB")
    initWebtoonDescriptionEMB(@Body() initRecommendGenreOptionDto: InitRecommendGenreOptionDto) {
        return this.recommendService.initWebtoonDescriptionEMB(initRecommendGenreOptionDto);
    }

    @Post("createRecommendWebtoon")
    createRecommendWebtoon(@Body() createRecommendWebtoonDto: CreateRecommendWebtoonDto) {
        return this.recommendService.createRecommendWebtoon(createRecommendWebtoonDto);
    }

    @Post("recommend-webtoon")
    recommendWebtoon(@Body() recommendWebtoonDto: RecommendWebtoonDto) {
        return this.recommendService.recommendWebtoon(recommendWebtoonDto);
    }

}
