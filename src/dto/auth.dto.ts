import { IsNumber, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class SignupDto {

    @IsString()
    @ApiProperty({ description: '이메일' })
    email: string;

    @IsString()
    @ApiProperty({ description: '비밀번호' })
    password: string;

    @IsString()
    @ApiProperty({ description: '이름' })
    name: string;

    @IsNumber()
    @ApiProperty({ description: '나이' })
    age: number;

    @IsString()
    @ApiProperty({ description: '성별' })
    sex: string;

    @IsString()
    @ApiProperty({ description: '주소' })
    address: string;

}

export class LoginDto {

    @IsString()
    @ApiProperty({ description: '이메일' })
    email: string;

    @IsString()
    @ApiProperty({ description: '비밀번호' })
    password: string;

}