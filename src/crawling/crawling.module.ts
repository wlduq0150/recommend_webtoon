import { Module } from '@nestjs/common';
import { CrawlingController } from './crawling.controller';
import { WebtoonModule } from 'src/webtoon/webtoon.module';
import { CrawlingService } from './crawling.service';


@Module({
  imports: [WebtoonModule],
  controllers: [CrawlingController],
  providers: [CrawlingService]
})
export class CrawlingModule {}
