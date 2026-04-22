import * as React from "react";

import { cn } from "@/lib/cn";

type ButtonVariant =
  | "default"
  | "outline"
  | "ghost"
  | "secondary"
  | "success"
  | "gradient"
  | "brand";

type ButtonSize = "sm" | "default" | "lg" | "icon";

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    size?: ButtonSize;
    asChild?: boolean;
  }
>(({ className, variant = "default", size = "default", asChild, ...props }, ref) => {
  const variantClass =
    variant === "outline"
      ? "border border-slate-200 bg-white text-slate-900 hover:bg-slate-50"
      : variant === "ghost"
        ? "bg-transparent text-slate-900 hover:bg-slate-100"
        : variant === "secondary"
          ? "bg-slate-100 text-slate-900 hover:bg-slate-200"
          : variant === "success"
            ? "bg-emerald-600 text-white hover:bg-emerald-700"
            : variant === "gradient"
              ? "bg-gradient-to-r from-pink-500 to-orange-500 text-white hover:opacity-95"
              : variant === "brand"
                ? "bg-gh-gold text-gh-plum hover:bg-gh-gold2"
                : "bg-gh-plum text-white hover:bg-gh-plum2";

  const sizeClass =
    size === "sm"
      ? "h-9 px-3 text-sm"
      : size === "lg"
        ? "h-12 px-5 text-base"
        : size === "icon"
          ? "h-10 w-10"
          : "h-10 px-4 text-sm";

  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gh-gold/40 disabled:pointer-events-none disabled:opacity-50",
    variantClass,
    sizeClass,
    className
  );

  if (asChild && React.isValidElement(props.children)) {
    const child = props.children as React.ReactElement<{ className?: string }>;
    const mergedClassName = cn(child.props.className, classes);
    return React.cloneElement(child, { className: mergedClassName });
  }

  return <button ref={ref} className={classes} {...props} />;
});
Button.displayName = "Button";
