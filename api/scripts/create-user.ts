import * as dotenv from "dotenv";
import { auth } from "@/auth/auth.config";

dotenv.config();

/**
 * Create (or promote) a login user.
 *
 * Usage:
 *   npm run user:create -- --email admin@example.com --password secret123 --name "Admin" --role admin
 *   npm run user:create -- --email someone@example.com --password secret123
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);

  const readArg = (flag: string): string | undefined => {
    const index = args.indexOf(flag);
    return index >= 0 ? args[index + 1] : undefined;
  };

  const email = (readArg("--email") ?? "").trim().toLowerCase();
  const password = readArg("--password") ?? "";
  const name = readArg("--name") ?? email.split("@")[0] ?? "User";
  const role = readArg("--role") ?? "user";

  if (!email || !password) {
    console.error("Usage: npm run user:create -- --email <email> --password <password> [--name <name>] [--role admin]");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Password must be at least 8 characters");
    process.exit(1);
  }

  const context = await auth.$context;
  const existing = await context.internalAdapter.findUserByEmail(email);

  if (existing) {
    const existingRole = (existing.user as { role?: string | null }).role;
    if (role !== existingRole) {
      await context.internalAdapter.updateUser(existing.user.id, { role });
    }
    await context.internalAdapter.updatePassword(existing.user.id, password);
    console.log(`Updated existing user ${email} (role: ${role})`);
    process.exit(0);
  }

  const created = await context.internalAdapter.createUser(
    { email, name, emailVerified: true, role },
    { method: "admin" },
  );

  const hashed = await context.password.hash(password);
  await context.internalAdapter.linkAccount({
    providerId: "credential",
    accountId: created.id,
    userId: created.id,
    password: hashed,
  });

  console.log(`Created user ${email} (role: ${role}, id: ${created.id})`);
  process.exit(0);
}

void main();
