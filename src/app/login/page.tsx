import { db } from "@/db/getDb";
import { users } from "@/db/schema";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";

export default async function LoginPage({ searchParams }: { searchParams?: { error?: string } }) {
  let message = "";
  const result = await searchParams;
  if (result?.error) message = result.error;

  async function handleLogin(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    if (!email || !password) {
      redirect("/login?error=Email and password required.");
    }
    // Find user
    const found = await db.select().from(users).where(eq(users.email, email));
    if (found.length === 0) {
      redirect("/login?error=Invalid credentials.");
    }
    const user = found[0];
    const valid = await bcrypt.compare(password, user.passwordHash ?? "");
    if (!valid) {
      redirect("/login?error=Invalid credentials.");
    }
    const cookieStore = await cookies();
    cookieStore.set("session_user", user.email ?? "", { path: "/" });

    redirect("/");
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-8">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <form action={handleLogin} className="flex flex-col gap-4">
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
            Login
          </button>
        </form>
        {message && <div className="text-sm text-center mt-2">{message}</div>}
        <div className="mt-4 text-center">
          <a
            href="/register"
            className="text-blue-600 hover:underline text-sm"
          >
            Create an account
          </a>
        </div>
      </div>
    </main>
  );
}
