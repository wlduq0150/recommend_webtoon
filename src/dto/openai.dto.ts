import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNumber, IsOptional, IsString } from "class-validator";

export class Create_3_5_CompletionDto {
    @IsString()
    @ApiProperty({ description: '모델 id' })
    model: string;

    @IsString()
    @ApiProperty({ description: 'system 메시지' })
    systemMessage: string;

    @IsString()
    @ApiProperty({ description: 'user 메시지' })
    userMessage: string;

    @IsNumber()
    @ApiProperty({ description: 'temperature' })
    temperature: number;

    @IsNumber()
    @ApiProperty({ description: 'maxTokens' })
    maxTokens: number;
}

export class CreateFileUploadDto {
    @IsString()
    @ApiProperty({ description: 'Jsonl 파일 이름' })
    filename: string;
}

export class CreateFineTuneModelDto {
    @IsString()
    @ApiProperty({ description: '파일 id' })
    fileId: string;

    @IsOptional()
    @IsString()
    @ApiPropertyOptional({ description: '모델 id' })
    model?: string;
}