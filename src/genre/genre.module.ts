import { Module, forwardRef } from "@nestjs/common";
import { GenreController } from "./genre.controller";
import { GenreService } from "./genre.service";
import { WebtoonModule } from "src/webtoon/webtoon.module";
import { OpenaiModule } from "src/openai/openai.module";
import {
    GenreProvider,
    GenreWebtoonProvider,
} from "src/custom-provider/model.provider";

@Module({
    imports: [forwardRef(() => WebtoonModule), OpenaiModule],
    exports: [GenreService, GenreProvider, GenreWebtoonProvider],
    controllers: [GenreController],
    providers: [GenreService, GenreProvider, GenreWebtoonProvider],
})
export class GenreModule {}
