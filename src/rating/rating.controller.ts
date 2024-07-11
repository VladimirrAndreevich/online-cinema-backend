import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { RatingService } from "./rating.service";
import { Auth } from "src/auth/decorators/auth.decorator";
import { IdValidationPipe } from "src/pipes/id.validation.pip";
import { Types } from "mongoose";
import { SetRatingDto } from "./dto/set-rating.dto";
import { User } from "src/user/decorators/user.decorator";

@Controller("ratings")
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  @UsePipes(new ValidationPipe())
  @Get("/:movieId")
  @Auth()
  @HttpCode(HttpStatus.OK)
  async getMovieValueByUser(
    @Param("movieId", IdValidationPipe) movieId: Types.ObjectId,
    @User("_id") _id: Types.ObjectId,
  ) {
    return this.ratingService.getMovieValueByUser(movieId, _id);
  }

  @UsePipes(new ValidationPipe())
  @Patch("set-rating")
  @Auth()
  @HttpCode(HttpStatus.OK)
  async setRating(@User("_id") _id: Types.ObjectId, @Body() dto: SetRatingDto) {
    return this.ratingService.setRating(_id, dto);
  }
}
