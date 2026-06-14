import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { useOptionalI18n } from "@/app/i18n";
import { cn } from "@/utils/cn";
import { localizationKey } from "@/utils/localizationKey";

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, children, ...props }, ref) => {
  const i18n = useOptionalI18n();
  const localizedChildren = typeof children === "string"
    ? i18n?.t(`Ui.Label.${localizationKey(children)}`, children) ?? children
    : children;

  return (
    <LabelPrimitive.Root ref={ref} className={cn("text-sm font-medium leading-none text-slate-700", className)} {...props}>
      {localizedChildren}
    </LabelPrimitive.Root>
  );
});
Label.displayName = LabelPrimitive.Root.displayName;
