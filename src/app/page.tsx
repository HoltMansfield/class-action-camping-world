import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { getDb } from "@/db/getDb";
import { users } from "@/db/schema";
import { count } from "drizzle-orm";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function Home() {
  // Check for session cookie
  const cookieStore = cookies();
  const sessionUser = (await cookieStore).get("session_user")?.value;
  if (!sessionUser) {
    redirect("/login");
  }
  // Query user count server-side
  const db = await getDb();
  const result = await db.select({ count: count() }).from(users);
  const userCount = result[0]?.count ?? 0;

  async function logoutAction() {
    "use server";
    const cookieStore = cookies();
    (await cookieStore).delete("session_user");
    redirect("/login");
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-8">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Welcome, {sessionUser}!</CardTitle>
        </CardHeader>
        <div className="mt-4 text-sm text-gray-500">
          {`Total users in DB: ${userCount}`}
        </div>
        <form action={logoutAction} className="mt-6">
          <button type="submit" className="bg-red-600 text-white rounded px-4 py-2">Logout</button>
        </form>
      </Card>
    </main>
  );
}