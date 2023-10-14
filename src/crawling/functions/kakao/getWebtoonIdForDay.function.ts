import { Page } from "puppeteer";
import * as cheerio from "cheerio";
import { CrawlDayOption } from "src/types/webtoon.interface";
import {
    KAKAO_DAY_TRANSFORM,
    KAKAO_DAY_WEBTOONLIST_SELECTOR,
} from "src/constatns/crawling.constants";

export async function getKakaoWebtoonIdForDay(page: Page, option: CrawlDayOption): Promise<string[]> {
    const webtoonIdList: string[] = [];

    // 요일을 url에 들어갈 수 있게 바꿔줌
    const day = KAKAO_DAY_TRANSFORM.indexOf(option.day);
    await page.goto(`https://page.kakao.com/menu/10010/screen/52?tab_uid=${day}`);

    // 무한 스크롤링 방지
    while (true) {
        try {
            // 페이지 끝까지 스크롤을 하기 전 높이와 이후의 높이를 비교한다.
            const scrollHeight = "document.body.scrollHeight";
            let previousHeight = await page.evaluate(scrollHeight);
            await page.evaluate(`window.scrollTo(0, ${scrollHeight})`);
            await page.waitForFunction(`${scrollHeight} > ${previousHeight}`, {
                timeout: 5000,
            });
        } catch (e) {
            // 더이상 스크롤 높이가 증가하지 않아 오류가 발생하면 스크롤링을 멈춘다. 
            break;
        }
    }

    const content = await page.content();
    const $ = cheerio.load(content);

    // 웹툰 id 불러오기
    const rootElement = $(KAKAO_DAY_WEBTOONLIST_SELECTOR);
    rootElement.children().map((idx, element) => {
        const $data = cheerio.load(element);
        const id: string = $data("div a").attr("href").split("/")[2];
        webtoonIdList.push(id);
    });

    return webtoonIdList;
}
