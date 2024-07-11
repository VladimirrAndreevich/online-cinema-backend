import { Module } from "@nestjs/common";
import { RatingService } from "./rating.service";
import { RatingController } from "./rating.controller";
import { TypegooseModule } from "nestjs-typegoose";
import { MovieModule } from "src/movie/movie.module";
import { RatingModel } from "./rating.model";

@Module({
  imports: [
    TypegooseModule.forFeature([
      {
        typegooseClass: RatingModel,
        schemaOptions: {
          collection: "Rating",
        },
      },
    ]),
    MovieModule,
  ],
  controllers: [RatingController],
  providers: [RatingService],
})
export class RatingModule {}
