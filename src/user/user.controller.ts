import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDataDto, UpdateUserDataDto } from 'src/dto/user.dto';

@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) {}

    @Get(":id")
    getUser(@Param("id") userId: string) {
        return this.userService.getUser(userId);
    }

    @Get("/:id/readWebtoons")
    getUserReadWebtoons(@Param("id") userId: string) {
        return this.userService.getUserReadWebtoonIds(userId);
    }

    @Post("newUser")
    createUser(@Body() createUserDataDto: CreateUserDataDto) {
        return this.userService.createUser(createUserDataDto);
    }

    @Patch("updateUser")
    updateUser(@Body() updateUserDataDto: UpdateUserDataDto) {
        return this.userService.updateUser(updateUserDataDto);
    }

    @Delete(":id")
    deleteUser(@Param("id") userId: string) {
        return this.userService.deleteUser(userId);
    }
}
