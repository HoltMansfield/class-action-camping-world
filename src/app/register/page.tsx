import { db } from "@/db/getDb";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";

export default async function RegisterPage({ searchParams }: { searchParams?: { success?: string; error?: string } }) {
  let message = "";

  const params = await searchParams;
  if (params?.success) message = "Registration successful! You can now log in.";
  if (params?.error) message = params.error;

  async function handleRegister(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    if (!email || !password) {
      redirect("/register?error=Email and password required.");
    }
    // Check if user already exists
    const existing = await db.select().from(users).where(eq(users.email, email));
    if (existing.length > 0) {
      redirect("/register?error=User already exists.");
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await db.insert(users).values({
      id: uuidv4(),
      email,
      passwordHash,
    });
    redirect("/register?success=1");
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-8">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Register</h1>
        <form action={handleRegister} className="flex flex-col gap-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            required
            className="border rounded px-3 py-2"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            required
            className="border rounded px-3 py-2"
          />
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2">
            Register
          </button>
        </form>
        {message && <div className="text-sm text-center mt-2">{message}</div>}
      </div>
    </main>
  );
}
