// One-time account provisioning (see business-rules.md Q1: no public signup).
// Run locally with UPSTASH_REDIS_REST_URL/TOKEN set in the environment:
//   npm run create-account -- you@example.com "a-strong-password"
import { randomUUID } from "node:crypto";
import { hashPassword } from "../src/logic/passwordHash";
import { UserStore } from "../src/stores/userStore";

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error('Usage: npm run create-account -- <email> "<password>"');
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Password must be at least 8 characters.");
    process.exit(1);
  }

  const passwordHash = await hashPassword(password);
  const userStore = new UserStore();

  const existing = await userStore.findByEmail(email);
  if (existing) {
    console.error(`An account for ${email} already exists.`);
    process.exit(1);
  }

  await userStore.create({ userId: randomUUID(), email, passwordHash, createdAt: Date.now() });
  console.log(`Account created for ${email}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
