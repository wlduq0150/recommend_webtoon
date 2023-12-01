import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserDataDto {
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

// CreateUserDataDto의 속성들을 partial(선택적)으로 해서 확장한다.
export class UpdateUserDataDto {
    @IsNotEmpty()
    @IsString()
    @ApiProperty({ description: '이메일' })
    email: string; 

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ description: '비밀번호' })
    password?: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ description: '이름' })
    name?: string;

    @IsNumber()
    @IsOptional()
    @ApiPropertyOptional({ description: '나이' })
    age?: number;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ description: '성별' })
    sex?: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ description: '주소' })
    address?: string;

    @IsString()
    @IsOptional()
    @ApiPropertyOptional({ description: '현재 Refresh Token' })
    currentRefreshToken?: string;

    @IsDate()
    @IsOptional()
    @ApiPropertyOptional({ description: '현재 Refresh Token 만료날짜' })
    currentRefreshTokenExp?: Date;
}