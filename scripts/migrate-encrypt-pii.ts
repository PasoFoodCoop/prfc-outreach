import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "../src/generated/prisma/client";
import crypto from "crypto";

const BATCH_SIZE = 100;

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required env var: ${name}`);
    process.exit(1);
  }
  return value;
}

function createAdapter() {
  const dbUrl = getRequiredEnv("DATABASE_URL");
  const url = new URL(dbUrl);
  return new PrismaMariaDb({
    host: url.hostname,
    port: url.port ? parseInt(url.port, 10) : 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    connectionLimit: 1,
  });
}

const encryptionKey = Buffer.from(getRequiredEnv("FIELD_ENCRYPTION_KEY"), "hex");
const blindIndexKey = Buffer.from(getRequiredEnv("BLIND_INDEX_KEY"), "hex");

function encrypt(plaintext: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", encryptionKey, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, encrypted, tag]).toString("base64url");
}

function blindIndex(value: string): string {
  return crypto.createHmac("sha256", blindIndexKey).update(value.toLowerCase()).digest("hex");
}

function isEncrypted(value: string): boolean {
  try {
    const buf = Buffer.from(value, "base64url");
    return buf.length >= 28;
  } catch {
    return false;
  }
}

const adapter = createAdapter();
const prisma = new PrismaClient({ adapter });

async function migrateReferrals() {
  const total = await prisma.referral.count();
  console.log(`Found ${total} referrals to migrate`);

  let migrated = 0;
  let skipped = 0;

  for (let skip = 0; skip < total; skip += BATCH_SIZE) {
    const batch = await prisma.referral.findMany({
      take: BATCH_SIZE,
      skip,
      orderBy: { id: "asc" },
    });

    for (const referral of batch) {
      if (isEncrypted(referral.memberName)) {
        skipped++;
        continue;
      }

      await prisma.referral.update({
        where: { id: referral.id },
        data: {
          memberName: encrypt(referral.memberName),
          memberEmail: encrypt(referral.memberEmail),
          prospectName: encrypt(referral.prospectName),
          prospectEmail: encrypt(referral.prospectEmail),
        },
      });
      migrated++;
    }

    console.log(`Processed ${Math.min(skip + BATCH_SIZE, total)}/${total} referrals`);
  }

  console.log(`Referrals: ${migrated} migrated, ${skipped} skipped (already encrypted)`);
}

async function migrateEmailSuppressions() {
  const total = await prisma.emailSuppression.count();
  console.log(`Found ${total} email suppressions to migrate`);

  let migrated = 0;
  let skipped = 0;

  for (let skip = 0; skip < total; skip += BATCH_SIZE) {
    const batch = await prisma.emailSuppression.findMany({
      take: BATCH_SIZE,
      skip,
      orderBy: { id: "asc" },
    });

    for (const suppression of batch) {
      if (isEncrypted(suppression.email)) {
        skipped++;
        continue;
      }

      const normalized = suppression.email.toLowerCase();
      await prisma.emailSuppression.update({
        where: { id: suppression.id },
        data: {
          email: encrypt(normalized),
          emailHash: blindIndex(normalized),
        },
      });
      migrated++;
    }

    console.log(`Processed ${Math.min(skip + BATCH_SIZE, total)}/${total} suppressions`);
  }

  console.log(`Email suppressions: ${migrated} migrated, ${skipped} skipped`);
}

async function migrateSmsConsent() {
  const total = await prisma.smsConsent.count();
  console.log(`Found ${total} SMS consent records to migrate`);

  let migrated = 0;
  let skipped = 0;

  for (let skip = 0; skip < total; skip += BATCH_SIZE) {
    const batch = await prisma.smsConsent.findMany({
      take: BATCH_SIZE,
      skip,
      orderBy: { id: "asc" },
    });

    for (const consent of batch) {
      if (isEncrypted(consent.phone)) {
        skipped++;
        continue;
      }

      await prisma.smsConsent.update({
        where: { id: consent.id },
        data: {
          phone: encrypt(consent.phone),
          phoneHash: blindIndex(consent.phone),
          ipAddress: consent.ipAddress ? encrypt(consent.ipAddress) : null,
        },
      });
      migrated++;
    }

    console.log(`Processed ${Math.min(skip + BATCH_SIZE, total)}/${total} consent records`);
  }

  console.log(`SMS consent: ${migrated} migrated, ${skipped} skipped`);
}

async function main() {
  console.log("Starting PII encryption migration");
  await migrateReferrals();
  await migrateEmailSuppressions();
  await migrateSmsConsent();
  console.log("Migration complete");
}

main()
  .catch((e) => {
    console.error("Migration failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
