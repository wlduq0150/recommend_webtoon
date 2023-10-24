import { Module } from '@nestjs/common';
import { GenreController } from './genre.controller';
import { GenreService } from './genre.service';
import { WebtoonModule } from 'src/webtoon/webtoon.module';
import { OpenaiModule } from 'src/openai/openai.module';
import { GenreProvider } from 'src/custom-provider/model.provider';

@Module({
  imports: [WebtoonModule, OpenaiModule],
  controllers: [GenreController],
  providers: [GenreService, GenreProvider]
})
export class GenreModule {}