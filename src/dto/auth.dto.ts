import { IsString } from "class-validator";
import { IsNotEmptyOnAllProperties } from "./dtoFunction";

@IsNotEmptyOnAllProperties()
export class LoginDto {

    @IsString()
    userId: string;

    @IsString()
    password: string;

}