import { CacheModule } from '@nestjs/cache-manager';
import { DynamicModule, Module, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import * as Redis from "cache-manager-ioredis";

@Module({})
export class CachingModule {

    static register(): DynamicModule {

        const cacheModule: DynamicModule = CacheModule.registerAsync({
            isGlobal: true,
            useFactory: async (configService: ConfigService) => ({
                stroe: Redis,
                host: configService.get<string>("REDIS_HOST"),
                port: configService.get<string>("REDIS_PORT"),
                password: configService.get<string>("REDIS_PASSWORD")
            }),
            inject: [ConfigService]
        });
        

        return {
            module: CachingModule,
            imports: [cacheModule],
            exports: [cacheModule],
        }
    }
}
