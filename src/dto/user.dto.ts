import { PartialType } from "@nestjs/mapped-types";
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { IsNotEmptyOnAllProperties } from "./dtoFunction";

@IsNotEmptyOnAllProperties()
export class CreateUserDataDto {
    @IsString()
    userId: string;

    @IsString()
    password: string;

    @IsString()
    name: string;

    @IsNumber()
    age: number;

    @IsString()
    sex: string;

    @IsString()
    address: string;
}

// CreateUserDataDto의 속성들을 partial(선택적)으로 해서 확장한다.
export class UpdateUserDataDto extends PartialType(CreateUserDataDto) {
    @IsNotEmpty()
    @IsString()
    userId: string; 

    @IsOptional()
    @IsString()
    currentRefreshToken?: string;

    @IsOptional()
    @IsDate()
    currentRefreshTokenExp?: Date;
}