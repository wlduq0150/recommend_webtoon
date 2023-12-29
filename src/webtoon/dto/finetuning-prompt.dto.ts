import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateFineTunePrompt {
    @IsOptional()
    @IsString()
    @ApiProperty({ description: "분류" })
    category: string;

    @IsOptional()
    @IsString()
    @ApiProperty({ description: "서비스" })
    service: string;

    @IsOptional()
    @IsNumber()
    @ApiProperty({ description: "장르 키워드 최소 개수" })
    genreUpCount: number;

    @IsOptional()
    @IsNumber()
    @ApiProperty({ description: "줄거리 길이" })
    descriptionLength: number;
}
