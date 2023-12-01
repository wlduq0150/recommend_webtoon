import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { OpenaiService } from 'src/openai/openai.service';
import { WebtoonService } from 'src/webtoon/webtoon.service';

import * as fs from "fs";
import * as path from "path";
import { CATEGORY_FOLDER, GENRE_FOLDER, TRANSOFRM_FOLDER } from 'src/constatns/genre.constants';
import { Genre } from 'src/sequelize/entity/genre.model';
import { ChatCompletionMessageParam } from 'openai/resources';
import { CreateGenreDto, DeleteGenreDto, GetGenreDto, UpdateGenreDto } from 'src/dto/genre.dto';
import { OPENAI_JSONL_FOLDER_PATH } from 'src/constatns/openai.constants';
import { UpdateWebtoonDto } from 'src/dto/webtoon.dto';
import { ConfigService } from '@nestjs/config';
import { GenreWebtoon } from 'src/sequelize/entity/genreWebtoon.model';

@Injectable()
export class GenreService {
    constructor(
        @Inject("GENRE") private genreModel: typeof Genre,
        @Inject("GENREWEBTOON") private genreWebtoonModel: typeof GenreWebtoon,
        private readonly configService: ConfigService,
        private readonly webtoonService: WebtoonService,
        private readonly openaiService: OpenaiService,
    ) {}

    async test(): Promise<void> {
        try {
            const webtoons = await this.webtoonService.getAllWebtoon();

            for (let webtoon of webtoons) {
                const keywords = JSON.parse(webtoon.genres);

                for (let keyword of keywords) {
                    const genre = await this.getGenre({ keyword, service: "kakao" });
                    if (!genre) {
                        console.log(keyword, "장르가 존재하지 않습니다.");
                        continue;
                    }

                    const genreId = genre.id;
                    const webtoonId = webtoon.id;

                    const isExist = await this.genreWebtoonModel.findOne({
                        where: { genreId, webtoonId }
                    });

                    if (isExist) {
                        console.log(`이미 존재합니다.\n[${webtoonId}, ${genreId}]`);
                        continue;
                    }

                    await this.genreWebtoonModel.create({
                        genreId: genre.id,
                        webtoonId: webtoon.id,
                    });

                    console.log(`\n\n[생성]\n웹툰id: ${webtoon.id}\n제목: ${webtoon.title}\n장르키워드: ${genre.keyword}`);
                }
            }
        } catch(e) {
            console.log(e);
        }
    }

    // 모든 keyword 불러오기
    async getAllGenre(service?: string): Promise<Genre[]> {
        const genres = await this.genreModel.findAll({
            where: { service: service ? service : ["kakao", "naver"] },
            attributes: { exclude: ["embVector"] }
        });
        console.log(genres);
        return genres;
    }

    getAllCategory(service?: string): string[] {
        const categoryPath = path.join(CATEGORY_FOLDER, `${service}Category.json`);
        const categorys: string[] = require(categoryPath);
        return categorys;
    }

    // keyword와 service를 통해 장르 불러오기
    async getGenre(getGenreDto: GetGenreDto): Promise<Genre> {
        const genre = await this.genreModel.findOne({
            where: { ...getGenreDto },
        });
        return genre;
    }

    // 새로운 장르를 데이터베이스에 저장
    async createGenre(createGenreDto: CreateGenreDto) {
        const genre = await this.getGenre({
            keyword: createGenreDto.keyword,
        });
        if (genre) return;

        await this.genreModel.create({
            ...createGenreDto,
        });
    }

    // 장르의 변환된 데이터만 데이터베이스 업데이트
    async updateGenre(updateGenreDto: UpdateGenreDto) {
        const { keyword, service } = updateGenreDto;

        const genre = await this.getGenre({
            keyword: updateGenreDto.keyword,
            service: updateGenreDto.service,
        });
        if (!genre) return;

        await this.genreModel.update(
            {
                ...updateGenreDto,
            },
            {
                where: { keyword, service },
            },
        );
    }

    // 장르 데이터 삭제
    async deleteGenre(deleteGenreDto: DeleteGenreDto) {
        const { keyword } = deleteGenreDto;

        const genre = await this.getGenre({ keyword });
        if (!genre) return;

        await this.genreModel.destroy({
            where: { ...deleteGenreDto },
        });
    }

    // 장르 DB의 장르 키워드 및 줄거리를 미세조정 학습에 필요한 jsonl 파일로 변환
    async createKeywordFineTuningPrompt(service: string) {
        const genres = await this.getAllGenre(service);
        let jsonData: any[] = [];

        for (let genre of genres) {
            const systemMessage = `너는 웹툰의 장르 키워드와 그 뜻을 알고있는 전문가야.`;
            const userMessage = `장르 키워드 "${genre.keyword}"의 뜻이 뭐야?`;
            const assistMessage = genre.description;

            const messagesData: ChatCompletionMessageParam[] = [
                { role: "system", content: systemMessage },
                { role: "user", content: userMessage },
                { role: "assistant", content: assistMessage },
            ];

            const messages = { messages: messagesData };
            jsonData.push(messages);
        }

        const writePath = path.join(OPENAI_JSONL_FOLDER_PATH, "keywordDescription.json");
        fs.writeFileSync(writePath, JSON.stringify(jsonData), { encoding: "utf-8" });
    }

    // 장르 뜻 gpt에게 요청
    async getKeywordDescription(keyword: string): Promise<string> {
        const prompt: ChatCompletionMessageParam[] = [
            { role: "system", content: "너는 웹툰의 장르 키워드와 그 뜻을 알고있는 전문가야." },
            { role: "user", content: `장르 키워드 ${keyword}의 뜻이 뭐야?` },
        ];

        const description = await this.openaiService.create_3_5_Completion(
            "ft:gpt-3.5-turbo-0613:personal::8AsbDlUd",
            prompt,
            0.4,
            150,
        );

        return description;
    }

    // 해당 플랫폼의 장르 키워드 전부 gpt에게 요청 후 텍스트 파일에 저장
    async initGenreKeyword(service: string) {
        const filePath = path.join(GENRE_FOLDER, `${service}Genre.json`);
        const writePath = path.join(GENRE_FOLDER, `${service}Genre.txt`);
        const keywords: string[] = require(filePath);
        let initContent = "";

        for (let keyword of keywords) {
            const genre = await this.getGenre({ keyword });
            if (genre) continue;

            const description = await this.getKeywordDescription(keyword);

            const content = `${keyword}\n##\n${description}\n#######\n`;
            initContent += content;
            console.log(content);
            await fs.writeFileSync(writePath, initContent, { encoding: "utf-8" });

            await this.createGenre({ keyword, service, description });
        }

        await fs.writeFileSync(writePath, initContent, { encoding: "utf-8" });
    }

    // initKeyword 메서드로 생성된 텍스트 파일 수정후 DB 업데이트 
    async updateGenreDescription(service: string): Promise<void> {
        // 수정된 파일에서 장르 및 의미 읽어오기
        const filePath = path.join(GENRE_FOLDER, `${service}Genre.txt`);
        const readContent = await fs.readFileSync(filePath, { encoding: "utf-8" });
        let contents = readContent
            .toString()
            .replaceAll("\r\n", "")
            .replaceAll("\n", "")
            .replaceAll(".", "")
            .split("#######");
        contents = contents.slice(0, contents.length - 1);

        // 읽어온 데이터로 db 업데이트 하기
        const genreDescription: { [genre: string]: string } = {};
        for (let content of contents) {
            const keyword = content.split("##")[0];
            const description = content.split("##")[1];
            genreDescription[keyword] = description;

            // 새로 추가된 키워드는 db에 저장하기
            const genre = await this.getGenre({ keyword });
            if (!genre) {
                await this.createGenre({
                    keyword,
                    service,
                    description,
                });
                continue;
            }

            await this.updateGenre({ keyword, service, description });
        }

        // 읽어온 데이터에서 삭제된 장르는 db에서 삭제하기
        const genres = await this.getAllGenre(service);
        for (let genre of genres) {
            if (genre.keyword in genreDescription) {
                continue;
            } else {
                await this.deleteGenre({ keyword: genre.keyword, service });
            }
        }
    }

    async updateGenreEmbedding(service: string) {
        const genres = await this.getAllGenre(service);

        for (let genre of genres) {
            const { keyword, service, description } = genre;
            const embVector = await this.openaiService.createEmbedding(description);
            const embVectorText = await JSON.stringify(embVector);

            await this.updateGenre({
                keyword,
                service,
                embVector: embVectorText,
            });
        }
    }

    // service의 장르 키워드를 referService의 장르 키워드 중 유사한 것으로 변환
    async initGenreTransform(
        service: string,
        referService: string,
    ): Promise<{ [keyword: string]: string }> {
        // 각 플랫폼의 장르 불러오기
        const genres = await this.getAllGenre(service);
        const referGenres = await this.getAllGenre(referService);
        let result: { [keyword: string]: string } = {};


        for (let genre of genres) {
            // 벡터간의 코사인 유사도는 -1 ~ 1 사이, 따라서 최솟값은 -1로 초기화
            let maxSimilarity = -1;
            let similarKeyword = "";
            for (let referGenre of referGenres) {
                // 코사인 유사도 최댓값 찾기(가장 비슷한 단어 찾기)
                const embVector: number[] = await JSON.parse(genre.embVector);
                const referEmbVector: number[] = await JSON.parse(referGenre.embVector);

                const similarity = await this.openaiService.calcSimilarityFromEmbedding(
                    embVector,
                    referEmbVector,
                );

                if (similarity && maxSimilarity < similarity) {
                    maxSimilarity = similarity;
                    similarKeyword = referGenre.keyword;
                }
            }

            // DB업데이트
            if (similarKeyword) {
                await this.updateGenre({
                    keyword: genre.keyword,
                    service: genre.service,
                    transformed: similarKeyword,
                });
                result[genre.keyword] = similarKeyword;
            }
        }

        return result;
    }

    // initGenreTransform 메서드로 초기화된 transform이 수정된 후 DB 업데이트
    async updateGenreTransformForFile(service: string) {
        let transform: { [keyword: string]: string };
        try {
            const filePath = path.join(TRANSOFRM_FOLDER, `${service}GenreTransform.json`);
            transform  = require(filePath);
        } catch (e) {
            console.log(e);
            throw new NotFoundException(`${service} 변환 파일이 존재하지 않습니다.`);
        }
        

        // 읽어온 데이터로 db 업데이트 하기
        for (let keyword of Object.keys(transform)) {
            const transformed = transform[keyword];

            const genre = await this.getGenre({ keyword });
            if (!genre) {
                console.log(`${keyword} is not exist.`);
                continue;
            }

            await this.updateGenre({ keyword, service, transformed });
        }

        // 읽어온 데이터에서 삭제된 장르는 db에서 삭제하기
        const genres = await this.getAllGenre(service);
        for (let genre of genres) {
            if (genre.keyword in transform) {
                continue;
            } else {
                await this.deleteGenre({ keyword: genre.keyword, service });
            }
        }
    }

    async updateWebtoonCategoryForTransform(service: string) {
        // 변환 파일 불러오기
        const filePath = path.join(TRANSOFRM_FOLDER, `${service}CategoryTransform.json`);
        const categoryTransform: { [category: string]: string } = require(filePath);

        // 해당 플랫폼 웹툰 전부 불러오기
        const webtoons = await this.webtoonService.getAllWebtoonForOption({ service });

        for (let webtoon of webtoons) {
            const { id, category } = webtoon;
            const genres = JSON.parse(webtoon.genres);
            
            let updateDto: UpdateWebtoonDto = { id };

            // 카테고리 변환
            if (category in categoryTransform) {
                const newCategory = categoryTransform[category];

                updateDto.category = newCategory;

                // 카테고리가 드라마일 경우 기존의 카테고리를 장르에 더한다.
                if (newCategory === "드라마" && !genres.includes(category)) {
                    const newGenres = [category, ...genres];
                    updateDto.genres = JSON.stringify(newGenres);
                    updateDto.genreCount = newGenres.length;
                    console.log(`${category} => ${newGenres}`);
                }

                // DB업데이트
                await this.webtoonService.updateWebtoonForOption(updateDto);

                console.log(`카테고리 ${category} => ${newCategory} 변환 완료`);
            } else {
                console.log(`카테고리 ${category} 유지`);
            }
        }
    }    

    // Transform 파일을 통해 해당 서비스의 웹툰 장르 변환 및 삭제
    async updateWebtoonGenreForTransform(service: string, referService: boolean) {
        const webtoons = await this.webtoonService.getAllWebtoonForOption({ service });

        for (let webtoon of webtoons) {
            let keywords: string[] = JSON.parse(webtoon.genres);
            let updateDto: UpdateWebtoonDto = { id: webtoon.id };

            for (let [idx, keyword] of keywords.entries()) {
                console.log(idx, keyword);
                const genre = await this.getGenre({ keyword });

                // 네이버의 로판 키워드일 경우 카테고리로 바꾸고 장르는 삭제
                if (keyword === "로판" && service === "naver") {
                    keywords[idx] = "delete";
                    updateDto.category = "로판";
                    continue;
                }

                // 장르 키워드가 DB에 없다면 삭제
                if ( !genre || ( !referService && genre && genre.service !== service )) {
                    console.log(`장르 키워드 ${keyword} 삭제 완료`);
                    keywords[idx] = "delete";
                    continue;
                }

                // 장르 변환
                if (genre.transformed) {
                    keywords[idx] = genre.transformed;
                    console.log(`장르 키워드 ${keyword} => ${genre.transformed} 변환 완료`);
                } else {
                    continue;
                }
            }

            // 장르 삭제 및 개수 다시 카운트
            keywords = keywords.filter((keyword) => { return keyword !== "delete" });
            const genreCount = keywords.length;
            console.log(keywords);

            // 변경사항에 저장
            updateDto.genres = JSON.stringify(keywords);
            updateDto.genreCount = genreCount;
            

            // DB 장르 및 장르 개수 업데이트
            await this.webtoonService.updateWebtoonForOption(updateDto);
        }
    }
}
