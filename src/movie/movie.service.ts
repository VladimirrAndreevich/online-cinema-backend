import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "nestjs-typegoose";
import { MovieModel } from "./movie.model";
import { DocumentType, ModelType } from "@typegoose/typegoose/lib/types";
import { UpdateMovieDto } from "./dto/updateMovie.dto";
import { Types } from "mongoose";

@Injectable()
export class MovieService {
  constructor(
    @InjectModel(MovieModel) private readonly movieModel: ModelType<MovieModel>,
  ) {}

  async getBySlug(slug: string) {
    const doc = await this.movieModel
      .findOne({ slug })
      .populate("actors genres")
      .exec();

    if (!doc) {
      throw new NotFoundException("Movie not found!");
    }

    return doc;
  }

  async getAll(searchTerm?: string) {
    let options = {};
    if (searchTerm) {
      options = {
        $or: [
          {
            title: new RegExp(searchTerm, "i"),
          },
        ],
      };
    }
    return this.movieModel
      .find(options)
      .select("-updatedAt -__v")
      .sort({ createdAt: "desc" })
      .populate("actors genres")
      .exec();
  }

  async getByActor(actorId: Types.ObjectId) {
    const docs = await this.movieModel.find({ actors: actorId }).exec();

    if (!docs) {
      throw new NotFoundException("Movies not found!");
    }

    return docs;
  }

  async getByGenres(
    genresIds: Types.ObjectId[],
  ): Promise<DocumentType<MovieModel>[]> {
    return this.movieModel.find({ genres: { $in: genresIds } }).exec();
  }

  async updateCountOpened(slug: string) {
    const updatedMovie = await this.movieModel
      .findOneAndUpdate(
        { slug },
        {
          $inc: { countOpened: 1 },
        },
        { new: true },
      )
      .exec();

    if (!updatedMovie) {
      throw new NotFoundException("Movie not found!");
    }

    return updatedMovie;
  }

  async getMostPopular() {
    return await this.movieModel
      .find({ countOpened: { $gt: 0 } })
      .sort({ countOpened: -1 })
      .populate("genres")
      .exec();
  }

  /* Admin methods */

  async getById(_id: string) {
    const movie = await this.movieModel.findById(_id);

    if (!movie) {
      throw new NotFoundException("Movie not found");
    }

    return movie;
  }

  async create() {
    const defaultValue: UpdateMovieDto = {
      bigPoster: "",
      actors: [],
      genres: [],
      poster: "",
      title: "",
      videoUrl: "",
      slug: "",
    };

    const movie = await this.movieModel.create(defaultValue);
    return movie._id;
  }

  async update(_id: string, dto: UpdateMovieDto) {
    const updatedMovie = await this.movieModel
      .findByIdAndUpdate(_id, dto, {
        new: true,
      })
      .exec();

    if (!updatedMovie) {
      throw new NotFoundException("Movie not found!");
    }

    return updatedMovie;
  }

  async delete(_id: string) {
    const deletedMovie = this.movieModel.findByIdAndDelete(_id).exec();

    if (!deletedMovie) {
      throw new NotFoundException("Movie not found!");
    }

    return deletedMovie;
  }

  async updateRating(id: Types.ObjectId, newRating: number) {
    return this.movieModel
      .findByIdAndUpdate(
        id,
        {
          rating: newRating,
        },
        { new: true },
      )
      .exec();
  }
}
