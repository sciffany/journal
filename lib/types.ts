import {
  BookOpen,
  Film,
  Lightbulb,
  Sparkles,
  ListChecks,
  Heart,
  StickyNote,
  type LucideIcon,
} from "lucide-react";

export type EntryType = {
  slug: string;
  label: string;
  icon: LucideIcon;
  placeholder?: string;
};

export const ENTRY_TYPES: EntryType[] = [
  {
    slug: "journal",
    label: "Journal",
    icon: BookOpen,
    placeholder: "What happened today?",
  },
  {
    slug: "movies",
    label: "Movie Ratings",
    icon: Film,
    placeholder: "Movie title...",
  },
  {
    slug: "ideas",
    label: "Ideas",
    icon: Lightbulb,
    placeholder: "A wild idea...",
  },
  {
    slug: "concepts",
    label: "Concepts",
    icon: Sparkles,
    placeholder: "A concept to remember...",
  },
  {
    slug: "todos",
    label: "Todos",
    icon: ListChecks,
    placeholder: "Something to do...",
  },
  {
    slug: "gratitude",
    label: "Gratitude",
    icon: Heart,
    placeholder: "Something I'm grateful for...",
  },
];

export const ENTRY_TYPE_BY_SLUG = new Map(
  ENTRY_TYPES.map((t) => [t.slug, t] as const),
);

export function getEntryType(slug: string): EntryType {
  return (
    ENTRY_TYPE_BY_SLUG.get(slug) ?? {
      slug,
      label: slug.charAt(0).toUpperCase() + slug.slice(1),
      icon: StickyNote,
    }
  );
}

export function isKnownType(slug: string): boolean {
  return ENTRY_TYPE_BY_SLUG.has(slug);
}
