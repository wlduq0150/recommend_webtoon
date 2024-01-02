import { Module } from "@nestjs/common";
import { TimeScheduleService } from "./time-schedule.service";
import { UserModule } from "src/user/user.module";
import { CrawlingModule } from "src/crawling/crawling.module";

@Module({
    imports: [CrawlingModule],
    providers: [TimeScheduleService],
})
export class TimeScheduleModule {}
