import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CrawlingService } from './crawling.service';
import { UpdateWebtoonPropertyDto } from 'src/dto/crawling.dto';

@Controller('crawling')
export class CrawlingController {

    constructor(private readonly crawlingService: CrawlingService) {}

    @Get("test")
    test() {
        return this.crawlingService.test();
    }

    @Get("initWebtoon/:service")
    initWebtoon(@Param("service") service: string) {
        this.crawlingService.initWebtoon(service);
    }

    @Post("updateWebtoon")
    updateWebtoon(@Body() updateWebtoonPropertyDto: UpdateWebtoonPropertyDto) {
        this.crawlingService.updateWebtoonProperty(updateWebtoonPropertyDto);
    }

}
