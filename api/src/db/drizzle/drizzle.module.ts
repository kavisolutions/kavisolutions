import { Global, Module, OnApplicationShutdown } from "@nestjs/common";

import { db, pool, type Database } from "@/db/drizzle/drizzle.client";

export const DATABASE = Symbol("DATABASE");

@Global()
@Module({
  providers: [
    {
      provide: DATABASE,
      useValue: db,
    },
  ],
  exports: [DATABASE],
})
export class DrizzleModule implements OnApplicationShutdown {
  async onApplicationShutdown(): Promise<void> {
    await pool.end();
  }
}

export type { Database };
