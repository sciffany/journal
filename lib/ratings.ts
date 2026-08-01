export const RATING_MIN = 1;
export const RATING_MAX = 10;

export function getStarsFromMetadata(metadata: unknown): number | null {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }
  const stars = (metadata as Record<string, unknown>).stars;
  if (typeof stars !== "number" || !Number.isInteger(stars)) return null;
  if (stars < RATING_MIN || stars > RATING_MAX) return null;
  return stars;
}

export function parseStarsFromMetadataRaw(raw: string): number | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    return getStarsFromMetadata(JSON.parse(trimmed));
  } catch {
    return null;
  }
}

/** Merge or remove `stars` in a metadata JSON string, preserving other keys when possible. */
export function mergeStarsIntoMetadata(
  raw: string,
  stars: number | null,
): string {
  let obj: Record<string, unknown> = {};
  const trimmed = raw.trim();
  if (trimmed) {
    try {
      const parsed = JSON.parse(trimmed) as unknown;
      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        obj = { ...(parsed as Record<string, unknown>) };
      }
    } catch {
      // Invalid JSON — rebuild from stars alone.
    }
  }

  if (stars == null) {
    delete obj.stars;
  } else {
    obj.stars = stars;
  }

  if (Object.keys(obj).length === 0) return "";
  return JSON.stringify(obj, null, 2);
}
