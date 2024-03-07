import { GenreService } from "src/genre/genre.service";

export async function genresToText(genres: string[], genreService: GenreService) {
    let genreText = "";

    for (let genre of genres) {
        const genre_ = await genreService.getGenre({ keyword: genre });
        if (genre_) {
            const description = genre_.description;
            genreText += (description || "") + "\n\n";
        }
    }

    return genreText;
}
