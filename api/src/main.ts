import "reflect-metadata";

import bodyParser from "body-parser";
import helmet from "helmet";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import type { NextFunction, Request, Response } from "express";
import type { NestExpressApplication } from "@nestjs/platform-express";

import { AppModule } from "@/app.module";
import { env } from "@/config/env";

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: false,
  });

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );

  // Better Auth needs the raw request body; every other route gets JSON/urlencoded.
  const authPath = "/api/auth";
  const jsonParser = bodyParser.json({ limit: "2mb" });
  const urlencodedParser = bodyParser.urlencoded({ extended: true, limit: "2mb" });

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith(authPath)) return next();
    jsonParser(req, res, next);
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith(authPath)) return next();
    urlencodedParser(req, res, next);
  });

  app.enableCors({
    origin: env.corsAllowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  });

  app.setGlobalPrefix("api");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle("Kavi Solutions API")
    .setDescription("Team, projects, settings and uploads for kavisolutions.in")
    .setVersion("0.1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("api/docs", app, document);

  await app.listen(env.PORT);
}

void bootstrap();
