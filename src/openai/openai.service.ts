import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChatCompletionMessageParam, FileObject, FineTune } from "openai/resources";
import {
    OPENAI_COMPLETION_3_5_MODEL,
    OPENAI_EMBEDDING_MODEL,
    OPENAI_FINETUNE_3_5_MODEL,
    OPENAI_JSONL_FOLDER_PATH,
    OPENAI_JSON_FOLDER_PATH,
} from "src/constatns/openai.constants";
import { FineTuningJob } from "openai/resources/fine-tuning/jobs";

import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";
import { CreateFineTuneModelDto } from "src/dto/openai.dto";

@Injectable()
export class OpenaiService {

    private openai: OpenAI;

    constructor(
        private readonly configService: ConfigService,
    ) {
        const API_KEY: string = configService.get<string>("OPENAI_API_KEY");
        const configuration = { apiKey: API_KEY };
        this.openai = new OpenAI(configuration);
    }

    // 3.5버전 미만의 모델의 completion 요청
    async createCompletion(
        model: string,
        prompt: string,
        temperature: number,
        max_tokens: number,
    ): Promise<string> {
        try {
            const params: OpenAI.CompletionCreateParams = {
                model: model ? model : OPENAI_COMPLETION_3_5_MODEL,
                prompt,
                temperature,
                max_tokens,
            };

            const completion = await this.openai.completions.create(params);

            return completion.choices[0].text;
        } catch (err) {
            if (err instanceof OpenAI.APIError) {
                console.log(err.status);
                console.log(err.name);
                console.log(err.headers);
            } else {
                throw err;
            }
        }
    }

    create_3_5_PromptMessage(systemMessage: string, userMessage: string) {
        const prompt: ChatCompletionMessageParam[] = [
            { role: "system", content: systemMessage },
            { role: "user", content: userMessage }
        ];

        return prompt;
    }

    // 3.5버전 이상 모델의 completion 요청
    async create_3_5_Completion(
        model: string,
        prompt: ChatCompletionMessageParam[],
        temperature: number,
        maxTokens: number,
    ): Promise<string> {
        try {
            const params: OpenAI.Chat.ChatCompletionCreateParams = {
                model: model ? model : OPENAI_COMPLETION_3_5_MODEL,
                messages: prompt,
                temperature,
                max_tokens: maxTokens,
            };

            const completion = await this.openai.chat.completions.create(params);
            
            return completion.choices[0].message.content;
        } catch (err) {
            if (err instanceof OpenAI.APIError) {
                console.log(err.status);
                console.log(err.name);
                console.log(err.headers);
            } else {
                throw err;
            }
        }
    }

    // 단어, 문장을 embedding 수치 벡터화
    async createEmbedding(input: string): Promise<number[]> {
        try {
            const response = await this.openai.embeddings.create({
                model: OPENAI_EMBEDDING_MODEL,
                input,
            });

            const embedding = response.data[0]?.embedding;

            return embedding;
        } catch (err) {
            if (err instanceof OpenAI.APIError) {
                console.log(err.status);
                console.log(err.name);
                console.log(err.headers);
            } else {
                throw err;
            }
        }
    }

    // embedding 벡터간의 거리를 구해서 유사도를 구한다.
    calcSimilarityFromEmbedding(
        embVector1: number[],
        embVector2: number[]
    ): number {
        // const n: number = (
        //     (embVector1.length !== embVector2.length) ? (
        //         embVector1.length < embVector2.length ? embVector1.length : embVector2.length
        //     ) : ( embVector1.length )
        // );
        
        // let similarity: number = 0;
    
        // for (let i = 0; i < n; i++) {
        //     similarity += (embVector1[i] - embVector2[i]) ** 2;
        // }
        // similarity = Math.sqrt(similarity);
        if (embVector1.length !== embVector2.length) {
            throw new Error("Vector dimensions do not match.");
        }

        let dotProduct = 0;
        let magnitude1 = 0;
        let magnitude2 = 0;

        for (let i = 0; i < embVector1.length; i++) {
            dotProduct += embVector1[i] * embVector2[i];
            magnitude1 += embVector1[i] ** 2;
            magnitude2 += embVector2[i] ** 2;
        }

        magnitude1 = Math.sqrt(magnitude1);
        magnitude2 = Math.sqrt(magnitude2);

        const similarity = dotProduct / (magnitude1 * magnitude2);

        return similarity;
    }

    // openai fine-tuning을 위한 file(jsonl) 업로드
    async createFileUpload(path: string): Promise<FileObject> {
        if (path.split(".").pop() !== "jsonl") {
            throw new BadRequestException("Upload File's type must be jsonl..");
        }

        const file = fs.createReadStream(path);
        const upload = await this.openai.files.create({
            file,
            purpose: "fine-tune",
        });
        return upload;
    }

    // 업로드된 파일을 미세조정 작업 요청
    async createFineTuneModel(createFineTuneModelDto: CreateFineTuneModelDto): Promise<FineTuningJob> {
        const { fileId, model } = createFineTuneModelDto;
        try {
            const trainingFile = fileId;
            const trainingModel = model ? model : OPENAI_FINETUNE_3_5_MODEL;

            const fineTune = await this.openai.fineTuning.jobs.create({
                training_file: trainingFile,
                model: trainingModel,
                hyperparameters: { n_epochs: 4 },
            });

            return fineTune;
        } catch (e) {
            if (e instanceof OpenAI.APIError) {
                console.log(e.status);
                console.log(e.name);
                console.log(e.headers);
                console.log(e);
            } else {
                throw e;
            }
        }
    }

    // 업로드 파일 목록 불러오기
    async getUploadFileList(): Promise<FileObject[]> {
        const uploadFileData = await this.openai.files.list();
        const uploadFileList = uploadFileData.data;
        return uploadFileList;
    }

    // 미세조정 중인 작업 불러오기
    async getFineTuningList(): Promise<FineTuningJob[]> {
        const fineTuningData = await this.openai.fineTuning.jobs.list();
        const fineTuningList = fineTuningData.data;
        return fineTuningList;
    }

    // 미세조정 완료된 모델 불러오기
    async getFineTuneList(): Promise<FineTune[]> {
        const fineTuneData = await this.openai.fineTunes.list();
        const fineTuneList = fineTuneData.data;
        return fineTuneList;
    }

    // 업로드된 파일 삭제
    async deleteUploadFile(id: string): Promise<void> {
        try {
            await this.openai.files.del(id);
        } catch (e) {
            if (e instanceof OpenAI.APIError) {
                console.log(e.status);
                console.log(e.name);
                console.log(e.headers);
            } else {
                throw e;
            }
        }
    }

    // 진행중인 미세조정 작업 취소
    async cancleFineTuning(id: string): Promise<void> {
        try {
            await this.openai.fineTuning.jobs.cancel(id);
        } catch (e) {
            if (e instanceof OpenAI.APIError) {
                console.log(e.status);
                console.log(e.name);
                console.log(e.headers);
            } else {
                throw e;
            }
        }
    }

    // json 파일은 jsonl파일로 변환
    transformToJsonl(filename: string): void {
        const filePath = path.join(OPENAI_JSON_FOLDER_PATH, filename);
        const writePath = path.join(OPENAI_JSONL_FOLDER_PATH, path.basename(filePath, ".json") + ".jsonl");
        let jsonlData: string = "";

        const arr: any[] = require(filePath);
        arr.forEach((data) => {
            jsonlData += JSON.stringify(data) + "\n";
        });

        fs.writeFileSync(
            writePath,
            jsonlData,
            { encoding: "utf-8" },
        );
    }
}
