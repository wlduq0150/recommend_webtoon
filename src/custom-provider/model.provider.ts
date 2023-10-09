import { Scope } from "@nestjs/common";
import { User } from "src/sequelize/entity/user.model";
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