import { Module } from '@nestjs/common';
import { RecommendController } from './recommend.controller';
import { RecommendService } from './recommend.service';
import { UserModule } from 'src/user/user.module';
import { WebtoonModule } from 'src/webtoon/webtoon.module';
import { OpenaiModule } from 'src/openai/openai.module';
import { GenreModule } from 'src/genre/genre.module';

@Module({
  imports: [UserModule, WebtoonModule, GenreModule, OpenaiModule],
  controllers: [RecommendController],
  providers: [RecommendService]
})
export class RecommendModule {}
