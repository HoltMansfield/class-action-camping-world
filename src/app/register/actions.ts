"use server";
import db from "@/db/connect-web";
import { users } from "@/db/schema";
import { parseWithZod } from "@conform-to/zod";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { schema } from "./page";

export async function register(prevState: unknown, formData: FormData) {
  const submission = parseWithZod(formData, { schema });

  if (submission.status !== 'success') {
    return submission.reply();
  }

  if (!submission.value.email || !submission.value.password) {
    redirect("/register?error=Email and password required.");
  }
  // Check for db being null
  if (!db) {
    redirect("/register?error=Database connection error. Please try again later.");
  }

  // Check if user already exists
  const existing = await db.select().from(users).where(eq(users.email, submission.value.email));
  if (existing.length > 0) {
    redirect("/register?error=User already exists.");
  }

  const passwordHash = await bcrypt.hash(submission.value.password, 10);

  await db.insert(users).values({
    id: uuidv4(),
    email: submission.value.email,
    passwordHash,
  });

  redirect("/login?success=1");
}