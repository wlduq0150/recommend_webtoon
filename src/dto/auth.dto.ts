import { IsString } from "class-validator";
import { IsNotEmptyOnAllProperties } from "./dtoFunction";
import { ApiProperty } from "@nestjs/swagger";

@IsNotEmptyOnAllProperties()
export class LoginDto {

    @IsString()
    @ApiProperty({ description: '아이디' })
    userId: string;

    @IsString()
    @ApiProperty({ description: '비밀번호' })
    password: string;

}