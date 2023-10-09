import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { IsNotEmptyOnAllProperties } from "./function.dto";
import { PartialType } from "@nestjs/mapped-types";

@IsNotEmptyOnAllProperties()
export class InsertWebtoonDto {
    
    @IsString()
    webtoonId: string;

    @IsString()
    title: string;

    @IsString()
    author: string;
    
    @IsNumber()
    episodeLength: number;

    @IsString()
    thumbnail: string;

    @IsString()
    service: string;

    @IsString()
    updateDay: string;

    @IsString()
    category: string;

    @IsString()
    genres: string;

    @IsNumber()
    genreCount: number;

    @IsString()
    description: string;

    @IsNumber()
    fanCount: number;

}

export class UpdateWebtoonDto extends PartialType(InsertWebtoonDto) {
    @IsNotEmpty()
    @IsString()
    webtoonId: string;
}