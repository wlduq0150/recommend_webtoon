import { ArgumentsHost, BadRequestException, Catch, ExceptionFilter } from "@nestjs/common";
import { Request, Response } from "express";

@Catch(BadRequestException)
export class DtoExceptionFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const req = ctx.getRequest<Request>();
        const res = ctx.getResponse<Response>();

        // 상태 코드 및 예외 응답 가져오기
        const status = exception.getStatus();
        const exceptionResonse = exception.getResponse();

        // 요청했던 프로퍼티 및 응답 오류 메시지 변환 -> [["updateDay", "string"], ["fanCount"]: "number"]
        const messages = exceptionResonse.message;
        const requestPropertys = req.body;
        let errorPropertys: Array<string[]> = messages.map((message) => {
            const property = message.split(" ")[0];
            const dtoType = message.split(" ")[4];
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

        // [["updateDay", "string"], ["fanCount", "null"]] 이중 키, 값 배열 객체 리터럴로 변환
        // => { "updateDay": "string", "fanCount": "null" }
        const property = Object.fromEntries(errorPropertys);

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