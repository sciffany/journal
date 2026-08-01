"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, Home, Upload } from "lucide-react";
import { ENTRY_TYPES } from "@/lib/types";
import { cn, todayISO } from "@/lib/utils";

export function Sidebar() {
  const pathname = usePathname();
  const today = todayISO();

  return (
    <aside className='flex h-full w-60 shrink-0 flex-col border-r border-neutral-200 bg-neutral-50/50 dark:border-neutral-800 dark:bg-neutral-950'>
      <div className='border-b border-neutral-200 p-4 dark:border-neutral-800'>
        <Link
          href='/'
          className='text-lg font-semibold tracking-tight hover:opacity-80'
        >
          Journal
        </Link>
      </div>

      <nav className='flex-1 space-y-6 overflow-y-auto p-3'>
        <div>
          <SidebarLink
            href='/'
            active={pathname === "/"}
            icon={<Home className='h-4 w-4' />}
            label='Home'
          />
          <SidebarLink
            href={`/day/${today}`}
            active={pathname.startsWith("/day")}
            icon={<CalendarDays className='h-4 w-4' />}
            label='Today'
          />
          <SidebarLink
            href='/import'
            active={pathname === "/import"}
            icon={<Upload className='h-4 w-4' />}
            label='Import CSV'
          />
        </div>

        <div>
          <div className='px-3 pb-1 text-xs font-medium uppercase tracking-wider text-neutral-500 dark:text-neutral-400'>
            Types
          </div>
          {ENTRY_TYPES.map((t) => {
            const Icon = t.icon;
            const active =
              pathname === `/${t.slug}` || pathname.startsWith(`/${t.slug}/`);
            return (
              <SidebarLink
                key={t.slug}
                href={`/${t.slug}`}
                active={active}
                icon={<Icon className='h-4 w-4' />}
                label={t.label}
              />
            );
          })}
        </div>
      </nav>

      <form
        action='/auth/sign-out'
        method='post'
        className='border-t border-neutral-200 p-3 dark:border-neutral-800'
      >
        <button
          type='submit'
          className='w-full rounded-md px-3 py-2 text-left text-sm text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-900'
        >
          Sign out
        </button>
      </form>
    </aside>
  );
}

function SidebarLink({
  href,
  active,
  icon,
  label,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
        active
          ? "bg-neutral-200/70 font-medium text-neutral-900 dark:bg-neutral-800 dark:text-neutral-50"
          : "text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-900 dark:hover:text-neutral-100",
      )}
    >
      {icon}
      <span className='truncate'>{label}</span>
    </Link>
  );
}
