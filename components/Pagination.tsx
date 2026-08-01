import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  page: number;
  totalPages: number;
  hrefForPage: (page: number) => string;
};

export function Pagination({ page, totalPages, hrefForPage }: Props) {
  if (totalPages <= 1) return null;

  const prev = page > 1 ? hrefForPage(page - 1) : null;
  const next = page < totalPages ? hrefForPage(page + 1) : null;

  return (
    <nav
      className="flex items-center justify-between gap-2 sm:gap-4"
      aria-label="Pagination"
    >
      {prev ? (
        <Button asChild variant="outline" size="sm">
          <Link href={prev}>
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Previous</span>
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Previous</span>
        </Button>
      )}

      <span className="text-sm text-neutral-500 dark:text-neutral-400">
        Page{" "}
        <span className="font-medium text-neutral-900 dark:text-neutral-100">
          {page}
        </span>{" "}
        of{" "}
        <span className="font-medium text-neutral-900 dark:text-neutral-100">
          {totalPages}
        </span>
      </span>

      {next ? (
        <Button asChild variant="outline" size="sm">
          <Link href={next}>
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Button variant="outline" size="sm" disabled>
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </nav>
  );
}
