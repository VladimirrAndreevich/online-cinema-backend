import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { UserService } from "./user.service";
import { Auth } from "src/auth/decorators/auth.decorator";
import { User } from "./decorators/user.decorator";
import { UpdateUserDto } from "./dto/updateUser.dto";
import { IdValidationPipe } from "src/pipes/id.validation.pip";
import { Types } from "mongoose";
import { UserModel } from "./user.model";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get("profile")
  @Auth()
  async getProfile(@User("_id") _id: string) {
    return this.userService.getById(_id);
  }

  @UsePipes(new ValidationPipe())
  @Put("profile")
  @HttpCode(HttpStatus.OK)
  @Auth()
  async updateProfile(@User("_id") _id: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateProfile(_id, dto);
  }

  @Get("profile/favorites")
  @HttpCode(HttpStatus.OK)
  @Auth()
  async getFavorites(@User("_id") _id: Types.ObjectId) {
    return this.userService.getFavoritesMovies(_id);
  }

  @Patch("profile/favorites")
  @HttpCode(HttpStatus.OK)
  @Auth()
  async toggleFavorites(
    @Body("movieId", IdValidationPipe) movieId: Types.ObjectId,
    @User() user: UserModel,
  ) {
    return this.userService.toggleFavorites(movieId, user);
  }

  @UsePipes(new ValidationPipe())
  @Put(":id")
  @HttpCode(HttpStatus.OK)
  @Auth("admin")
  async updateUser(
    @Param("id", IdValidationPipe) _id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateProfile(_id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @Auth("admin")
  async deleteUser(@Param("id", IdValidationPipe) _id: string) {
    return this.userService.deleteUser(_id);
  }

  @Get("count")
  @Auth("admin")
  async getCountUsers() {
    return this.userService.getCount();
  }

  @Get()
  @Auth("admin")
  async getUsers(@Query("searchTerm") searchTerm?: string) {
    return this.userService.getAll(searchTerm);
  }

  @Get(":id")
  @Auth("admin")
  async getUser(@Param("id", IdValidationPipe) _id: string) {
    return this.userService.getById(_id);
  }
}
