import { IsBoolean, IsEmail, IsString, MinLength } from "class-validator";

export class UpdateUserDto {
  @IsEmail()
  email: string;

  password?: string;

  isAdmin?: boolean;
}
