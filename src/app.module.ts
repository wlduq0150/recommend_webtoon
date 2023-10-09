import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigProjectModule } from './config-project/config-project.module';
import { MysqlSequelizeModule } from './sequelize/mysql_sequelize.module';
import { CachingModule } from './caching/caching.module';
import { WebtoonModule } from './webtoon/webtoon.module';
import { UserModule } from 'src/user/user.module';

@Module({
    imports: [
      ConfigProjectModule,
      MysqlSequelizeModule.forRoot(),
      CachingModule.register(),
      UserModule,
      WebtoonModule
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
