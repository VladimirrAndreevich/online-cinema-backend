import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { MovieService } from "./movie.service";
import { IdValidationPipe } from "src/pipes/id.validation.pip";
import { Types } from "mongoose";
import { Auth } from "src/auth/decorators/auth.decorator";
import { UpdateMovieDto } from "./dto/updateMovie.dto";

@Controller("movies")
export class MovieController {
  constructor(private readonly movieService: MovieService) {}

  /* Public routes */

  @Get("by-slug/:slug")
  async getBySlug(@Param("slug") slug: string) {
    return await this.movieService.getBySlug(slug);
  }

  @Get("by-actor/:actorId")
  async getByActor(
    @Param("actorId", IdValidationPipe) actorId: Types.ObjectId,
  ) {
    return await this.movieService.getByActor(actorId);
  }

  @UsePipes(new ValidationPipe())
  @Post("by-genres")
  @HttpCode(HttpStatus.OK)
  async getByGenres(@Body("genresIds") genresIds: Types.ObjectId[]) {
    return await this.movieService.getByGenres(genresIds);
  }

  @Get()
  async getAll(@Query("searchTerm") searchTerm?: string) {
    return await this.movieService.getAll(searchTerm);
  }

  @Get("most-popular")
  async getMostPopular() {
    return await this.movieService.getMostPopular();
  }

  @Patch("update-count-opened")
  @HttpCode(HttpStatus.OK)
  async updateCountOpened(@Body("slug") slug: string) {
    return await this.movieService.updateCountOpened(slug);
  }

  /* Admin routes */

  @Get(":id")
  @Auth("admin")
  async getById(@Param("id", IdValidationPipe) _id: string) {
    return this.movieService.getById(_id);
  }

  @UsePipes(new ValidationPipe())
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Auth("admin")
  async create() {
    return this.movieService.create();
  }

  @UsePipes(new ValidationPipe())
  @Put(":id")
  @HttpCode(HttpStatus.OK)
  @Auth("admin")
  async update(
    @Param("id", IdValidationPipe) _id: string,
    @Body() dto: UpdateMovieDto,
  ) {
    return await this.movieService.update(_id, dto);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  @Auth("admin")
  async delete(@Param("id", IdValidationPipe) _id: string) {
    return await this.movieService.delete(_id);
  }
}
