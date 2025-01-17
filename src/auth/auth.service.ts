import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { ModelType } from "@typegoose/typegoose/lib/types";
import { InjectModel } from "nestjs-typegoose";
import { UserModel } from "src/user/user.model";
import { AuthDto } from "./dto/auth.dto";
import { hash, genSalt, compare } from "bcryptjs";
import { JwtService } from "@nestjs/jwt";
import { RefreshTokenDto } from "./dto/refreshToken.dto";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel) private readonly userModel: ModelType<UserModel>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: AuthDto) {
    const oldUser = await this.userModel.findOne({ email: dto.email });
    if (oldUser) {
      throw new BadRequestException(
        "User with this email is already in the system",
      );
    }

    const salt = await genSalt(9);
    const userPassword = await hash(dto.password, salt);

    const newUser = new this.userModel({
      email: dto.email,
      password: userPassword,
    });

    const user = await newUser.save();
    const tokens = await this.generateAuthTokens(user.id);

    return {
      user: this.getUserFields(user),
      ...tokens,
    };
  }

  async login(dto: AuthDto) {
    const user = await this.validateUser(dto);

    const tokens = await this.generateAuthTokens(user.id);

    return {
      user: this.getUserFields(user),
      ...tokens,
    };
  }

  async validateUser(dto: AuthDto): Promise<UserModel> {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) {
      throw new UnauthorizedException("User not found");
    }

    const isValidPassword = await compare(dto.password, user.password);
    if (!isValidPassword) {
      throw new UnauthorizedException("Invalid password");
    }
    return user;
  }

  async generateAuthTokens(userId: string) {
    const dataPayload = { _id: userId };

    const refreshToken = await this.jwtService.signAsync(dataPayload, {
      expiresIn: "15d",
    });

    const accessToken = await this.jwtService.signAsync(dataPayload, {
      expiresIn: "1h",
    });

    return { refreshToken, accessToken };
  }

  getUserFields(user: UserModel) {
    return {
      _id: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
    };
  }

  async getNewTokens({ refreshToken }: RefreshTokenDto) {
    if (!refreshToken) {
      throw new UnauthorizedException("Please provide a valid token.");
    }

    const payload = await this.jwtService.verifyAsync(refreshToken);
    if (!payload) {
      throw new UnauthorizedException("Invalid token or expired!");
    }

    const user = await this.userModel.findById(payload._id);

    const tokens = await this.generateAuthTokens(user.id);

    return {
      user: this.getUserFields(user),
      ...tokens,
    };
  }
}
