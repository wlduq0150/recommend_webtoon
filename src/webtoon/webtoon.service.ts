import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { webtoonCacheTTL } from 'src/constatns/cache.constants';
import { InsertWebtoonDto, UpdateWebtoonDto } from 'src/dto/webtoon.dto';
import { Webtoon } from 'src/sequelize/entity/webtoon.model';
import { SelectOption } from 'src/types/webtoon.interface';

@Injectable()
export class WebtoonService {

    constructor(
        @Inject("WEBTOON") private webtoonModel: typeof Webtoon,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
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
            return new Webtoon(webtoonInfo);
        }

        // database에서 해당 id의 웹툰 가져오기
        const webtoon: Webtoon =  await this.webtoonModel.findOne({ where: { webtoonId: id }});
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
        const webtoon: Webtoon =  await this.webtoonModel.findOne({ where: { webtoonId: id }});
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

        const webtoons: Webtoon[] =  await this.webtoonModel.findAll(
            {
                attributes: { exclude: ["embVector"] },
                where: { updateDay: day }
            }
        );
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

        const webtoons: Webtoon[] =  await this.webtoonModel.findAll(
            {
                attributes: { exclude: ["embVector"] },
                where: { updateDay: "완" }
            }
        );

        this.cacheManager.set(finishedWebtoonCacheKey, JSON.stringify(webtoons));

        return webtoons;
    };
    
	
    // 옵션에 맞는 웹툰 가져오기
    async getAllWebtoonForOption(option: SelectOption): Promise<Webtoon[]> {
        let selectQeury: string = "SELECT * FROM Webtoons WHERE ";

        // 초기 조건 추가(AND를 쓰기위한 문법에 필요)

        selectQeury += `fanCount > 0 `;

        /// 조건 여부에 따른 쿼리 문자열 추가

        if (option.genreUpCount) {
            selectQeury += `(LENGTH(genres) - LENGTH(REPLACE(genres, '"', ''))) / 2 > ${option.genreUpCount} `;
        }

        if (option.genreDownCount) {
            selectQeury += `(LENGTH(genres) - LENGTH(REPLACE(genres, '"', ''))) / 2 < ${option.genreDownCount} `;
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
            selectQeury += `AND updateDay=${option.updateDay} `;
        }

        if (option.descriptionLength) {
            selectQeury += `AND LENGTH(description) >= ${option.descriptionLength} `;
        }

        let data, webtoonList: Webtoon[];
        try {
            data = (await this.webtoonModel.sequelize.query(selectQeury)) as (Webtoon[])[];
            webtoonList = data[0];
        } catch (e) {
            throw new NotFoundException("option is wrong");
        }

        return webtoonList;
    }


    // insert
    // insert

    async insertWebtoon(insertWebtoonDto: InsertWebtoonDto): Promise<boolean> {
        const { webtoonId } = insertWebtoonDto;
        const webtoon = await this.webtoonModel.findOne({ where: { webtoonId } })

        if (webtoon) {
            throw new ConflictException(`webtoonId ${webtoonId} is already exist.`);
        }
        
        await this.webtoonModel.create({
            ...insertWebtoonDto,
        });

        return true;
    }


    // Patch
    // Patch

    async updateWebtoonForOption(updateWebtoonDto: UpdateWebtoonDto): Promise<boolean> {
        const { webtoonId }: { webtoonId: string } = updateWebtoonDto;
        await this.getWebtoonForId(webtoonId);

        await this.webtoonModel.update(
            { ...updateWebtoonDto },
            { where: { webtoonId } },
        );
        
        // category 변경시에는 genres의 첫번쨰 값도 같이 변경
        if (updateWebtoonDto.category) {
            const webtoon = await this.webtoonModel.findOne({ where: { webtoonId } });
            const genres: string[] = JSON.parse(webtoon.genres);
            const { category } = updateWebtoonDto;

            // 변경된 category와 genres의 첫번째 값이 다를 경우에만 변경
            if (genres[0] !== category) {
                genres[0] = category;
                const genresText: string = JSON.stringify(genres);

                await this.updateWebtoonForOption({ webtoonId, genres: genresText });
            }
        }

        // 웹툰 수정, 삭제시 캐시된 값도 삭제
        const webtoonCacheKey: string = `webtoonCache-${webtoonId}`;
        await this.cacheManager.del(webtoonCacheKey);

        return true;
    }


    /// delete
    /// delete

    async deleteWebtoon(id: string): Promise<boolean> {
        await this.getWebtoonForId(id);

        await this.webtoonModel.destroy(
            { where: { webtoonId: id }
        });

        // 웹툰 수정, 삭제시 캐시된 값도 삭제
        const webtoonCacheKey: string = `webtoonCache-${id}`;
        await this.cacheManager.del(webtoonCacheKey);

        return true;
    }
}