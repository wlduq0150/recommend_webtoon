import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { CrawlingService } from "src/crawling/crawling.service";
import { getKoreanDayOfWeek } from "./function/getDay.function";

@Injectable()
export class TimeScheduleService {
    constructor(private readonly crawlingService: CrawlingService) {}

    @Cron("52 16 * * *")
    updateWebtoonForDay() {
        const today = getKoreanDayOfWeek();

        try {
            this.crawlingService.updateWebtoonForDay(today);
        } catch (e) {
            console.log(e);
            console.log(`예기치 않은 에러로 인해 ${today}요일의 웹툰 업데이트 실패.`);
        }
    }
}
