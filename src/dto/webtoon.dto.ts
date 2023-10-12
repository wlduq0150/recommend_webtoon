import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { IsNotEmptyOnAllProperties } from "./dtoFunction";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

@IsNotEmptyOnAllProperties()
export class InsertWebtoonDto {
    
    @IsString()
    @ApiProperty({ description: '웹툰 아이디' })
    webtoonId: string;

    @IsString()
    @ApiProperty({ description: '제목' })
    title: string;

    @IsString()
    @ApiProperty({ description: '작가' })
    author: string;
    
    @IsNumber()
    @ApiProperty({ description: '전체 화수' })
    episodeLength: number;

    @IsString()
    @ApiProperty({ description: '썸네일' })
    thumbnail: string;

    @IsString()
    @ApiProperty({ description: '서비스' })
    service: string;

    @IsString()
    @ApiProperty({ description: '업데이트 날짜' })
    updateDay: string;

    @IsString()
    @ApiProperty({ description: '분류' })
    category: string;

    @IsString()
    @ApiProperty({ description: '장르키워드' })
    genres: string;

    @IsNumber()
    @ApiProperty({ description: '장르키워드 개수' })
    genreCount: number;

    @IsString()
    @ApiProperty({ description: '줄거리' })
    description: string;

    @IsNumber()
    @ApiProperty({ description: '팬 수' })
    fanCount: number;

}

export class UpdateWebtoonDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: '웹툰 아이디' })
    webtoonId: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ description: '제목' })
    title?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ description: '작가' })
    author?: string;
    
    @IsOptional()
    @IsNumber()
    @ApiPropertyOptional({ description: '전체 화수' })
    episodeLength?: number;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ description: '썸네일' })
    thumbnail?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ description: '서비스' })
    service?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ description: '업데이트 날짜' })
    updateDay?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ description: '분류' })
    category?: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ description: '장르키워드' })
    genres?: string;

    @IsOptional()
    @IsNumber()
    @ApiPropertyOptional({ description: '장르키워드 개수' })
    genreCount?: number;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ description: '줄거리' })
    description?: string;

    @IsOptional()
    @IsNumber()
    @ApiPropertyOptional({ description: '팬 수' })
    fanCount?: number;
}