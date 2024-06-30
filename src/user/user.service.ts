import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "nestjs-typegoose";
import { UserModel } from "./user.model";
import { ModelType } from "@typegoose/typegoose/lib/types";
import { UpdateUserDto } from "./dto/updateUser.dto";
import { genSalt, hash } from "bcryptjs";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserModel) private readonly UserModel: ModelType<UserModel>,
  ) {}

  async getById(_id: string) {
    const user = await this.UserModel.findById(_id);

    if (!user) {
      throw new NotFoundException("User not found");
    }

    return user;
  }

  async updateProfile(_id: string, dto: UpdateUserDto) {
    const user = await this.getById(_id);
    const userWithSameEmail = await this.UserModel.findOne({
      email: dto.email,
    });

    if (userWithSameEmail && String(_id) !== String(userWithSameEmail._id)) {
      throw new NotFoundException("Email is busy!");
    }

    if (dto.password) {
      const salt = await genSalt(9);
      user.password = await hash(dto.password, salt);
    }

    user.email = dto.email;
    if (dto.isAdmin !== undefined) {
      user.isAdmin = dto.isAdmin;
    }

    await user.save();
    return;
  }

  async getCount() {
    return this.UserModel.find().count().exec();
  }

  async getAll(searchTerm?: string) {
    let options = {};
    if (searchTerm) {
      options = {
        $or: [
          {
            email: new RegExp(searchTerm, "i"),
          },
        ],
      };
    }
    return this.UserModel.find(options)
      .select("-password -updatedAt -__v")
      .sort({ createdAt: "desc" })
      .exec();
  }

  async deleteUser(_id: string) {
    return this.UserModel.findByIdAndDelete(_id).exec();
  }
}
