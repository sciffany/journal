import { LoginForm } from "./login-form";

export const metadata = {
  title: "Sign in",
};

type PageProps = {
  searchParams: Promise<{ next?: string }>;
};

export default async function LoginPage({ searchParams }: PageProps) {
  const { next } = await searchParams;

  return (
    <div className='flex min-h-screen items-center justify-center px-4'>
      <div className='w-full max-w-sm space-y-6'>
        <div className='space-y-2 text-center'>
          <h1 className='text-2xl font-semibold tracking-tight'>Journal</h1>
          <p className='text-sm text-neutral-500 dark:text-neutral-400'>
            Enter the password to open your private notebook.
          </p>
        </div>
        <LoginForm next={next ?? "/"} />
      </div>
    </div>
  );
}
