import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { AppError } from "@/utils/errors";

const ACCESS_COOKIE = "prfc_database_access";

// cache() dedupes calls within a single React render pass
export const verifyDatabaseAccess = cache(async () => {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get(ACCESS_COOKIE);

  if (!authCookie || authCookie.value !== "verified") {
    throw new AppError("UNAUTHORIZED", "Database access required");
  }

  return { authenticated: true };
});
