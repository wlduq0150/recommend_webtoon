import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { ConflictException, Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Cache } from "cache-manager";
import { ChatCompletionMessageParam } from "openai/resources";
import { webtoonCacheTTL } from "src/constatns/cache.constants";
import { OPENAI_JSONL_FOLDER_PATH, OPENAI_JSON_FOLDER_PATH } from "src/constatns/openai.constants";
import { Webtoon } from "src/sequelize/entity/webtoon.model";
import { SelectOption } from "src/types/webtoon.interface";
import { genreToText } from "./function/genreToText.function";
import * as fs from "fs";
import * as path from "path";
import { GenreService } from "src/genre/genre.service";
import { InsertWebtoonDto } from "./dto/insert-webtoon.dto";
import { UpdateWebtoonDto } from "./dto/update-webtoon.dto";
import { CreateFineTunePrompt } from "./dto/finetuning-prompt.dto";
import { GenreWebtoon } from "src/sequelize/entity/genreWebtoon.model";
import { Genre } from "src/sequelize/entity/genre.model";
import { User } from "src/sequelize/entity/user.model";

@Injectable()
export class WebtoonService {
    constructor(
        @Inject("WEBTOON") private readonly webtoonModel: typeof Webtoon,
        @Inject("GENREWEBTOON")
        private readonly genreWebtoonModel: typeof GenreWebtoon,
        @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
        private readonly genreService: GenreService,
    ) {}

    async getAllWebtoon(): Promise<Webtoon[]> {
        return this.webtoonModel.findAll();
    }

    async getAllWebtoonForIds(ids: string[]): Promise<Webtoon[]> {
        const webtoons: Webtoon[] = [];
        for (const id of ids) {
            const webtoon: Webtoon = await this.getWebtoonForId(id);
            if (webtoon) webtoons.push(webtoon);
        }
        return webtoons;
    }

    async getWebtoonForId(id: string): Promise<Webtoon> {
        // cache-key
        const webtoonCacheKey: string = `webtoonCache-${id}`;

        // cache 값이 있다면 바로 값을 반환
        const webtoonCache: string = await this.cacheManager.get(webtoonCacheKey);
        if (webtoonCache) {
            const webtoonInfo = JSON.parse(webtoonCache);
            return webtoonInfo;
        }

        // database에서 해당 id의 웹툰 가져오기
        const webtoon: Webtoon = await this.webtoonModel.findOne({
            where: { id },
            attributes: { exclude: ["embVector", "embVectorDescription"] },
            include: {
                model: Genre,
                attributes: ["keyword"],
            },
        });

        if (!webtoon) {
            throw new NotFoundException(`webtoonId ${id} is not exsit.`);
        }

        // cache 값 저장
        this.cacheManager.set(
            webtoonCacheKey,
            JSON.stringify(webtoon),
            webtoonCacheTTL, // cache 만료 시간
        );

        return webtoon;
    }

    // 캐시 없이 웹툰 가져오기
    async getWebtoonForIdNoCache(id: string): Promise<Webtoon> {
        const webtoon: Webtoon = await this.webtoonModel.findOne({
            where: { id },
        });
        return webtoon;
    }

    // 요일별 웹툰 가져오기(캐시)
    async getAllWebtoonForDay(day: string): Promise<Webtoon[]> {
        const daywebtoonCacheKey: string = `webtoonCache-${day}`;

        const dayWebtoonCache: string = await this.cacheManager.get(daywebtoonCacheKey);
        if (dayWebtoonCache) {
            const dayWebtoon = JSON.parse(dayWebtoonCache);
            return dayWebtoon;
        }

        const webtoons: Webtoon[] = await this.webtoonModel.findAll({
            attributes: { exclude: ["embVector"] },
            where: { updateDay: day },
            order: [["fanCount", "DESC"]],
        });
        if (!webtoons) {
            throw new NotFoundException(`webtoon's day ${day} is wrong.`);
        }

        this.cacheManager.set(daywebtoonCacheKey, JSON.stringify(webtoons));

        return webtoons;
    }

    // 완결 웹툰 모두 가져오기(캐시)
    async getAllFinishedWebtoon(): Promise<Webtoon[]> {
        const finishedWebtoonCacheKey: string = `webtoonCache-finished`;

        const finishedWebtoonCache: string = await this.cacheManager.get(finishedWebtoonCacheKey);
        if (finishedWebtoonCache) {
            const finishedWebtoon = JSON.parse(finishedWebtoonCache);
            return finishedWebtoon;
        }

        const webtoons: Webtoon[] = await this.webtoonModel.findAll({
            attributes: { exclude: ["embVector"] },
            where: { updateDay: "완" },
        });

        this.cacheManager.set(finishedWebtoonCacheKey, JSON.stringify(webtoons));

        return webtoons;
    }

    // 옵션에 맞는 웹툰 가져오기
    async getAllWebtoonForOption(option: SelectOption): Promise<Webtoon[]> {
        let selectQeury: string = "SELECT * FROM webtoons WHERE ";

        // 초기 조건 추가(AND를 쓰기위한 문법에 필요)

        selectQeury += `fanCount > 0 `;

        /// 조건 여부에 따른 쿼리 문자열 추가

        if (option.genreUpCount) {
            selectQeury += `AND (LENGTH(genres) - LENGTH(REPLACE(genres, '"', ''))) / 2 > ${option.genreUpCount} `;
        }

        if (option.genreDownCount) {
            selectQeury += `AND (LENGTH(genres) - LENGTH(REPLACE(genres, '"', ''))) / 2 < ${option.genreDownCount} `;
        }

        if (option.service) {
            selectQeury += `AND service=\"${option.service}\" `;
        }

        if (option.category) {
            selectQeury += `AND category=\"${option.category}\" `;
        }

        if (option.fanCount) {
            selectQeury += `AND fanCount > ${option.fanCount} `;
        }

        if (option.updateDay) {
            selectQeury += `AND updateDay="${option.updateDay}" `;
        }

        if (option.descriptionLength) {
            selectQeury += `AND LENGTH(description) >= ${option.descriptionLength} `;
        }

        let data, webtoonList: Webtoon[];
        try {
            data = (await this.webtoonModel.sequelize.query(selectQeury)) as Webtoon[][];
            webtoonList = data[0];
        } catch (e) {
            console.log(e);
            throw new NotFoundException("웹툰 검색 옵션이 잘못되었습니다.");
        }

        return webtoonList;
    }

    async getIsUserWebtoonRead(webtoonId: string, userId: number): Promise<boolean> {
        const webtoon = await this.webtoonModel.findOne({
            where: { id: webtoonId },
            include: {
                model: User,
                attributes: ["id"],
                where: {
                    id: userId,
                },
            },
        });

        if (!webtoon) {
            return false;
        }

        return true;
    }

    // insert
    // insert

    async insertWebtoon(insertWebtoonDto: InsertWebtoonDto): Promise<boolean> {
        const { id, genres } = insertWebtoonDto;
        const isWebtoon = await this.webtoonModel.findOne({
            where: { id },
        });

        if (isWebtoon) {
            throw new ConflictException(`webtoonId ${id} is already exist.`);
        }

        const genreText = JSON.stringify(genres);

        const webtoon = await this.webtoonModel.create({
            ...insertWebtoonDto,
            genres: genreText,
        });

        for (let keyword of genres) {
            let genre = await this.genreService.getGenre({
                keyword,
            });

            // 장르 키워드가 없으면 건너뛰기
            if (!genre) {
                console.log(keyword);
                continue;
            }

            // 장르 키워드가 네이버면 카카오로 통일
            if (genre.service === "naver" && genre.transformed) {
                genre = await this.genreService.getGenre({
                    keyword: genre.transformed,
                    service: "kakao",
                });

                if (!genre) {
                    console.log(keyword);
                    continue;
                }
            }

            // 웹툰에 장르 추가
            await webtoon.$add("genres_", genre);
        }

        return true;
    }

    // Patch
    // Patch

    async updateWebtoonForOption(updateWebtoonDto: UpdateWebtoonDto): Promise<boolean> {
        const { id } = updateWebtoonDto;
        const webtoon = await this.getWebtoonForId(id);

        await this.webtoonModel.update({ ...updateWebtoonDto }, { where: { id } });

        if ("genres" in updateWebtoonDto) {
            const beforeGenres = await webtoon.$get("genres_", {
                attributes: ["keyword"],
            });
            const beforeGenreKeywords = beforeGenres.map((bg) => {
                return bg.keyword;
            });

            const newGenrekeywords = updateWebtoonDto.genres;

            for (let bGenre of beforeGenres) {
                if (!newGenrekeywords.includes(bGenre.keyword)) {
                    webtoon.$remove("genres_", bGenre);
                }
            }

            for (let nGenreKeyword of newGenrekeywords) {
                if (!beforeGenreKeywords.includes(nGenreKeyword)) {
                    const nGenre = await this.genreService.getGenre({
                        keyword: nGenreKeyword,
                        service: "kakao",
                    });

                    webtoon.$add("genres_", nGenre);
                }
            }
        }

        // 웹툰 수정, 삭제시 캐시된 값도 삭제
        const webtoonCacheKey: string = `webtoonCache-${id}`;
        await this.cacheManager.del(webtoonCacheKey);

        return true;
    }

    /// delete
    /// delete

    async deleteWebtoon(id: string): Promise<boolean> {
        await this.getWebtoonForId(id);

        await this.webtoonModel.destroy({ where: { id } });

        // 웹툰 수정, 삭제시 캐시된 값도 삭제
        const webtoonCacheKey: string = `webtoonCache-${id}`;
        await this.cacheManager.del(webtoonCacheKey);

        return true;
    }

    // 웹툰 테이블의 제목, 줄거리, 장르를 미세조정 형식인 json 파일로 변환
    async createFineTuningData(createFineTunePrompt: CreateFineTunePrompt): Promise<number> {
        const webtoons = await this.getAllWebtoonForOption({
            ...createFineTunePrompt,
        });
        let jsonData: any[] = [];

        for (let webtoon of webtoons) {
            const description = webtoon.description.replaceAll(/[\*\+#=\n]/g, "");

            const systemMessage = `너는 웹툰의 제목과 카테고리, 줄거리를 읽고 장르의 뜻과 연관 지어서 분석 후 장르키워드를 알려주는 조수야`;
            const userMessage = `제목: ${webtoon.title}\n\n카테고리: ${webtoon.category}\n\n줄거리: ${description}\n\n\n\n위 제목과 줄거리를 가진 웹툰의 장르 키워드를 알려줘`;
            const assistMessage = genreToText(JSON.parse(webtoon.genres));

            const messagesData: ChatCompletionMessageParam[] = [
                { role: "system", content: systemMessage },
                { role: "user", content: userMessage },
                { role: "assistant", content: assistMessage },
            ];

            const messages = { messages: messagesData };

            jsonData.push(messages);
        }

        const writePath = path.join(
            OPENAI_JSON_FOLDER_PATH,
            `webtoon_training_${createFineTunePrompt.category}.json`,
        );
        fs.writeFileSync(writePath, JSON.stringify(jsonData), {
            encoding: "utf-8",
        });

        return webtoons.length;
    }
}
