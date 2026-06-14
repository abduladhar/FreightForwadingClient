import { useEffect } from "react";
import { env } from "@/app/env";

export function useDocumentTitle(title: string) {
  useEffect(() => {
    document.title = `${title} | ${env.VITE_APP_NAME}`;
  }, [title]);
}
