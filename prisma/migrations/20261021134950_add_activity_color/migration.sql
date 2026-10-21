-- AlterTable
ALTER TABLE "activities" ADD COLUMN     "color" TEXT NOT NULL DEFAULT 'rose';

-- Give existing activities distinct palette colors.
UPDATE "activities" AS activity
SET "color" = palette.color
FROM (
  SELECT
    id,
    (ARRAY[
      'rose',
      'orange',
      'amber',
      'lime',
      'emerald',
      'teal',
      'sky',
      'blue',
      'indigo',
      'violet',
      'fuchsia',
      'pink'
    ])[(row_number() OVER (ORDER BY "sort_order", "name") - 1) % 12 + 1] AS color
  FROM "activities"
) AS palette
WHERE activity.id = palette.id;
