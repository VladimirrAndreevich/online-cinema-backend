import { Injectable, NotFoundException } from "@nestjs/common";
import { GenreModel } from "./genre.model";
import { ModelType } from "@typegoose/typegoose/lib/types";
import { InjectModel } from "nestjs-typegoose";
import { CreateGenreDto } from "./dto/createGenre.dto";

@Injectable()
export class GenreService {
  constructor(
    @InjectModel(GenreModel) private readonly genreModel: ModelType<GenreModel>,
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
    return this.genreModel.findOne({ slug }).exec();
  }

  async getCollections() {
    const genres = await this.getAll();
    const collections = genres; /* TODO add getting collections */
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
