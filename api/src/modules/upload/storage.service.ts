import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  HeadObjectCommand,
  PutObjectCommand,
  PutBucketPolicyCommand,
  DeleteObjectCommand,
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
    await this.ensureBucket(env.S3_BUCKET, true);
    await this.ensureBucket(env.S3_CERTIFICATES_BUCKET, false);
  }

  private async ensureBucket(bucket: string, publicRead: boolean): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: bucket }));
      return;
    } catch {
      // fall through and create
    }

    try {
      await this.client.send(new CreateBucketCommand({ Bucket: bucket }));
      if (publicRead) {
        await this.client.send(
          new PutBucketPolicyCommand({
            Bucket: bucket,
            Policy: PUBLIC_READ_POLICY(bucket),
          }),
        );
      }
      this.logger.log(
        `Created bucket "${bucket}"${publicRead ? " with public read access" : " (private)"}`,
      );
    } catch (error) {
      this.logger.warn(
        `Could not verify/create bucket "${bucket}": ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
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

  /* --- private certificate storage --------------------------------------- */

  async putPrivate(
    key: string,
    body: Buffer,
    contentType: string,
    metadata?: Record<string, string>,
  ): Promise<void> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: env.S3_CERTIFICATES_BUCKET,
        Key: key,
        Body: body,
        ContentType: contentType,
        Metadata: metadata,
        /* Private objects are served through the API, which sets its own
           cache headers. Immutable is still correct: a certificate PDF is
           never re-written under the same key. */
        CacheControl: "private, max-age=0, no-store",
      }),
    );
  }

  async headPrivate(key: string): Promise<boolean> {
    try {
      await this.client.send(
        new HeadObjectCommand({ Bucket: env.S3_CERTIFICATES_BUCKET, Key: key }),
      );
      return true;
    } catch {
      return false;
    }
  }

  async getPrivate(key: string): Promise<Buffer | null> {
    try {
      const result = await this.client.send(
        new GetObjectCommand({ Bucket: env.S3_CERTIFICATES_BUCKET, Key: key }),
      );

      if (!result.Body) return null;
      const bytes = await result.Body.transformToByteArray();
      return Buffer.from(bytes);
    } catch {
      return null;
    }
  }

  async deletePrivate(key: string): Promise<void> {
    await this.client.send(
      new DeleteObjectCommand({ Bucket: env.S3_CERTIFICATES_BUCKET, Key: key }),
    );
  }

  certificateKey(id: string): string {
    // Shard by year so one prefix never holds tens of thousands of objects.
    const year = id.match(/-(\d{4})-/)?.[1] ?? "unknown";
    return `certificates/${year}/${id}.pdf`;
  }
}
