import { IsString } from "class-validator";

export class RefreshTokenDto {
  @IsString({
    message: "You did not pass refresh token here or it's not a string",
  })
  refreshToken: string;
}
