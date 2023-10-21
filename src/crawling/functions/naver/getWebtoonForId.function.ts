import { Page } from "puppeteer";
import * as cheerio from "cheerio";
import { CrawlWebtoonOption, CrawledWebtoon } from "src/types/webtoon.interface";
import {
    NAVER_AUTHOR_SELECTOR,
    NAVER_DESCRIPTION_SELECTOR,
    NAVER_EPISODELENGTH_SELECTOR,
    NAVER_EPISODELENGTH_WAIT_SELECTOR,
    NAVER_FANCOUNT_SELECTOR,
    NAVER_GENRE_SELECTOR,
    NAVER_THUMBNAIL_SELECTOR,
    NAVER_TITLE_SELECTOR,
    NAVER_UPDATEDAY_SELECTOR,
} from "src/constatns/crawling.constants";

export async function getNaverWebtoonForId(
    page: Page,
    webtoonId: string,
    option?: CrawlWebtoonOption,
): Promise<CrawledWebtoon> {
    const webtoon: CrawledWebtoon = { webtoonId, service: "NAVER" };

    try {
        await page.goto(`https://comic.naver.com/webtoon/list?titleId=${webtoonId}`);
        await page.waitForSelector(NAVER_EPISODELENGTH_WAIT_SELECTOR);
        await page.waitForSelector(NAVER_THUMBNAIL_SELECTOR);

        let content = await page.content();
        let $ = cheerio.load(content);
    
        let rootElement: cheerio.Cheerio;
        
        // 제목 크롤링
        if (!option || option.title) {
            rootElement = $(NAVER_TITLE_SELECTOR);
            const title = rootElement.first().text();
            webtoon.title = title;
        }
        
    
        // 작가 크롤링
        if (!option || option.author) {
            rootElement = $(NAVER_AUTHOR_SELECTOR);
            const author: string[] = [];
            rootElement.map((idx, element) => {
                const $data = cheerio.load(element);
                const author_ = $data("a").text()
                author.push(author_);
            });
            webtoon.author = JSON.stringify(author);
        }
    
    
        // 조회수 크롤링
        if (!option || option.fanCount) {
            rootElement = $(NAVER_FANCOUNT_SELECTOR);
            const fanCountText = rootElement.last().text().replaceAll(",", "");
            const fanCount = parseInt(fanCountText);
            webtoon.fanCount = fanCount;
        }
    
    
        // 업데이트 날짜 크롤링
        if (!option || option.updateDay) {
            rootElement = $(NAVER_UPDATEDAY_SELECTOR);
            const updateDayText = rootElement.first().text();
            const updateDay = parseInt(updateDayText)
                ? "휴"
                : updateDayText.includes("완결")
                ? "완"
                : updateDayText.charAt(0);
            webtoon.updateDay = updateDay;
        }
    
    
        // 썸네일 크롤링
        if (!option || option.thumbnail) {
            rootElement = $(NAVER_THUMBNAIL_SELECTOR);
            const thumbnail = rootElement.attr("src");
            webtoon.thumbnail = thumbnail;
        }
    
    
        // 장르 키워드 크롤링
        if (!option || option.genres || option.category) {
            rootElement = $(NAVER_GENRE_SELECTOR);

            const genres: string[] = [];
            rootElement.children().map((idx, element) => {
                const $data = cheerio.load(element);
                const genre: string = $data("a").text().replace("#", "");
                genres.push(genre);
            });

            const genreCount = genres.length;
            webtoon.category = genres[0];
            webtoon.genres = JSON.stringify(genres);
            webtoon.genreCount = genreCount;
        }
    
    
        // 줄거리 크롤링
        if (!option || option.description) {
            rootElement = $(NAVER_DESCRIPTION_SELECTOR);
            const description = rootElement.text();
            webtoon.description = description;
        }
    
    
        // 에피소드 개수 크롤링
        if (!option || option.episodeLength || option.fanCount) {
            rootElement = $(NAVER_EPISODELENGTH_SELECTOR);
            const episodeLength = parseInt(rootElement.text().split(" ")[1]);
            webtoon.episodeLength = episodeLength;
        }
    } catch(e) {
        console.log(`webtoonId ${webtoonId} is not crawled..`);
        return null;
    }
    
    return webtoon;
}