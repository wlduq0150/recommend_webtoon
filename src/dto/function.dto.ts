import { applyDecorators } from "@nestjs/common";
import { IsNotEmpty } from "class-validator";

// 모든 프로퍼티에 @IsNotEmpty()를 적용
export function IsNotEmptyOnAllProperties() {
    return applyDecorators(
        IsNotEmpty({
            message: "This field should not be empty",
        }),
    );
}