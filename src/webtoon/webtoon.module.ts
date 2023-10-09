import { Module } from '@nestjs/common';
import { WebtoonController } from './webtoon.controller';
import { WebtoonService } from './webtoon.service';
import { webtoonProvider } from 'src/custom-provider/model.provider';
import { SequelizeModule } from '@nestjs/sequelize';
import { Webtoon } from 'src/sequelize/entity/webtoon.model';

@Module({
    imports: [SequelizeModule.forFeature([Webtoon])],
    exports: [WebtoonService, webtoonProvider],
    controllers: [WebtoonController],
    providers: [WebtoonService, webtoonProvider],
})
export class WebtoonModule {}
