import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "default", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50",
        {
          "bg-accent text-accent-foreground hover:bg-accent/90": variant === "default",
          "bg-slate-200 text-slate-900 hover:bg-slate-300": variant === "secondary",
          "hover:bg-slate-100": variant === "ghost",
          "bg-rose-600 text-white hover:bg-rose-700": variant === "danger"
        },
        className
      )}
      {...props}
    />
  );
}
