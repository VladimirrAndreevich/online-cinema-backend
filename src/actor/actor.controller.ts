import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { ActorService } from "./actor.service";
import { Auth } from "src/auth/decorators/auth.decorator";
import { IdValidationPipe } from "src/pipes/id.validation.pip";
import { ActorDto } from "./actor.dto";

@Controller("actors")
export class ActorController {
  constructor(private readonly actorService: ActorService) {}

  /* Public routes */

  @Get("by-slug/:slug")
  async getGenreBySlug(@Param("slug") slug: string) {
    return await this.actorService.getBySlug(slug);
  }

  @Get()
  async getAll(@Query("searchTerm") searchTerm?: string) {
    return await this.actorService.getAll(searchTerm);
  }

  /* Admin routes */

  @Get(":id")
  @Auth("admin")
  async getById(@Param("id", IdValidationPipe) _id: string) {
    return await this.actorService.getById(_id);
  }

  @UsePipes(new ValidationPipe())
  @Post()
  @HttpCode(HttpStatus.OK)
  @Auth("admin")
  async create() {
    return this.actorService.create();
  }

  @UsePipes(new ValidationPipe())
  @Put(":id")
  @HttpCode(HttpStatus.OK)
  @Auth("admin")
  async update(
    @Param("id", IdValidationPipe) _id: string,
    @Body() dto: ActorDto,
  ) {
    return await this.actorService.update(_id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @Auth("admin")
  async delete(@Param("id", IdValidationPipe) _id: string) {
    return await this.actorService.delete(_id);
  }
}
