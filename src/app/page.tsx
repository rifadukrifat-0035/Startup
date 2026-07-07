import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black">
      <div className="p-8 text-center">
        <h1 className="text-4xl font-bold text-black dark:text-white mb-4">Welcome to Startup</h1>
        <p className="text-lg text-zinc-700 dark:text-zinc-300 mb-6">
          The dev server is running. Edit <span className="font-mono">src/app/page.tsx</span> to change this page.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/login" className="rounded-md bg-black text-white px-4 py-2">
            Go to Login
          </Link>
          <Link href="/" className="rounded-md border border-black px-4 py-2">
            Refresh
          </Link>
        </div>
      </div>
    </main>
  );
}
