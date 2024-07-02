import {
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { FileService } from "./file.service";
import { Auth } from "src/auth/decorators/auth.decorator";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("files")
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @Auth("admin")
  @UseInterceptors(FileInterceptor("image"))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query("folder") folder?: string,
  ) {
    return this.fileService.saveFiles([file], folder);
  }
}
