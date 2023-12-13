import { Module } from '@nestjs/common';
import { UserWebtoonController } from './user-webtoon.controller';
import { UserWebtoonService } from './user-webtoon.service';
import { UserModule } from 'src/user/user.module';
import { WebtoonModule } from 'src/webtoon/webtoon.module';
import { UserWebtoonProvider } from 'src/custom-provider/model.provider';

@Module({
  imports: [UserModule, WebtoonModule],
  exports: [UserWebtoonService, UserWebtoonProvider],
  controllers: [UserWebtoonController],
  providers: [UserWebtoonService, UserWebtoonProvider]
})
export class UserWebtoonModule {}
