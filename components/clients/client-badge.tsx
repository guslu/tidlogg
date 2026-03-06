import { cn, getContrastTextColor } from "@/lib/utils";

type ClientBadgeProps = {
  name: string;
  color?: string | null;
  className?: string;
};

function isHex(color: string | null | undefined): boolean {
  return !!color && /^#[0-9A-Fa-f]{6}$/.test(color);
}

export function ClientBadge({ name, color, className }: ClientBadgeProps) {
  if (isHex(color)) {
    return (
      <span
        className={cn("inline-flex items-center rounded-full px-2 py-1 text-xs font-medium", className)}
        style={{
          backgroundColor: color,
          color: getContrastTextColor(color)
        }}
      >
        {name}
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-800",
        className
      )}
    >
      {name}
    </span>
  );
}
