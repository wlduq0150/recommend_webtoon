import { Controller, Get, Param } from '@nestjs/common';
import { GenreService } from './genre.service';

@Controller('genre')
export class GenreController {

    constructor(private readonly genreService: GenreService) {}

}
