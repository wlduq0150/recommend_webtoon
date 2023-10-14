import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import puppeteer, { Page } from 'puppeteer';
import { WebtoonService } from 'src/webtoon/webtoon.service';
import { naverPageLogin } from './functions/naver/pageLogin.function';
import { kakaoPageLogin } from './functions/kakao/pageLogin.function';
import { getNaverWebtoonForId } from './functions/naver/getWebtoonForId.function';
import { CrawlDayOption, CrawledWebtoon } from 'src/types/webtoon.interface';
import { getKakaoWebtoonForId } from './functions/kakao/getWebtoonForId.function';
import { getNaverWebtoonIdForDay } from './functions/naver/getWebtoonIdForDay.function';
import { getKakaoWebtoonIdForDay } from './functions/kakao/getWebtoonIdForDay.function';

@Injectable()
export class CrawlingService {

    constructor(
        private readonly configService: ConfigService,
        private readonly webtoonService: WebtoonService,
        @Inject(CACHE_MANAGER) readonly cacheManager: Cache
    ) {}

    async test() {
        const browser = await puppeteer.launch({
            headless: false,
            // args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        await page.setViewport({
            width: 1280,
            height: 720
        });

        const webtoonId = await getNaverWebtoonIdForDay(page, { day: "월" });

        await page.close();
        await browser.close();

        return webtoonId;
    }

    async login(page: Page, service: string): Promise<boolean> {
        const id = this.configService.get<string>(`CRAWLING_${service.toUpperCase()}_ID`);
        const pw = this.configService.get<string>(`CRAWLING_${service.toUpperCase()}_PW`);

        const loginResult = (
            service === "naver" ? await naverPageLogin(page, id, pw) : await kakaoPageLogin(page, id, pw)
        );

        return loginResult;
    }

    async crawlWebtoonForId(page: Page, webtoonId: string, service: string): Promise<CrawledWebtoon> {
        const webtoon = service === "naver"
            ? await getNaverWebtoonForId(page, webtoonId)
            : await getKakaoWebtoonForId(page, webtoonId);

        return webtoon;
    }

    async crawlWeeklyWebtoonId(page: Page, day: CrawlDayOption, service: string): Promise<string[]> {
        const webtoonIds = service === "naver"
            ? await getKakaoWebtoonIdForDay(page, day)
            : await getNaverWebtoonIdForDay(page, day);

        return webtoonIds;
    }

}
