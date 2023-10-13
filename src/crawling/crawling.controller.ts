import { Controller, Get } from '@nestjs/common';
import { CrawlingService } from './crawling.service';

@Controller('crawling')
export class CrawlingController {

    constructor(private readonly crawlingService: CrawlingService) {}

    @Get("test")
    test() {
        return this.crawlingService.test();
    }

}
