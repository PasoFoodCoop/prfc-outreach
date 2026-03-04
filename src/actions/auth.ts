"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { AUTH_COOKIE } from "@/lib/dal";

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  revalidatePath("/", "layout");
  // TODO: Replace with the real PRFC member portal URL in production
  redirect("/dev/mock-portal");
}
