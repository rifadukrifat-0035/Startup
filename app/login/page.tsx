"use client";

import { useState, useTransition } from 'react';
import type { ReactNode } from 'react';
import { Loader2, LockKeyhole, Mail, Phone, Sparkles, UserRound } from 'lucide-react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { login, signUp, type AuthActionState } from '../../src/app/auth/actions';

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required.').email('Enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

const signUpSchema = z.object({
  full_name: z.string().trim().min(2, 'Full name must be at least 2 characters.'),
  email: z.string().trim().min(1, 'Email is required.').email('Enter a valid email address.'),
  phone: z
    .string()
    .trim()
    .min(7, 'Phone number is required.')
    .max(20, 'Phone number is too long.')
    .regex(/^[+()\\-\\s\\d]+$/, 'Enter a valid phone number.'),
  role: z.enum(['landlord', 'tenant']),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
});

type LoginValues = z.infer<typeof loginSchema>;
type SignUpValues = z.infer<typeof signUpSchema>;
type AuthTab = 'login' | 'create';

const defaultAuthState: AuthActionState = {
  success: false,
  error: null,
};

function buildFormData(values: Record<string, string>) {
  const formData = new FormData();

  Object.entries(values).forEach(([key, value]) => {
    formData.append(key, value);
  });

  return formData;
}

function AuthAlert({ state }: { state: AuthActionState | null }) {
  if (!state?.error && state?.success !== true) {
    return null;
  }

  const isSuccess = state.success;

  return (
    <div
      className={[
        'rounded-2xl border px-4 py-3 text-sm shadow-sm',
        isSuccess
          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
          : 'border-rose-500/20 bg-rose-500/10 text-rose-200',
      ].join(' ')}
      role="alert"
    >
      {isSuccess ? 'Success. Your request was processed.' : state.error}
    </div>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null;
  }

  return <p className="mt-2 text-sm text-rose-300">{message}</p>;
}

function InputShell({
  label,
  icon: Icon,
  children,
  error,
  hint,
}: {
  label: string;
  icon: typeof Mail;
  children: ReactNode;
  error?: string;
  hint?: string;
}) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
          <Icon className="h-4 w-4 text-sky-300" />
          {label}
        </span>
        {hint ? <span className="text-xs text-slate-500">{hint}</span> : null}
      </div>
      {children}
      <FieldError message={error} />
    </label>
  );
}

function SubmitButton({
  pending,
  label,
  loadingLabel,
}: {
  pending: boolean;
  label: string;
  loadingLabel: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-sky-500 via-cyan-500 to-emerald-500 px-5 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(14,165,233,0.25)] transition duration-200 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {pending ? loadingLabel : label}
    </button>
  );
}

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState<AuthTab>('login');
  const [loginState, setLoginState] = useState<AuthActionState | null>(null);
  const [signUpState, setSignUpState] = useState<AuthActionState | null>(null);
  const [isLoginPending, startLoginTransition] = useTransition();
  const [isSignUpPending, startSignUpTransition] = useTransition();

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
    mode: 'onTouched',
  });

  const signUpForm = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      full_name: '',
      email: '',
      phone: '',
      role: 'tenant',
      password: '',
    },
    mode: 'onTouched',
  });

  const selectedRole = useWatch({
    control: signUpForm.control,
    name: 'role',
  });

  const handleLogin = loginForm.handleSubmit((values) => {
    setLoginState(null);

    startLoginTransition(async () => {
      const result = await login(defaultAuthState, buildFormData(values as unknown as Record<string, string>));
      setLoginState(result);

      if (result.success) {
        loginForm.reset({
          email: values.email,
          password: '',
        });
      }
    });
  });

  const handleSignUp = signUpForm.handleSubmit((values) => {
    setSignUpState(null);

    startSignUpTransition(async () => {
      const result = await signUp(defaultAuthState, buildFormData(values as unknown as Record<string, string>));
      setSignUpState(result);

      if (result.success) {
        signUpForm.reset({
          full_name: '',
          email: '',
          phone: '',
          role: 'tenant',
          password: '',
        });
      }
    });
  });

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      <div className="relative isolate overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.22),_transparent_34%),radial-gradient(circle_at_80%_20%,_rgba(16,185,129,0.16),_transparent_28%),linear-gradient(180deg,_#050816_0%,_#091125_45%,_#0b1220_100%)]" />
        <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-[linear-gradient(90deg,rgba(14,165,233,0.18),rgba(20,184,166,0.1),transparent)] blur-3xl" />

        <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid w-full gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
            <section className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl shadow-sky-950/30 backdrop-blur-xl sm:p-10 lg:p-12">
              <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.12),transparent_38%)]" />
              <div className="relative z-10 flex h-full flex-col justify-between gap-10">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-sky-200">
                    <Sparkles className="h-4 w-4" />
                    Marketplace Access
                  </div>

                  <div className="space-y-4">
                    <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                      Secure authentication for a modern landlord and tenant marketplace.
                    </h1>
                    <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                      A polished, role-aware entry point with validated login and account creation flows built for production-grade SaaS teams.
                    </p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    ['Fast access', 'Sign in securely with verified Supabase auth sessions.'],
                    ['Role aware', 'Separate landlord and tenant onboarding from day one.'],
                    ['Production ready', 'Client validation, server actions, and clean error handling.'],
                  ].map(([title, description]) => (
                    <div key={title} className="rounded-2xl border border-white/10 bg-slate-950/40 p-4">
                      <p className="text-sm font-semibold text-white">{title}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-300">
                        <UserRound className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Tenant onboarding</p>
                        <p className="text-sm text-slate-400">Simple browsing, booking, and account access.</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-slate-950/35 p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300">
                        <LockKeyhole className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">Landlord controls</p>
                        <p className="text-sm text-slate-400">Secure access for listings, approvals, and operations.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-6 lg:p-8">
              <div className="rounded-[1.6rem] border border-white/10 bg-slate-900/80 p-4 sm:p-6 lg:p-8">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.24em] text-sky-300">

                      Welcome back
                    </p>
                    <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                      Sign in or create your account
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-400">
                      Choose the flow that matches your role and get access in seconds.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('login')}
                      className={[
                        'rounded-xl px-4 py-3 text-sm font-semibold transition',
                        activeTab === 'login'
                          ? 'bg-white text-slate-950 shadow-lg shadow-white/10'
                          : 'text-slate-300 hover:bg-white/5',
                      ].join(' ')}
                    >
                      Login
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('create')}
                      className={[
                        'rounded-xl px-4 py-3 text-sm font-semibold transition',
                        activeTab === 'create'
                          ? 'bg-white text-slate-950 shadow-lg shadow-white/10'
                          : 'text-slate-300 hover:bg-white/5',
                      ].join(' ')}
                    >
                      Create Account
                    </button>
                  </div>

                  {activeTab === 'login' ? (
                    <form className="space-y-5" onSubmit={handleLogin} noValidate>
                      <AuthAlert state={loginState} />

                      <InputShell
                        label="Email Address"
                        icon={Mail}
                        error={loginForm.formState.errors.email?.message}
                      >
                        <input
                          type="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/50 focus:bg-white/8"
                          {...loginForm.register('email')}
                        />
                      </InputShell>

                      <InputShell
                        label="Password"
                        icon={LockKeyhole}
                        hint="At least 8 characters"
                        error={loginForm.formState.errors.password?.message}
                      >
                        <input
                          type="password"
                          autoComplete="current-password"
                          placeholder="••••••••"
                          className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/50 focus:bg-white/8"
                          {...loginForm.register('password')}
                        />
                      </InputShell>

                      <SubmitButton
                        pending={isLoginPending}
                        label="Login"
                        loadingLabel="Signing you in"
                      />
                    </form>
                  ) : (
                    <form className="space-y-5" onSubmit={handleSignUp} noValidate>
                      <AuthAlert state={signUpState} />

                      <InputShell
                        label="Full Name"
                        icon={UserRound}
                        error={signUpForm.formState.errors.full_name?.message}
                      >
                        <input
                          type="text"
                          autoComplete="name"
                          placeholder="John Smith"
                          className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/50 focus:bg-white/8"
                          {...signUpForm.register('full_name')}
                        />
                      </InputShell>

                      <InputShell
                        label="Email Address"
                        icon={Mail}
                        error={signUpForm.formState.errors.email?.message}
                      >
                        <input
                          type="email"
                          autoComplete="email"
                          placeholder="you@example.com"
                          className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/50 focus:bg-white/8"
                          {...signUpForm.register('email')}
                        />
                      </InputShell>

                      <div className="grid gap-5 sm:grid-cols-2">
                        <InputShell
                          label="Phone"
                          icon={Phone}
                          error={signUpForm.formState.errors.phone?.message}
                        >
                          <input
                            type="tel"
                            autoComplete="tel"
                            placeholder="+1 (555) 123-4567"
                            className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/50 focus:bg-white/8"
                            {...signUpForm.register('phone')}
                          />
                        </InputShell>

                        <InputShell
                          label="Password"
                          icon={LockKeyhole}
                          hint="At least 8 characters"
                          error={signUpForm.formState.errors.password?.message}
                        >
                          <input
                            type="password"
                            autoComplete="new-password"
                            placeholder="Create a password"
                            className="h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-sky-400/50 focus:bg-white/8"
                            {...signUpForm.register('password')}
                          />
                        </InputShell>
                      </div>

                      <div>
                        <div className="mb-2 flex items-center justify-between gap-3">
                          <span className="flex items-center gap-2 text-sm font-medium text-slate-200">
                            <UserRound className="h-4 w-4 text-sky-300" />
                            Account Role
                          </span>
                          <span className="text-xs text-slate-500">Choose your marketplace side</span>
                        </div>
                        <input type="hidden" {...signUpForm.register('role')} />
                        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
                          {(['tenant', 'landlord'] as const).map((role) => {
                            const isActive = selectedRole === role;

                            return (
                              <button
                                key={role}
                                type="button"
                                onClick={() => signUpForm.setValue('role', role, { shouldValidate: true })}
                                className={[
                                  'rounded-xl px-4 py-3 text-sm font-semibold capitalize transition',
                                  isActive
                                    ? 'bg-white text-slate-950 shadow-lg shadow-white/10'
                                    : 'text-slate-300 hover:bg-white/5',
                                ].join(' ')}
                                aria-pressed={isActive}
                              >
                                {role}
                              </button>
                            );
                          })}
                        </div>
                        <FieldError message={signUpForm.formState.errors.role?.message} />
                      </div>

                      <SubmitButton
                        pending={isSignUpPending}
                        label="Create Account"
                        loadingLabel="Creating your account"
                      />
                    </form>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
