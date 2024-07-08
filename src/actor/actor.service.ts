import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "nestjs-typegoose";
import { ActorModel } from "./actor.model";
import { ModelType } from "@typegoose/typegoose/lib/types";
import { ActorDto } from "./actor.dto";

@Injectable()
export class ActorService {
  constructor(
    @InjectModel(ActorModel) private readonly actorModel: ModelType<ActorModel>,
  ) {}

  async getBySlug(slug: string) {
    const doc = await this.actorModel.findOne({ slug }).exec();

    if (!doc) {
      throw new NotFoundException("Actor not found!");
    }

    return doc;
  }

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
        ],
      };

      // TODO add aggregation
    }
    return this.actorModel
      .aggregate()
      .match(options)
      .lookup({
        from: "Movie",
        localField: "_id",
        foreignField: "actors",
        as: "movies",
      })
      .addFields({
        countMovies: {
          $size: "$movies",
        },
      })
      .project({ __v: 0, updatedAt: 0, movies: 0 })
      .sort({ createdAt: -1 })
      .exec();
  }

  /* Admin methods */

  async getById(_id: string) {
    const actor = await this.actorModel.findById(_id);

    if (!actor) {
      throw new NotFoundException("Actor not found");
    }

    return actor;
  }

  async create() {
    const defaultValue: ActorDto = {
      name: "",
      slug: "",
      photo: "",
    };

    const actor = await this.actorModel.create(defaultValue);
    return actor._id;
  }

  async update(_id: string, dto: ActorDto) {
    const updatedActor = await this.actorModel
      .findByIdAndUpdate(_id, dto, {
        new: true,
      })
      .exec();

    if (!updatedActor) {
      throw new NotFoundException("Actor not found!");
    }

    return updatedActor;
  }

  async delete(_id: string) {
    const deletedActor = this.actorModel.findByIdAndDelete(_id).exec();

    if (!deletedActor) {
      throw new NotFoundException("Actor not found!");
    }

    return deletedActor;
  }
}
