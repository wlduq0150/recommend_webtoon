import { DynamicModule, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

const configModule: DynamicModule = ConfigModule.forRoot({
    envFilePath: `.${process.env.NODE_ENV}.env`,
    isGlobal: true,
});

@Module({
    imports: [configModule],
})
export class ConfigProjectModule {}
