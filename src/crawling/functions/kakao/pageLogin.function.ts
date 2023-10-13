import { Page } from "puppeteer";
import { KAKAO_LOGIN_HOME_URL, KAKAO_LOGIN_SELECTOR, KAKAO_LOGIN_SUBMIT_BUTTON } from "src/constatns/crawling.constants";


export async function kakaoPageLogin(page: Page, id: string, pw: string) {
    try {
        // 로그인 페이지 이동
        await page.goto(KAKAO_LOGIN_HOME_URL);
        await page.waitForSelector(KAKAO_LOGIN_SELECTOR);
        await page.click(KAKAO_LOGIN_SELECTOR);
        await page.waitForSelector(KAKAO_LOGIN_SUBMIT_BUTTON);

        // 권한 요청 창 방지
        page.on('dialog', async (dialog) => {
            console.log(dialog.message());
            await dialog.accept();
        });

        // 로그인 아이디 비번 입력
        await page.type("#loginId--1", id);
        await page.type("#password--2", pw);

        // 로그인 버튼 클릭
        await page.click(KAKAO_LOGIN_SUBMIT_BUTTON);

        // 페이지 이동이 두번이기 때문에 waitFor 두번
        await page.waitForNavigation();
        await page.waitForNavigation();

        // 로그인 성공 여부 체크
        if (page.url() === KAKAO_LOGIN_HOME_URL) {
            return true;
        }
    } catch (e) {
        console.log(e);
    }
    return false;
}