import { useCallback, useState } from "react";

export function useCursorPagination(initialPageSize = 25) {
  const [pageSize, setPageSizeValue] = useState(initialPageSize);
  const [cursor, setCursor] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<string | null>>([]);

  const reset = useCallback(() => {
    setCursor(null);
    setHistory([]);
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeValue(size);
    setCursor(null);
    setHistory([]);
  }, []);

  const next = useCallback((nextCursor?: string | null) => {
    if (!nextCursor) return;
    setHistory((value) => [...value, cursor]);
    setCursor(nextCursor);
  }, [cursor]);

  const previous = useCallback(() => {
    setHistory((value) => {
      const copy = [...value];
      const previousCursor = copy.pop() ?? null;
      setCursor(previousCursor);
      return copy;
    });
  }, []);

  return {
    cursor,
    pageNumber: history.length + 1,
    pageSize,
    canPrevious: history.length > 0,
    setPageSize,
    next,
    previous,
    reset
  };
}
