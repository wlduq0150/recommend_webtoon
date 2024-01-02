import { Test, TestingModule } from "@nestjs/testing";
import { TimeScheduleService } from "../time-schedule.service";

describe("TimeScheduleService", () => {
    let service: TimeScheduleService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [TimeScheduleService],
        }).compile();

        service = module.get<TimeScheduleService>(TimeScheduleService);
    });

    it("should be defined", () => {
        expect(service).toBeDefined();
    });
});
