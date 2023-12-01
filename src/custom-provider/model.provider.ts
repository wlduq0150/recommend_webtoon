import { Scope } from "@nestjs/common";
import { Genre } from "src/sequelize/entity/genre.model";
import { GenreWebtoon } from "src/sequelize/entity/genreWebtoon.model";
import { User } from "src/sequelize/entity/user.model";
import { UserWebtoon } from "src/sequelize/entity/userWebtoon.model";
import { Webtoon } from "src/sequelize/entity/webtoon.model";

export const webtoonProvider = {
    provide: "WEBTOON",
    useValue: Webtoon,
    Scope: Scope.DEFAULT
};

export const userProvider = {
    provide: "USER",
    useValue: User,
    Scope: Scope.DEFAULT
};

export const GenreProvider = {
    provide: "GENRE",
    useValue: Genre,
    Scope: Scope.DEFAULT 
}

export const UserWebtoonProvider = {
    provide: "USERWEBTOON",
    useValue: UserWebtoon,
    Scope: Scope.DEFAULT 
}

export const GenreWebtoonProvider = {
    provide: "GENREWEBTOON",
    useValue: GenreWebtoon,
    Scope: Scope.DEFAULT 
}