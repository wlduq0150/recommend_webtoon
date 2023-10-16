import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ChatCompletionMessageParam, FileObject, FineTune } from "openai/resources";
import { OPENAI_EMBEDDING_MODEL, OPENAI_FINETUNE_3_5_MODEL, OPENAI_FINETUNE_BABBAGE_MODEL, OPENAI_JSONL_FOLDER_PATH } from "src/constatns/openai.constants";
import { FineTuningJob } from "openai/resources/fine-tuning/jobs";

import OpenAI from "openai";
import * as fs from "fs";
import * as path from "path";



@Injectable()
export class OpenaiService {
    
    private openai: OpenAI;

    constructor(
        private readonly configService: ConfigService,
        @Inject(CACHE_MANAGER)
        private readonly cacheManager: Cache,
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
                model,
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

    // 3.5버전 이상 모델의 completion 요청
    async create_3_5_Completion(
        model: string,
        prompt: ChatCompletionMessageParam[],
        temperature: number,
        maxTokens: number,
    ): Promise<string> {
        try {
            const params: OpenAI.Chat.ChatCompletionCreateParams = {
                model,
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
    async createEmbedding(model: string, input: string): Promise<number[]> {
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

    // openai fine-tuning을 위한 file(jsonl) 업로드 
    async createFileUpload(path: string): Promise<FileObject> {
        if (path.split(".").pop() !== "jsonl") {
            throw new BadRequestException("Upload File's type must be jsonl..");
        }

        const file= fs.createReadStream(path);
        const upload = await this.openai.files.create(
            {
                file,
                purpose: "fine-tune"
            }
        );
        return upload;
    }

    // 업로드된 파일을 미세조정 작업 요청
    async createFineTuneModel(fileId: string, model ?: string): Promise<FineTuningJob> {
        try {
            const trainingFile = fileId;
            const trainingModel = model ? model : OPENAI_FINETUNE_3_5_MODEL;

            const fineTune = await this.openai.fineTuning.jobs.create(
                {
                    training_file: trainingFile,
                    model: trainingModel,
                    hyperparameters: { n_epochs: 4 }
                }
            )

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
    transformToJsonl(filePath: string): void {
        let jsonlData: string = "";

        const arr: any[] = require(filePath);
        arr.forEach((data) => {
            jsonlData += JSON.stringify(data) + "\n";
        });

        fs.writeFileSync(
            OPENAI_JSONL_FOLDER_PATH + path.basename(filePath, ".json") + ".jsonl",
            jsonlData,
            { encoding: "utf-8" }
        );
    }
}
