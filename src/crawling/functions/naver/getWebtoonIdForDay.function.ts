import { Page } from "puppeteer";
import * as cheerio from "cheerio";
import {
    KAKAO_DAY_TRANSFORM,
    NAVER_DAY_CLICK_SELECTOR,
    NAVER_DAY_TRANSFORM,
    NAVER_DAY_WEBTOONLIST_SELECTOR,
} from "src/constatns/crawling.constants";

export async function getNaverWebtoonIdForDay(page: Page, day: string): Promise<string[]> {
    const webtoonIdList: string[] = [];

    // 요일을 url에 들어갈 수 있게 바꿔줌
    day =  NAVER_DAY_TRANSFORM[KAKAO_DAY_TRANSFORM.indexOf(day)];
    await page.goto(`https://comic.naver.com/webtoon?tab=${day}`);
    await page.waitForSelector(NAVER_DAY_WEBTOONLIST_SELECTOR);

    // 무한 스크롤링 방지
    while (true) {
        try {
            // 네이버 자동 스크롤링 방지 뚫기 (다른 페이지를 갔다가 다시 돌아온다.)
            await page.click(NAVER_DAY_CLICK_SELECTOR);
            await page.waitForSelector(NAVER_DAY_WEBTOONLIST_SELECTOR);

            await page.goBack();
            await page.waitForSelector(NAVER_DAY_WEBTOONLIST_SELECTOR, { timeout: 30000 });

            // 스크롤
            const scrollHeight = 'document.body.scrollHeight';
            const previousHeight = await page.evaluate(scrollHeight);
            await page.evaluate(`window.scrollTo(0, ${scrollHeight})`);
            await page.waitForFunction(`${scrollHeight} > ${previousHeight}`, {
                timeout: 30000
            });

            if (parseInt(previousHeight as string) > 80000) {
                break;
            }
            console.log(previousHeight);
        } catch (e) {
            break;
        }
    }

    const content = await page.content();
    const $ = cheerio.load(content);

    // 웹툰 id 불러오기
    const rootElement = $(NAVER_DAY_WEBTOONLIST_SELECTOR);
    rootElement.children().map((idx, element) => {
        const $data = cheerio.load(element);
        const reg = new RegExp(/[0-9]+/, "g");
        const webtoonId = $data("a").attr("href").match(reg)[0];
        webtoonIdList.push(webtoonId);
    });

    return webtoonIdList;
}
