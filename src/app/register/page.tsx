import { db } from "@/db/connect";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { useForm, type SubmissionResult } from "@conform-to/react";

function reply<T>(
  prevState: SubmissionResult<T>,
  result: Partial<SubmissionResult<T>>
): SubmissionResult<T> {
  return {
    ...prevState,
    ...result,
    status: result.error?.length ? "error" : "success",
  };
}

import { parseWithZod } from "@conform-to/zod";
import { useFormState } from "react-dom";
import { registerSchema } from "./registerSchema";

const initialState: SubmissionResult<string[]> = {};

export async function handleRegister(
  prevState: SubmissionResult<string[]>,
  formData: FormData
): Promise<SubmissionResult<string[]>> {
  "use server";

  if (!db) {
    throw new Error("Database connection error. Please try again later.");
  }

  const submission = parseWithZod(formData, { schema: registerSchema });

  if (submission.status !== "success") {
    // Flatten field errors into a single array for error
    return reply(prevState, {
      error: {
        email: submission.error?.email ?? null,
        password: submission.error?.password ?? null,
        form: submission.error?.form ?? null,
      },
    });
  }

  const { email, password } = submission.value;

  // Check if user already exists
  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    return reply(prevState, {
      error: {
        email: ["User already exists."],
        password: null,
        form: null,
      },
    });
  }

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    await db.insert(users).values({
      id: uuidv4(),
      email,
      passwordHash,
    });
    redirect("/register?success=1");
  } catch (error) {
    return reply(prevState, {
      error: {
        email: null,
        password: null,
        form: ["Database error. Please try again later."]
      }
    });
  }
}

export default function RegisterPage({ searchParams }: { searchParams?: { success?: string; error?: string } }) {
  // Use useFormState to connect the server action and receive errors
  const [lastResult, action] = useFormState(handleRegister, initialState);
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: registerSchema });
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });

  // Error arrays for rendering
  const emailErrors = fields.email.errors;
  const passwordErrors = fields.password.errors;
  const formErrors = form.errors;

  let message = "";
  const params = searchParams;
  if (params?.success) message = "Registration successful! You can now log in.";
  if (params?.error) message = params.error;

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-8">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Register</h1>
        <form {...form.props} action={action} className="flex flex-col gap-4">
          <input
            {...fields.email.props}
            type="email"
            placeholder="Email"
            required
            className="border rounded px-3 py-2"
          />
          {!!emailErrors?.[0] && (
            <div className="text-red-600 text-xs">{emailErrors[0]}</div>
          )}
          <input
            {...fields.password.props}
            type="password"
            placeholder="Password"
            required
            className="border rounded px-3 py-2"
          />
          {!!passwordErrors?.[0] && (
            <div className="text-red-600 text-xs">{passwordErrors[0]}</div>
          )}
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2">
            Register
          </button>
        </form>
        {!!formErrors?.[0] && (
          <div className="text-red-600 text-xs text-center mt-2">{formErrors[0]}</div>
        )}
        {message && <div className="text-sm text-center mt-2">{message}</div>}
      </div>
    </main>
  );
}
