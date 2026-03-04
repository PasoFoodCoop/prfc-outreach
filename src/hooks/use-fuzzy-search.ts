import { useMemo } from "react";
import Fuse from "fuse.js";
import { useSearchQuery } from "@/components/layout/top-bar-search-context";
import { useDebounce } from "@/hooks/use-debounce";

interface UseFuzzySearchOptions {
  keys: string[];
  threshold?: number;
}

export function useFuzzySearch<T>(items: T[], options: UseFuzzySearchOptions): T[] {
  const query = useSearchQuery();
  const debouncedQuery = useDebounce(query, 300);

  const fuse = useMemo(
    () =>
      new Fuse(items, {
        keys: options.keys,
        threshold: options.threshold ?? 0.3,
        ignoreLocation: true,
      }),
    [items, options.keys, options.threshold],
  );

  return useMemo(() => {
    if (!debouncedQuery.trim()) {
      return items;
    }
    return fuse.search(debouncedQuery).map((result) => result.item);
  }, [fuse, items, debouncedQuery]);
}
