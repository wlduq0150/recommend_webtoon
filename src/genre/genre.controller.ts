import { Controller, Get, Param } from '@nestjs/common';
import { GenreService } from './genre.service';

@Controller('genre')
export class GenreController {

    constructor(private readonly genreService: GenreService) {}

    @Get("genre-keyword")
    getGenreKeyword() {
        return this.genreService.getAllGenre("kakao");
    }

    @Get("category-keyword")
    getCategoryKeyword() {
        return this.genreService.getAllCategory("kakao");
    }


}
