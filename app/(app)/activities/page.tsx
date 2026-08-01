import Link from "next/link";
import { listCategoriesWithActivities } from "@/app/actions/activities";
import {
  CreateActivityButton,
  CreateCategoryButton,
} from "@/components/ActivityCreateForms";
import { DeleteCategoryButton } from "@/components/ActivityDeleteButtons";

export default async function ActivitiesPage() {
  const categories = await listCategoriesWithActivities();
  const categoryOptions = categories.map((c) => ({ id: c.id, name: c.name }));
  const totalActivities = categories.reduce(
    (sum, c) => sum + c.activities.length,
    0,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Activities</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
            Track what you spend your days doing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <CreateCategoryButton />
          <CreateActivityButton categories={categoryOptions} />
        </div>
      </div>

      {categories.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 py-16 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          No categories yet. Create a category, then add activities to track.
        </div>
      ) : totalActivities === 0 ? (
        <div className="space-y-6">
          {categories.map((category) => (
            <section key={category.id} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {category.name}
                </h2>
                <DeleteCategoryButton
                  categoryId={category.id}
                  categoryName={category.name}
                  activityCount={category.activities.length}
                />
              </div>
              <div className="rounded-lg border border-dashed border-neutral-300 py-8 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                No activities in this category yet.
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {categories.map((category) => (
            <section key={category.id} className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                  {category.name}
                  <span className="ml-1.5 text-xs text-neutral-400 dark:text-neutral-500">
                    ({category.activities.length})
                  </span>
                </h2>
                <DeleteCategoryButton
                  categoryId={category.id}
                  categoryName={category.name}
                  activityCount={category.activities.length}
                />
              </div>
              {category.activities.length === 0 ? (
                <div className="rounded-lg border border-dashed border-neutral-300 py-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                  No activities in this category yet.
                </div>
              ) : (
                <ul className="divide-y divide-neutral-200 rounded-lg border border-neutral-200 dark:divide-neutral-800 dark:border-neutral-800">
                  {category.activities.map((activity) => {
                    const count = activity._count.entries;
                    return (
                      <li key={activity.id}>
                        <Link
                          href={`/activities/${activity.slug}`}
                          className="flex items-center justify-between px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                        >
                          <span className="font-medium">{activity.name}</span>
                          <span className="text-sm tabular-nums text-neutral-500 dark:text-neutral-400">
                            {count} {count === 1 ? "day" : "days"}
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
