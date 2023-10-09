import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';

import { SequelizeModule } from '@nestjs/sequelize';
import { User } from 'src/sequelize/entity/user.model';
import { userProvider } from 'src/custom-provider/model.provider';

@Module({
  imports: [SequelizeModule.forFeature([User])],
  exports: [UserService, userProvider],
  controllers: [UserController],
  providers: [UserService, userProvider]
})
export class UserModule {}