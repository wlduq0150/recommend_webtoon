import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDataDto, UpdateUserDataDto } from 'src/dto/user.dto';
import { JwtAccessTokenGuard } from 'src/auth/guard/accessToken.guard';

@Controller('user')
export class UserController {

    constructor(private readonly userService: UserService) {}

    @UseGuards(JwtAccessTokenGuard)
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
