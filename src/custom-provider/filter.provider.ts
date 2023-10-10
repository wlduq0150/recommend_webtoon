import { APP_FILTER } from "@nestjs/core";
import { DtoExceptionFilter } from "src/exception-filter/dtoException.filter";

export const DtoFilterProvider = {
    provide: APP_FILTER,
    useClass: DtoExceptionFilter,
};