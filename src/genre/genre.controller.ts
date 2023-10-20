import { Controller, Get } from '@nestjs/common';
import { GenreService } from './genre.service';

@Controller('genre')
export class GenreController {

    constructor(private readonly genreService: GenreService) {}

    @Get("test")
    async test() {
        return this.genreService.updateTransformForFile("naver");
    }
    

}
