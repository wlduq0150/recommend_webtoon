import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigProjectModule } from './config-project/config-project.module';
import { MysqlSequelizeModule } from './sequelize/mysql_sequelize.module';
import { CachingModule } from './caching/caching.module';
import { WebtoonModule } from './webtoon/webtoon.module';
import { UserModule } from 'src/user/user.module';
import { DtoFilterProvider } from './custom-provider/filter.provider';
import { AuthModule } from './auth/auth.module';
import { CrawlingModule } from './crawling/crawling.module';
import { OpenaiModule } from './openai/openai.module';
import { GenreModule } from './genre/genre.module';
import { RecommendModule } from './recommend/recommend.module';

@Module({
    imports: [
      ConfigProjectModule,
      MysqlSequelizeModule.forRoot(),
      CachingModule.register(),
      UserModule,
      WebtoonModule,
      AuthModule,
      CrawlingModule,
      OpenaiModule,
      GenreModule,
      RecommendModule
    ],
    controllers: [AppController],
    providers: [AppService, DtoFilterProvider],
})
export class AppModule {}
