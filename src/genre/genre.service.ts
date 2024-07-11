import { Injectable, NotFoundException } from "@nestjs/common";
import { GenreModel } from "./genre.model";
import { ModelType } from "@typegoose/typegoose/lib/types";
import { InjectModel } from "nestjs-typegoose";
import { CreateGenreDto } from "./dto/createGenre.dto";
import { MovieService } from "src/movie/movie.service";
import { ICollection } from "./genre.interface";

@Injectable()
export class GenreService {
  constructor(
    @InjectModel(GenreModel) private readonly genreModel: ModelType<GenreModel>,
    private readonly movieService: MovieService,
  ) {}

  async getAll(searchTerm?: string) {
    let options = {};
    if (searchTerm) {
      options = {
        $or: [
          {
            name: new RegExp(searchTerm, "i"),
          },
          {
            slug: new RegExp(searchTerm, "i"),
          },
          {
            description: new RegExp(searchTerm, "i"),
          },
        ],
      };
    }
    return this.genreModel
      .find(options)
      .select("-updatedAt -__v")
      .sort({ createdAt: "desc" })
      .exec();
  }

  // async getCount() {
  //   return this.genreModel.find().count().exec();
  // }

  async getBySlug(slug: string) {
    const doc = await this.genreModel.findOne({ slug }).exec();

    if (!doc) {
      throw new NotFoundException("Genre not found!");
    }

    return doc;
  }

  async getCollections(): Promise<ICollection[]> {
    const genres = await this.getAll();

    const collections = await Promise.all(
      genres.map(async (genre) => {
        const moviesByGenre = await this.movieService.getByGenres([genre._id]);

        const result: ICollection = {
          _id: String(genre._id),
          title: genre.name,
          slug: genre.slug,
          image:
            moviesByGenre.length > 0
              ? moviesByGenre[0].bigPoster
              : "/skeletonImageGenre.jpg",
        };

        return result;
      }),
    );

    return collections;
  }

  /* Admin methods */

  async create() {
    const defaultValue: CreateGenreDto = {
      name: "",
      slug: "",
      description: "",
      icon: "",
    };

    const genre = await this.genreModel.create(defaultValue);
    return genre._id;
  }

  async update(_id: string, dto: CreateGenreDto) {
    const updatedGenre = await this.genreModel
      .findByIdAndUpdate(_id, dto, {
        new: true,
      })
      .exec();

    if (!updatedGenre) {
      throw new NotFoundException("Genre not found!");
    }

    return updatedGenre;
  }

  async delete(_id: string) {
    const deletedGenre = this.genreModel.findByIdAndDelete(_id).exec();

    if (!deletedGenre) {
      throw new NotFoundException("Genre not found!");
    }

    return deletedGenre;
  }

  async getById(_id: string) {
    const genre = await this.genreModel.findById(_id);

    if (!genre) {
      throw new NotFoundException("Genre not found");
    }

    return genre;
  }
}
