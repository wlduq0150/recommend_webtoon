import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import puppeteer, { Page } from 'puppeteer';
import { WebtoonService } from 'src/webtoon/webtoon.service';
import { naverPageLogin } from './functions/naver/pageLogin.function';
import { kakaoPageLogin } from './functions/kakao/pageLogin.function';
import { getNaverWebtoonForId } from './functions/naver/getWebtoonForId.function';
import { CrawlWebtoonOption, CrawledWebtoon } from 'src/types/webtoon.interface';
import { getKakaoWebtoonForId } from './functions/kakao/getWebtoonForId.function';
import { getNaverWebtoonIdForDay } from './functions/naver/getWebtoonIdForDay.function';
import { getKakaoWebtoonIdForDay } from './functions/kakao/getWebtoonIdForDay.function';
import { DAY_LIST } from 'src/constatns/crawling.constants';
import { UpdateWebtoonPropertyDto } from 'src/dto/crawling.dto';

@Injectable()
export class CrawlingService {
    constructor(
        private readonly configService: ConfigService,
        private readonly webtoonService: WebtoonService,
        @Inject(CACHE_MANAGER) readonly cacheManager: Cache,
    ) {}

    async test() {
        const browser = await puppeteer.launch({
            headless: false,
            // args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();

        const webtoon = await getNaverWebtoonForId(page, "813563");
        console.log(webtoon);

        await page.close();
        await browser.close();

        return webtoon;
    }

    async login(page: Page, service: string): Promise<boolean> {
        const id = this.configService.get<string>(`CRAWLING_${service.toUpperCase()}_ID`);
        const pw = this.configService.get<string>(`CRAWLING_${service.toUpperCase()}_PW`);

        const loginResult =
            service === "naver"
                ? await naverPageLogin(page, id, pw)
                : await kakaoPageLogin(page, id, pw);

        return loginResult;
    }

    async crawlWebtoonForId(
        page: Page,
        webtoonId: string,
        service: string,
        option?: CrawlWebtoonOption,
    ): Promise<CrawledWebtoon> {
        const webtoon =
            service === "naver"
                ? await getNaverWebtoonForId(page, webtoonId, option)
                : await getKakaoWebtoonForId(page, webtoonId, option);

        return webtoon;
    }

    async crawlWeeklyWebtoonId(
        page: Page,
        day: string,
        service: string,
    ): Promise<string[]> {
        const cacheKey = `crawlId-${service}-${day}`;

        const cache: string = await this.cacheManager.get(cacheKey);
        if (cache) {
            const cacheValue: string[] = await JSON.parse(cache);
            return cacheValue;
        }

        const webtoonIds =
            service === "naver"
                ? await getNaverWebtoonIdForDay(page, day)
                : await getKakaoWebtoonIdForDay(page, day);

        await this.cacheManager.set(cacheKey, JSON.stringify(webtoonIds), 100000);

        return webtoonIds;
    }

    async initWebtoon(service: string) {
        const browser = await puppeteer.launch({
            headless: false,
            // args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        const webtoonIdList: string[] = [];

        // 플랫폼 로그인
        const loginResult = await this.login(page, service);
        console.log(loginResult ? "로그인 성공" : "로그인 실패");

        // 모든 웹툰 id 크롤링
        for (let day of DAY_LIST) {
            const dayIdList = await this.crawlWeeklyWebtoonId(page, day, service);
            webtoonIdList.push(...dayIdList);
        }
        const dayIdList = await this.crawlWeeklyWebtoonId(page, "완", service);
        webtoonIdList.push(...dayIdList);

        console.log("count: ", webtoonIdList.length);

        for (let webtoonId of webtoonIdList) {
            try {
                const webtoon = await this.webtoonService.getWebtoonForIdNoCache(webtoonId);
                if (webtoon) {
                    console.log(`\nId ${webtoonId} is already exist.\n`);
                    continue;
                } 

                const crawlWebtoon = await this.crawlWebtoonForId(
                    page,
                    webtoonId,
                    service,
                );

                // 모든 프로퍼티가 크롤링되었는지 확인 후 db에 저장
                if (
                    crawlWebtoon.title &&
                    crawlWebtoon.author &&
                    crawlWebtoon.category &&
                    crawlWebtoon.description &&
                    crawlWebtoon.episodeLength &&
                    crawlWebtoon.fanCount &&
                    crawlWebtoon.genreCount &&
                    crawlWebtoon.genres &&
                    crawlWebtoon.thumbnail &&
                    crawlWebtoon.updateDay
                ) {
                    await this.webtoonService.insertWebtoon({
                        webtoonId,
                        service,
                        title: crawlWebtoon.title,
                        author: crawlWebtoon.author,
                        category: crawlWebtoon.category,
                        description: crawlWebtoon.description,
                        episodeLength: crawlWebtoon.episodeLength,
                        fanCount: crawlWebtoon.fanCount,
                        genreCount: crawlWebtoon.genreCount,
                        genres: crawlWebtoon.genres,
                        thumbnail: crawlWebtoon.thumbnail,
                        updateDay: crawlWebtoon.updateDay
                    });
                } else {
                    console.log(`\nId ${webtoonId} is not crawled...\n`);
                }

                console.log(crawlWebtoon);
                    
            } catch (e) {
                console.log(e);
                console.log(`\nId ${webtoonId} is not crawled...\n`);
                continue;
            } 
        }

        await page.close();
        await browser.close();
    }

    async updateWebtoonProperty(updateWebtoonPropertyDto: UpdateWebtoonPropertyDto) {
        const { service, property } = updateWebtoonPropertyDto;
        // 프로퍼티가 올바른지 확인
        const browser = await puppeteer.launch({
            headless: false,
            // args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        const webtoonIdList: string[] = [];

        // 플랫폼 로그인
        const loginResult = await this.login(page, service);
        console.log(loginResult ? "로그인 성공" : "로그인 실패");

        // 모든 웹툰 id 크롤링
        for (let day of DAY_LIST) {
            const dayIdList = await this.crawlWeeklyWebtoonId(page, day, service);
            webtoonIdList.push(...dayIdList);
        }
        const dayIdList = await this.crawlWeeklyWebtoonId(page, "완", service);
        webtoonIdList.push(...dayIdList);

        for (let webtoonId of webtoonIdList) {
            try {
                const webtoon = await this.webtoonService.getWebtoonForIdNoCache(webtoonId);
                if (!webtoon) {
                    console.log(`\nId ${webtoonId} is not exist...\n`);
                    continue;
                } 

                const crawlWebtoon = await this.crawlWebtoonForId(
                    page,
                    webtoonId,
                    service,
                    { [property]: true }
                );

                // 정상적으로 크롤링 됐는지 확인 후 db 업데이트
                if (crawlWebtoon[property]) {
                    await this.webtoonService.updateWebtoonForOption({
                        webtoonId,
                        [property]: crawlWebtoon[property]
                    });
                } else {
                    console.log(`\nId ${webtoonId} is not crawled...\n`);
                }
                
                console.log(crawlWebtoon);

            } catch (e) {
                console.log(`\nId ${webtoonId} is not crawled...\n`);
                continue;
            } 
        }


        await page.close();
        await browser.close();
    }
}
