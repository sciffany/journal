export const ACTIVITY_COLORS = [
  {
    id: "rose",
    label: "Rose",
    dot: "bg-rose-300",
    cell: "bg-rose-300 hover:bg-rose-400",
  },
  {
    id: "orange",
    label: "Orange",
    dot: "bg-orange-300",
    cell: "bg-orange-300 hover:bg-orange-400",
  },
  {
    id: "amber",
    label: "Amber",
    dot: "bg-amber-300",
    cell: "bg-amber-300 hover:bg-amber-400",
  },
  {
    id: "lime",
    label: "Lime",
    dot: "bg-lime-300",
    cell: "bg-lime-300 hover:bg-lime-400",
  },
  {
    id: "emerald",
    label: "Emerald",
    dot: "bg-emerald-300",
    cell: "bg-emerald-300 hover:bg-emerald-400",
  },
  {
    id: "teal",
    label: "Teal",
    dot: "bg-teal-300",
    cell: "bg-teal-300 hover:bg-teal-400",
  },
  {
    id: "sky",
    label: "Sky",
    dot: "bg-sky-300",
    cell: "bg-sky-300 hover:bg-sky-400",
  },
  {
    id: "blue",
    label: "Blue",
    dot: "bg-blue-300",
    cell: "bg-blue-300 hover:bg-blue-400",
  },
  {
    id: "indigo",
    label: "Indigo",
    dot: "bg-indigo-300",
    cell: "bg-indigo-300 hover:bg-indigo-400",
  },
  {
    id: "violet",
    label: "Violet",
    dot: "bg-violet-300",
    cell: "bg-violet-300 hover:bg-violet-400",
  },
  {
    id: "fuchsia",
    label: "Fuchsia",
    dot: "bg-fuchsia-300",
    cell: "bg-fuchsia-300 hover:bg-fuchsia-400",
  },
  {
    id: "pink",
    label: "Pink",
    dot: "bg-pink-300",
    cell: "bg-pink-300 hover:bg-pink-400",
  },
] as const;

export type ActivityColorId = (typeof ACTIVITY_COLORS)[number]["id"];

const COLOR_IDS = new Set<string>(ACTIVITY_COLORS.map((color) => color.id));

export function isActivityColor(value: string): value is ActivityColorId {
  return COLOR_IDS.has(value);
}

export function activityColor(id: string) {
  return (
    ACTIVITY_COLORS.find((color) => color.id === id) ?? ACTIVITY_COLORS[0]
  );
}

/** Least-used palette color, so new activities stay visually distinct. */
export function nextActivityColor(used: string[]): ActivityColorId {
  const counts = new Map<string, number>(
    ACTIVITY_COLORS.map((color) => [color.id, 0]),
  );
  for (const color of used) {
    if (!counts.has(color)) continue;
    counts.set(color, (counts.get(color) ?? 0) + 1);
  }

  let best: ActivityColorId = ACTIVITY_COLORS[0].id;
  let bestCount = Infinity;
  for (const color of ACTIVITY_COLORS) {
    const count = counts.get(color.id) ?? 0;
    if (count < bestCount) {
      best = color.id;
      bestCount = count;
    }
  }
  return best;
}
