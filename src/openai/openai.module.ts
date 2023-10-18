import { Module } from '@nestjs/common';
import { OpenaiService } from './openai.service';
import { OpenaiController } from './openai.controller';

@Module({
  exports: [OpenaiService],
  controllers: [OpenaiController],
  providers: [OpenaiService]
})
export class OpenaiModule {}
