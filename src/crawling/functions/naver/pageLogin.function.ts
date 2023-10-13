import { Page } from "puppeteer";
import {
    NAVER_LOGIN_HOME_URL,
    NAVER_LOGIN_PAGE_BUTTON,
    NAVER_LOGIN_SUBMIT_BUTTON,
} from "src/constatns/crawling.constants";


export async function naverPageLogin(page: Page, id: string, pw: string) {
    try {
        // 네이버 홈페이지 이동
        await page.goto(NAVER_LOGIN_HOME_URL);
        await page.waitForTimeout(10000);
        // await page.waitForSelector(NAVER_LOGIN_PAGE_BUTTON);
        // await page.waitForNavigation();

        // 로그인 페이지로 접속
        await page.click(NAVER_LOGIN_PAGE_BUTTON);
        await page.waitForSelector(NAVER_LOGIN_SUBMIT_BUTTON);

        // 1초동안 id, pw를 입력하기(매크로 방지 뚫기)
        await page.waitForTimeout(1000);
        await page.click("#id");
        await page.keyboard.type(id, { delay: 1000 });
        await page.click("#pw");
        await page.keyboard.type(pw, { delay: 1000 });

        // 로그인 버튼 클릭후 잠시 대기
        await page.click(NAVER_LOGIN_SUBMIT_BUTTON);
        await page.waitForTimeout(1000);
        
        // 홈페이지로 돌아와진다면 로그인 성공
        if (page.url() === NAVER_LOGIN_HOME_URL) {
            return true;
        }
    } catch (e) {
        console.log(e);
    }
    return false;
}