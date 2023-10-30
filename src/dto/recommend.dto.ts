import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";

export class InitRecommendGenreOptionDto {
    @IsOptional()
    @IsString()
    @ApiProperty({ description: '분류' })
    category: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: '서비스' })
    service: string;

    @IsOptional()
    @IsNumber()
    @ApiProperty({ description: '장르 키워드 최대 개수' })
    genreDownCount: number;

    @IsOptional()
    @IsNumber()
    @ApiProperty({ description: '장르 키워드 최대 개수' })
    genreUpCount: number;

    @IsOptional()
    @IsNumber()
    @ApiProperty({ description: '줄거리 길이' })
    descriptionLength: number;
}

export class CreateRecommendWebtoonDto {
    @IsOptional()
    @IsString()
    @ApiProperty({ description: '분류' })
    category: string;

    @IsArray()
    @IsString({ each: true })
    @ApiProperty({ description: '장르 키워드' })
    genres: string[];
}