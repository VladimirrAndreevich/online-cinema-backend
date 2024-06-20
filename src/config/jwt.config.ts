import { ConfigService } from "@nestjs/config";

export const getJWTConfig = async (configService: ConfigService) => ({
  secret: configService.get("JWT_SECRET"),
});
