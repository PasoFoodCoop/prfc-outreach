import type { EmailSuppression } from "@/generated/prisma/client";

export const suppressedLucy: EmailSuppression = {
  id: 1,
  email: "lucy@yahoo.com",
  emailHash: "lucy-hash",
  reason: "hard_bounce",
  suppressedAt: new Date("2024-01-15"),
};

export const suppressedMarcie: EmailSuppression = {
  id: 2,
  email: "marcie@gmail.com",
  emailHash: "marcie-hash",
  reason: "complaint",
  suppressedAt: new Date("2024-01-20"),
};

export const suppressedSally: EmailSuppression = {
  id: 3,
  email: "sally@icloud.com",
  emailHash: "sally-hash",
  reason: "unsubscribe",
  suppressedAt: new Date("2024-01-25"),
};

export const allSuppressions: EmailSuppression[] = [suppressedLucy, suppressedMarcie, suppressedSally];
