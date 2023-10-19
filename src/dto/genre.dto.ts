import { IsOptional, IsString } from "class-validator";

export class GetGenreDto {
    @IsString()
    keyword: string;

    @IsOptional()
    @IsString()
    service?: string;
}

export class CreateGenreDto {
    @IsString()
    keyword: string;

    @IsString()
    service: string;

    @IsString()
    description: string;

    @IsOptional()
    @IsString()
    embVector?: string;

    @IsOptional()
    @IsString()
    transformed?: string;
}

export class UpdateGenreDto {
    @IsString()
    keyword: string;

    @IsString()
    service: string;

    @IsOptional()
    @IsString()
    description?: string;

    @IsOptional()
    @IsString()
    embVector?: string;

    @IsOptional()
    @IsString()
    transformed?: string;
}

export class DeleteGenreDto {
    @IsString()
    keyword: string;

    @IsString()
    @IsOptional()
    service?: string;
}