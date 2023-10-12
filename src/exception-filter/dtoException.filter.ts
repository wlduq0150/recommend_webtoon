import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from "@nestjs/common";
import { Request, Response } from "express";

@Catch(BadRequestException)
export class DtoExceptionFilter implements ExceptionFilter {
    catch(exception: BadRequestException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const req = ctx.getRequest<Request>();
        const res = ctx.getResponse<Response>();

        // 상태 코드 및 예외 응답 가져오기
        const status = exception.getStatus();
        const exceptionResonse = exception.getResponse() as any;

        // 요청했던 프로퍼티 및 응답 오류 메시지 변환 -> [["updateDay", "string"], ["fanCount"]: "number"]
        const messages: string[] = exceptionResonse.message;
        const requestPropertys: Record<string, any> = req.body;
        let errorPropertys: Array<string[]>;
        if (messages instanceof Array) {

            errorPropertys = messages.map((message) => {
                const first = message.split(" ")[0];
                const property = first !== "property" ? first : message.split(" ")[1];
                const dtoType = first !== "property" ? message.split(" ")[4] : "exclude";
                return [ property, dtoType ];
            });
    
            // 요청 했던 프로퍼티와 오류 비교 후 존재 여부 도출 -> [["updateDay", "string"], ["fanCount", "null"]
            errorPropertys = errorPropertys.map((errorProperty) => {
                const transformed = [...errorProperty];
    
                if (transformed[0] in requestPropertys) {
                    return transformed;
                } else {
                    transformed[1] = null;
                    return transformed;
                }
            });
        }
        
        // [["updateDay", "string"], ["fanCount", "null"]] 이중 키, 값 배열 객체 리터럴로 변환
        // => { "updateDay": "string", "fanCount": "null" }
        const property: Record<string, string | null> = (
            errorPropertys ?
            Object.fromEntries(errorPropertys) :
            {}
        );

        res
        .status(status)
        .json({
            statusCode: status,
            timeStamp: new Date().toISOString(),
            path: req.url,
            message: messages,
            property
        });
    }
}