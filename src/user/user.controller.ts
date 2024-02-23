import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDataDto, UpdateUserDataDto } from "src/dto/user.dto";
import { JwtAccessTokenGuard } from "src/auth/guard/accessToken.guard";
import { UserId } from "src/auth/decorators/userId.decorator";

@Controller("user")
export class UserController {
    constructor(private readonly userService: UserService) {}

    @UseGuards(JwtAccessTokenGuard)
    @Get("me")
    async getMyInfo(@UserId() userId: number) {
        const user = await this.userService.getUserById(userId);
        const transformedUser = {
            id: user.id,
            email: user.email,
            name: user.name,
            age: user.age,
            sex: user.sex,
            address: user.address,
        };
        return transformedUser;
    }

    @UseGuards(JwtAccessTokenGuard)
    @Get(":id")
    async getUser(@Param("id") userId: number) {
        const user = await this.userService.getUserById(userId);
        const transformedUser = {
            email: user.email,
            name: user.name,
            age: user.age,
            sex: user.sex,
            address: user.address,
        };
        return transformedUser;
    }

    @Get("/:id/readWebtoons")
    getUserReadWebtoons(@Param("id") userId: number) {
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
    deleteUser(@Param("id") userId: number) {
        return this.userService.deleteUser(userId);
    }
}
