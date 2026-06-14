import { format } from "date-fns";

interface DateDisplayProps {
  value: string | Date | null | undefined;
  pattern?: string;
  fallback?: string;
  className?: string;
}

export function DateDisplay({ value, pattern = "dd MMM yyyy", fallback = "-", className }: DateDisplayProps) {
  if (!value) return <span className={className}>{fallback}</span>;
  return <span className={className}>{format(new Date(value), pattern)}</span>;
}
