import { Controller, Get, Param } from '@nestjs/common';
import { GenreService } from './genre.service';

@Controller('genre')
export class GenreController {

    constructor(private readonly genreService: GenreService) {}

    @Get("test/:id")
    test(@Param("id") id: string) {
        return this.genreService.test(id);
    }

    

}
