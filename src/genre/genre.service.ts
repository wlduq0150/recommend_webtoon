import { Inject, Injectable } from '@nestjs/common';
import { OpenaiService } from 'src/openai/openai.service';
import { WebtoonService } from 'src/webtoon/webtoon.service';

import * as fs from "fs";
import * as path from "path";
import { GENRE_FOLDER } from 'src/constatns/genre.constants';
import { Genre } from 'src/sequelize/entity/genre.model';
import { ChatCompletionMessageParam } from 'openai/resources';
import { CreateGenreDto, DeleteGenreDto, GetGenreDto, UpdateGenreDto } from 'src/dto/genre.dto';
import { OPENAI_JSONL_FOLDER_PATH } from 'src/constatns/openai.constants';

@Injectable()
export class GenreService {

    constructor(
        @Inject("GENRE") private genreModel: typeof Genre,
        private readonly webtoonService: WebtoonService,
        private readonly openaiService: OpenaiService
    ) {}

    // 모든 keyword 불러오기
    async getAllGenre(service?: string): Promise<Genre[]> {
        const genres = await this.genreModel.findAll({
            where: { service: service ? service : ["kakao", "naver"] }
        });
        return genres;
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
            ...createGenreDto
        });
    };

    // 장르의 변환된 데이터만만 데이터베이스 업데이트
    async updateGenre(updateGenreDto: UpdateGenreDto) {
        const { keyword, service } = updateGenreDto;

        const genre = await this.getGenre({
            keyword: updateGenreDto.keyword, 
            service: updateGenreDto.service
        });
        if (genre) return;

        await this.genreModel.update({
            ...updateGenreDto
        }, {
            where: { keyword, service }
        });
    }

    async deleteGenre(deleteGenreDto: DeleteGenreDto) {
        const { keyword } = deleteGenreDto;

        const genre = await this.getGenre({ keyword });
        if (!genre) return;

        await this.genreModel.destroy({
            where: { keyword }
        });
    }

    async getKeywordDescription(keyword: string): Promise<string> {
        const prompt: ChatCompletionMessageParam[] = [
            { role: "system", "content": "너는 웹툰의 장르 키워드와 그 뜻을 알고있는 전문가야."},
            { role: "user", "content": `장르 키워드 ${keyword}의 뜻이 뭐야?`},
        ];

        const description = await this.openaiService.create_3_5_Completion(
            "ft:gpt-3.5-turbo-0613:personal::8AsbDlUd",
            prompt,
            0.2,
            150
        )

        return description;
    }

    async initKeyword(service: string) {
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

    async updateDescription(service: string): Promise<void> {
        // 수정된 파일에서 장르 및 의미 읽어오기
        const filePath = path.join(GENRE_FOLDER, `${service}Genre.txt`);
        const readContent = await fs.readFileSync(filePath, { encoding: "utf-8" });
        let contents = readContent
            .toString()
            .replaceAll("\r\n", "")
            .replaceAll("\n", "")
            .replaceAll(".", "")
            .split("#######");
        contents = contents.slice(0, contents.length-1);

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
                    description
                });
                continue;
            }

            await this.updateGenre({ keyword, service, description });
        }

        // 읽어온 데이터에서 삭제된 장르는 db에서 삭제하기
        const genres = await this.getAllGenre();
        for (let genre of genres) {
            if (genre.keyword in genreDescription) {
                continue;
            } else {
                await this.deleteGenre({ keyword: genre.keyword });
            }
        }
    }

    async createKeywordFineTuningPrompt(service: string) {
        const genres = await this.getAllGenre(service);
        let jsonlData = "";

        for (let genre of genres) {
            const systemMessage = `너는 웹툰의 장르 키워드와 그 뜻을 알고있는 전문가야.`;
            const userMessage = `장르 키워드 "${genre.keyword}"의 뜻이 뭐야?`;
            const assistMessage = genre.description;

            const messagesData: ChatCompletionMessageParam[] = [
                { role: "system", content: systemMessage },
                { role: "user", content: userMessage },
                { role: "assistant", content: assistMessage }
            ];

            const messages = { messages: messagesData };

            jsonlData += JSON.stringify(messages) + "\n";
        }

        const writePath = path.join(OPENAI_JSONL_FOLDER_PATH, "keywordDescription.jsonl");
        fs.writeFileSync(writePath, jsonlData, { encoding: "utf-8" });
    }

    // calcSimilarityFromEmbedding(
    //     embVector1: number[],
    //     embVector2: number[]
    // ): number {
    //     const n: number = (
    //         (embVector1.length !== embVector2.length) ? (
    //             embVector1.length < embVector2.length ? embVector1.length : embVector2.length
    //         ) : ( embVector1.length )
    //     );
        
    //     let similarity: number = 0;
    
    //     for (let i = 0; i < n; i++) {
    //         similarity += (embVector1[i] - embVector2[i]) ** 2;
    //     }
    //     similarity = Math.sqrt(similarity);
    
    //     return similarity;
    // }
}
