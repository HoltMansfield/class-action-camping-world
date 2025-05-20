"use client";
import { useForm } from '@conform-to/react';
import { parseWithZod } from '@conform-to/zod';
import { z } from 'zod';
import { register } from "./actions";
import { useActionState } from "react";

export const schema = z.object({
  email: z.string().email('Email is invalid'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
});

export default function RegisterPage() {
  const [lastResult, action] = useActionState(register, undefined);
  const [form, fields] = useForm({
    lastResult,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    shouldValidate: 'onBlur',
    shouldRevalidate: 'onInput',
  });

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-8">
      <div className="max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4">Register</h1>
        {/* action={action} */}
        <form id={form.id} onSubmit={form.onSubmit} method="post" className="flex flex-col gap-3">
          <label htmlFor={fields.email.id}>Email</label>
          <input type="email" {...fields.email} className="border rounded px-3 py-2" />
          {fields.email.errors && (
            <div className="text-red-600 text-xs italic" role="alert">
              {fields.email.errors.join(', ')}
            </div>
          )}
          <label htmlFor={fields.password.id}>Password</label>
          <input type="password" {...fields.password} className="border rounded px-3 py-2" />
          {fields.password.errors && (
            <div className="text-red-600 text-xs italic" role="alert">
              {fields.password.errors.join(', ')}
            </div>
          )}
          <button type="submit" className="bg-blue-600 text-white rounded px-4 py-2 mt-2">
            Register
          </button>
        </form>
      </div>  
    </main>
  );
}
