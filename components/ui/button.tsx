import * as React from "react";
import { cn } from "@/lib/utils";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "ghost" | "danger";
};

export function Button({ className, variant = "default", ...props }: Props) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-medium transition",
        "disabled:cursor-not-allowed disabled:opacity-50",
        {
          "bg-accent text-accent-foreground shadow-sm hover:bg-accent/90": variant === "default",
          "bg-white text-slate-800 shadow-sm hover:bg-slate-50": variant === "secondary",
          "text-slate-700 hover:bg-slate-100": variant === "ghost",
          "bg-rose-600 text-white shadow-sm hover:bg-rose-700": variant === "danger"
        },
        className
      )}
      {...props}
    />
  );
}
