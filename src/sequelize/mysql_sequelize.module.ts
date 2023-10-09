import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserWebtoon } from './entity/userWebtoon.model';
import { Webtoon } from './entity/webtoon.model';
import { User } from './entity/user.model';
import { Sequelize } from 'sequelize-typescript';

@Module({})
export class MysqlSequelizeModule {

    constructor(private sequelize: Sequelize) {
        sequelize
            .sync()
            .then(() => {
                console.log("데이터베이스 연결 성공");
            })
            .catch(e => {
                console.error(e);
                console.log("데이터베이스 연결 실패");
            });
      }

    static forRoot(): DynamicModule {

        const sequelizeModule: DynamicModule = SequelizeModule.forRootAsync({
            useFactory: (configService: ConfigService) => ({
                dialect: 'mysql',
                host: configService.get<string>('DATABASE_HOST'), // 설정에서 host 가져오기
                port: configService.get<number>('DATABASE_PORT'), // 설정에서 port 가져오기
                username: configService.get<string>('DATABASE_USERNAME'), // 설정에서 username 가져오기
                password: configService.get<string>('DATABASE_PASSWORD'), // 설정에서 password 가져오기
                database: configService.get<string>('DATABASE_NAME'), // 설정에서 database 이름 가져오기
                models: [User, Webtoon, UserWebtoon],
                synchronize: true,
            }),
            inject: [ConfigService]
        });

        return {
            module: MysqlSequelizeModule,
            imports: [sequelizeModule],
            exports: [sequelizeModule]
        };
    }
}
