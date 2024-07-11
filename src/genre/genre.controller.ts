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
import { GenreService } from "./genre.service";
import { Auth } from "src/auth/decorators/auth.decorator";
import { IdValidationPipe } from "src/pipes/id.validation.pip";
import { CreateGenreDto } from "./dto/createGenre.dto";

@Controller("genres")
export class GenreController {
  constructor(private readonly genreService: GenreService) {}

  /* Public routes */

  @Get("by-slug/:slug")
  async getGenreBySlug(@Param("slug") slug: string) {
    return await this.genreService.getBySlug(slug);
  }

  @Get("/collections")
  async getCollections() {
    return this.genreService.getCollections();
  }

  @Get()
  async getAllGenres(@Query("searchTerm") searchTerm?: string) {
    return await this.genreService.getAll(searchTerm);
  }

  /* Admin routes */

  @Get(":id")
  @Auth("admin")
  async getGenreById(@Param("id", IdValidationPipe) _id: string) {
    return await this.genreService.getById(_id);
  }

  @UsePipes(new ValidationPipe())
  @Put(":id")
  @HttpCode(HttpStatus.OK)
  @Auth("admin")
  async update(
    @Param("id", IdValidationPipe) _id: string,
    @Body() dto: CreateGenreDto,
  ) {
    return await this.genreService.update(_id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @Auth("admin")
  async delete(@Param("id", IdValidationPipe) _id: string) {
    return await this.genreService.delete(_id);
  }

  @UsePipes(new ValidationPipe())
  @Post()
  @HttpCode(HttpStatus.OK)
  @Auth("admin")
  async create() {
    return this.genreService.create();
  }
}
