"use server";

import { z } from "zod";
import { createClient } from "../../utils/supabase/server";

export type AuthActionState = {
  success: boolean;
  error: string | null;
};

const authRoles = z.enum(["landlord", "tenant"]);

const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const signUpSchema = z.object({
  full_name: z.string().trim().min(2, "Full name is required"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(7, "Phone number is required")
    .max(20, "Phone number is too long")
    .regex(/^[+()\-\s\d]+$/, "Enter a valid phone number"),
  role: authRoles,
  password: z.string().min(8, "Password must be at least 8 characters"),
});

function parseForm(formData: FormData) {
  const obj: Record<string, string> = {};

  for (const [key, value] of formData.entries()) {
    obj[key] = typeof value === "string" ? value.trim() : "";
  }

  return obj;
}

function resultFail(message: string): AuthActionState {
  return { success: false, error: message };
}

function resultOk(): AuthActionState {
  return { success: true, error: null };
}

async function getSupabase() {
  return await createClient();
}

function getErrorMessage(err: unknown) {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  return "An unexpected error occurred.";
}

export async function login(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  try {
    const payload = parseForm(formData);

    const parse = loginSchema.safeParse(payload);
    if (!parse.success) {
      const first = parse.error.errors[0];
      return resultFail(first?.message ?? "Invalid login data");
    }

    const { email, password } = parse.data;

    const supabase = await getSupabase();

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) return resultFail(error.message || "Failed to sign in");

    return resultOk();
  } catch (err) {
    return resultFail(getErrorMessage(err));
  }
}

export async function signUp(_prev: AuthActionState, formData: FormData): Promise<AuthActionState> {
  try {
    const payload = parseForm(formData);

    const parse = signUpSchema.safeParse(payload);
    if (!parse.success) {
      const first = parse.error.errors[0];
      return resultFail(first?.message ?? "Invalid signup data");
    }

    const { email, password, full_name, phone, role } = parse.data;

    const supabase = await getSupabase();

    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) return resultFail(error.message || "Failed to create account");

    const userId = data.user?.id;
    if (!userId) return resultFail("Account created but no user id was returned");

    const { error: insertError } = await supabase.from("profiles").insert({
      id: userId,
      full_name,
      phone,
      role,
    });

    if (insertError) {
      return resultFail(insertError.message || "Profile creation failed");
    }

    return resultOk();
  } catch (err) {
    return resultFail(getErrorMessage(err));
  }
}
