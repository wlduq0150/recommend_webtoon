import { IsString } from "class-validator";

export class UpdateWebtoonPropertyDto {

    @IsString()
    service: string;

    @IsString()
    property: string;

}