import {
  CreateBucketCommand,
  HeadBucketCommand,
  PutBucketPolicyCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { Injectable, Logger, OnModuleInit } from "@nestjs/common";

import { env } from "@/config/env";

const PUBLIC_READ_POLICY = (bucket: string) =>
  JSON.stringify({
    Version: "2012-10-17",
    Statement: [
      {
        Sid: "PublicReadGetObject",
        Effect: "Allow",
        Principal: { AWS: ["*"] },
        Action: ["s3:GetObject"],
        Resource: [`arn:aws:s3:::${bucket}/*`],
      },
    ],
  });

@Injectable()
export class StorageService implements OnModuleInit {
  private readonly logger = new Logger(StorageService.name);

  readonly client = new S3Client({
    region: env.S3_REGION,
    endpoint: env.S3_ENDPOINT,
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
    credentials: {
      accessKeyId: env.S3_ACCESS_KEY,
      secretAccessKey: env.S3_SECRET_KEY,
    },
  });

  async onModuleInit(): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET }));
    } catch {
      try {
        await this.client.send(new CreateBucketCommand({ Bucket: env.S3_BUCKET }));
        await this.client.send(
          new PutBucketPolicyCommand({
            Bucket: env.S3_BUCKET,
            Policy: PUBLIC_READ_POLICY(env.S3_BUCKET),
          }),
        );
        this.logger.log(`Created bucket "${env.S3_BUCKET}" with public read access`);
      } catch (error) {
        this.logger.warn(
          `Could not verify/create bucket "${env.S3_BUCKET}": ${
            error instanceof Error ? error.message : String(error)
          }`,
        );
      }
    }
  }

  publicUrl(key: string): string {
    const base = env.S3_PUBLIC_URL.replace(/\/+$/, "");
    return `${base}/${key.replace(/^\/+/, "")}`;
  }

  async upload(key: string, body: Buffer, contentType: string): Promise<string> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    return this.publicUrl(key);
  }
}
