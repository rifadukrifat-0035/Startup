'use server';

import { createClient } from '../../utils/supabase/server';

type AuthRole = 'landlord' | 'tenant';

export type AuthActionState = {
  success: boolean;
  error: string | null;
};

const allowedRoles: AuthRole[] = ['landlord', 'tenant'];

function getField(formData: FormData, key: string) {
  const value = formData.get(key);

  return typeof value === 'string' ? value.trim() : '';
}

function fail(message: string): AuthActionState {
  return {
    success: false,
    error: message,
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred. Please try again.';
}

async function getSupabaseClient() {
  return await createClient();
}

export async function login(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  try {
    const email = getField(formData, 'email');
    const password = getField(formData, 'password');

    if (!email || !password) {
      return fail('Email and password are required.');
    }

    const supabase = await getSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return fail(error.message);
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    return fail(getErrorMessage(error));
  }
}

export async function signUp(
  _previousState: AuthActionState,
  formData: FormData
): Promise<AuthActionState> {
  try {
    const email = getField(formData, 'email');
    const password = getField(formData, 'password');
    const fullName = getField(formData, 'full_name');
    const phone = getField(formData, 'phone');
    const role = getField(formData, 'role');

    if (!email || !password || !fullName || !phone || !role) {
      return fail('Email, password, full name, phone, and role are required.');
    }

    if (!allowedRoles.includes(role as AuthRole)) {
      return fail('Role must be either landlord or tenant.');
    }

    const supabase = await getSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return fail(error.message);
    }

    const userId = data.user?.id;

    if (!userId) {
      return fail('Account creation succeeded, but no user id was returned.');
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: userId,
      full_name: fullName,
      phone,
      role: role as AuthRole,
    });

    if (profileError) {
      return fail(profileError.message);
    }

    return {
      success: true,
      error: null,
    };
  } catch (error) {
    return fail(getErrorMessage(error));
  }
}