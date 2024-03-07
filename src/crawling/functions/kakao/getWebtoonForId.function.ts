import { Page } from "puppeteer";
import * as cheerio from "cheerio";
import { CrawlWebtoonOption, CrawledWebtoon } from "src/types/webtoon.interface";
import {
    KAKAO_AUTHOR_SELECTOR,
    KAKAO_CATEGORY_SELECTOR,
    KAKAO_DESCRIPTION_SELECTOR,
    KAKAO_EPISODELENGTH_CLICK_SELECTOR,
    KAKAO_EPISODELENGTH_SELECTOR,
    KAKAO_EPISODELENGTH_WAIT_SELECTOR,
    KAKAO_FANCOUNT_SELECTOR,
    KAKAO_GENRE_SELECTOR,
    KAKAO_THUMBNAIL_SELECTOR,
    KAKAO_TITLE_SELECTOR,
    KAKAO_UPDATEDAY_SELECTOR,
} from "src/constatns/crawling.constants";

function parseIntFromFanCountText(fanCountText: string) {
    const replacedCount = fanCountText.replaceAll(",", "");

    // 만, 억과 같은 문자열을 숫자로 변환
    let fanCount = parseFloat(replacedCount);

    // "만", "억" 등의 문자열을 처리
    if (fanCountText.includes("만")) {
        fanCount *= 10000; // 만(10,000)을 곱함
    } else if (fanCountText.includes("억")) {
        fanCount *= 100000000; // 억(100,000,000)을 곱함
    }

    return fanCount;
}

export async function getKakaoWebtoonForId(
    page: Page,
    webtoonId: string,
    option?: CrawlWebtoonOption,
): Promise<CrawledWebtoon> {
    const webtoon: CrawledWebtoon = { webtoonId, service: "kakao" };

    try {
        await page.goto(`https://page.kakao.com/content/${webtoonId}?tab_type=about`);
        await page.waitForSelector(KAKAO_DESCRIPTION_SELECTOR);

        let content = await page.content();
        let $ = cheerio.load(content);

        let rootElement: cheerio.Cheerio;

        // 제목 크롤링
        if (!option || option.title) {
            rootElement = $(KAKAO_TITLE_SELECTOR);
            const title = rootElement.first().text();
            webtoon.title = title;
        }

        // 작가 크롤링
        if (!option || option.author) {
            rootElement = $(KAKAO_AUTHOR_SELECTOR);
            const author = rootElement.first().text().split(",");
            webtoon.author = JSON.stringify(author);
        }

        // 카테고리 크롤링
        if (!option || option.category) {
            rootElement = $(KAKAO_CATEGORY_SELECTOR);
            const category = rootElement.last().text();
            webtoon.category = category;
        }

        // 조회수 크롤링
        if (!option || option.fanCount) {
            rootElement = $(KAKAO_FANCOUNT_SELECTOR);
            const fanCountText = rootElement.last().text().replaceAll(",", "");
            const fanCount = parseIntFromFanCountText(fanCountText);
            webtoon.fanCount = fanCount;
        }

        // 업데이트 날짜 크롤링
        if (!option || option.updateDay) {
            rootElement = $(KAKAO_UPDATEDAY_SELECTOR);
            const updateDay = rootElement.first().text().charAt(0);
            webtoon.updateDay = updateDay;
        }

        // 썸네일 크롤링
        if (!option || option.thumbnail) {
            rootElement = $(KAKAO_THUMBNAIL_SELECTOR);
            const thumbnail = rootElement.attr("src");
            webtoon.thumbnail = thumbnail;
        }

        // 장르 키워드 크롤링
        if (!option || option.genres) {
            rootElement = $(KAKAO_GENRE_SELECTOR);
            const genres: string[] = [];
            rootElement.children().map((idx, element) => {
                const t_obj: string = $(element).attr("data-t-obj");
                const genre = t_obj ? JSON.parse(t_obj).click.copy : null;
                if (genre) genres.push(genre);
            });
            const genreCount = genres.length;
            webtoon.genres = genres;
            webtoon.genreCount = genreCount;
        }

        // 줄거리 크롤링
        if (!option || option.description) {
            rootElement = $(KAKAO_DESCRIPTION_SELECTOR);
            const description = rootElement.text();
            webtoon.description = description;
        }

        if (!option || option.episodeLength || option.fanCount) {
            // 페이지 이동 (에피소드 개수 크롤링 하기 위해)
            await page.click(KAKAO_EPISODELENGTH_CLICK_SELECTOR);
            await page.waitForSelector(KAKAO_EPISODELENGTH_WAIT_SELECTOR);

            // 페이지를 이동했기 때문에 다시 페이지 내용 불러오기
            content = await page.content();
            $ = cheerio.load(content);

            // 에피소드 개수 크롤링
            rootElement = $(KAKAO_EPISODELENGTH_SELECTOR);
            const episodeLength = parseInt(rootElement.text().split(" ")[1]);
            webtoon.episodeLength = episodeLength;
        }

        // 팬수 구하기 (전체 조회수 / 에피소드 개수)
        if (!option || option.fanCount) {
            webtoon.fanCount = Math.floor(webtoon.fanCount / webtoon.episodeLength);
        }
    } catch (e) {
        console.log(`webtoonId ${webtoonId} is not crawled..`);
        return null;
    }

    return webtoon;
}
