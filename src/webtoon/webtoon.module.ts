import { Module, forwardRef } from "@nestjs/common";
import { WebtoonController } from "./webtoon.controller";
import { WebtoonService } from "./webtoon.service";
import { GenreWebtoonProvider, webtoonProvider } from "src/custom-provider/model.provider";
import { SequelizeModule } from "@nestjs/sequelize";
import { Webtoon } from "src/sequelize/entity/webtoon.model";
import { GenreModule } from "src/genre/genre.module";

@Module({
    imports: [SequelizeModule.forFeature([Webtoon]), GenreModule],
    exports: [WebtoonService, webtoonProvider, GenreWebtoonProvider],
    controllers: [WebtoonController],
    providers: [WebtoonService, webtoonProvider, GenreWebtoonProvider],
})
export class WebtoonModule {}
