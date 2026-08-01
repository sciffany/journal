import Link from "next/link";
import { CalendarDays, ArrowRight } from "lucide-react";
import { countByType } from "@/app/actions/entries";
import { ENTRY_TYPES } from "@/lib/types";
import { todayISO } from "@/lib/utils";

export default async function HomePage() {
  const counts = await countByType();
  const today = todayISO();

  return (
    <div className='space-y-8'>
      <div>
        <h1 className='text-2xl font-semibold tracking-tight'>Journal</h1>
        <p className='mt-1 text-sm text-neutral-500 dark:text-neutral-400'>
          Your private daily notebook.
        </p>
      </div>

      <Link
        href={`/day/${today}`}
        className='group flex items-center justify-between rounded-xl border border-neutral-200 bg-neutral-50 p-6 transition hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-950 dark:hover:bg-neutral-900'
      >
        <div className='flex items-center gap-4'>
          <div className='rounded-lg bg-white p-3 shadow-sm dark:bg-neutral-900'>
            <CalendarDays className='h-5 w-5' />
          </div>
          <div>
            <div className='text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400'>
              Today
            </div>
            <div className='font-medium'>
              See everything from {new Date().toDateString()}
            </div>
          </div>
        </div>
        <ArrowRight className='h-4 w-4 text-neutral-400 transition group-hover:translate-x-1 group-hover:text-neutral-900 dark:group-hover:text-neutral-100' />
      </Link>

      <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
        {ENTRY_TYPES.map((t) => {
          const Icon = t.icon;
          const count = counts.get(t.slug) ?? 0;
          return (
            <Link
              key={t.slug}
              href={`/${t.slug}`}
              className='group rounded-lg border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-950 dark:hover:border-neutral-700'
            >
              <div className='flex items-start justify-between'>
                <Icon className='h-5 w-5 text-neutral-500' />
                <span className='text-2xl font-semibold tabular-nums'>
                  {count}
                </span>
              </div>
              <div className='mt-3 font-medium'>{t.label}</div>
              <div className='mt-0.5 text-xs text-neutral-500 dark:text-neutral-400'>
                {count === 1 ? "entry" : "entries"}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
