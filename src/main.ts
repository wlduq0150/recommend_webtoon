import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from "cookie-parser";
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Cors 활성화
    app.enableCors({
        origin: true, //여기에 url을 넣어도된다.
        credentials: true,
    });

    // ValidationPipe - global
    app.useGlobalPipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
        }),
    );

    // Swagger
    const config = new DocumentBuilder()
        .setTitle("Webtoon Recommend")
        .setDescription("Webtoon Recommend API description")
        .setVersion("1.0")
        .addTag("webtoon")
        .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("api", app, document);

    app.use(cookieParser());

    // 환경 변수 설정
    const configService = app.get(ConfigService);
    const port: number = configService.get("SERVER_PORT");

    await app.listen(port);
}
bootstrap();
