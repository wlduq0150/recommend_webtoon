import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsNumber, IsOptional, IsString } from "class-validator";

export class InitRecommendGenreOptionDto {
    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ description: '분류' })
    category?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ description: '서비스' })
    service?: string;

    @IsOptional()
    @IsNumber()
    @ApiPropertyOptional({ description: '장르 키워드 최대 개수' })
    genreDownCount?: number;

    @IsOptional()
    @IsNumber()
    @ApiPropertyOptional({ description: '장르 키워드 최대 개수' })
    genreUpCount?: number;

    @IsOptional()
    @IsNumber()
    @ApiPropertyOptional({ description: '줄거리 길이' })
    descriptionLength?: number;
}

export class CreateRecommendWebtoonDto {
    @IsString()
    @ApiProperty({ description: '분류' })
    category: string;

    @IsOptional()
    @IsNumber()
    @ApiPropertyOptional({ description: '편수' })
    episodeLength?: number;

    @IsArray()
    @IsString({ each: true })
    @ApiProperty({ description: '장르 키워드' })
    genres: string[];
}

export class RecommendWebtoonDto {
    @IsString()
    @ApiProperty({ description: '분류' })
    category: string;

    @IsString()
    @ApiProperty({ description: '유저 id' })
    userId: string;

    @IsString({ each: true })
    @ApiProperty({ description: '장르 목록' })
    genres: string[];

    @IsNumber()
    @ApiProperty({ description: '편수' })
    episodeLength: number;

    @IsArray()
    @IsString({ each: true })
    @ApiProperty({ description: '제외 목록' })
    newExcludeWebtoonIds: string[];
}