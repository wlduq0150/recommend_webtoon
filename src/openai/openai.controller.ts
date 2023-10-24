import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { OPENAI_JSONL_FOLDER_PATH } from 'src/constatns/openai.constants';
import { CreateFileUploadDto, CreateFineTuneModelDto, Create_3_5_CompletionDto } from 'src/dto/openai.dto';

import * as path from "path";

@Controller('openai')
export class OpenaiController {

    constructor(private readonly openaiService: OpenaiService) {}

    @Get("transformToJsonl/:filename")
    transformToJsonl(@Param("filename") filename: string) {
        return this.openaiService.transformToJsonl(filename);
    }

    @Get("fileUploadList")
    getUploadFileList() {
        return this.openaiService.getUploadFileList();
    }

    @Get("fineTuningList")
    getFineTuningList() {
        return this.openaiService.getFineTuningList(); 
    }
    
    @Get("fineTuneList")
    getFineTuneList() {
        return this.openaiService.getFineTuneList();
    }

    @Post("completion")
    async create_3_5_Completion(@Body() create_3_5_CompletionDto: Create_3_5_CompletionDto) {
        const { model, userMessage, systemMessage, temperature, maxTokens } = create_3_5_CompletionDto;
        const prompt = this.openaiService.create_3_5_PromptMessage(systemMessage, userMessage);
        return this.openaiService.create_3_5_Completion(
            model,
            prompt,
            temperature,
            maxTokens
        );
    }

    @Post("fileUpload")
    async createFileUpload(@Body() createFileUploadDto: CreateFileUploadDto) {
        const filePath = path.join(OPENAI_JSONL_FOLDER_PATH, createFileUploadDto.filename);
        return this.openaiService.createFileUpload(filePath);
    }

    @Post("fineTuning")
    async createFineTuneModel(@Body() createFineTuneModelDto: CreateFineTuneModelDto) {
        return this.openaiService.createFineTuneModel(createFineTuneModelDto);
    }
}
