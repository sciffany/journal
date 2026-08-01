import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import {
  getActivityBySlug,
  listEntryDatesForActivity,
} from "@/app/actions/activities";
import { DeleteActivityButton } from "@/components/ActivityDeleteButtons";
import { ActivityHeatmap } from "@/components/ActivityHeatmap";
import { shiftISODate, todayISO } from "@/lib/utils";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ActivityDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const activity = await getActivityBySlug(slug);
  if (!activity) notFound();

  const endDate = todayISO();
  const startDate = shiftISODate(endDate, -370);
  const activeDates = await listEntryDatesForActivity(
    activity.id,
    startDate,
    endDate,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/activities"
            className="mb-3 inline-flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Activities
          </Link>
          <div className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
            {activity.category.name}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {activity.name}
          </h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            {activity._count.entries}{" "}
            {activity._count.entries === 1 ? "day" : "days"} logged
          </p>
        </div>
        <DeleteActivityButton
          activityId={activity.id}
          activityName={activity.name}
        />
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
          Past year
        </h2>
        <div className="rounded-lg border border-neutral-200 p-4 dark:border-neutral-800">
          <ActivityHeatmap activeDates={activeDates} endDate={endDate} />
        </div>
      </section>
    </div>
  );
}
