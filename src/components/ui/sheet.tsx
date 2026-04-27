"use client";

import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/cn";

type SheetContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
};

const SheetContext = React.createContext<SheetContextValue | null>(null);

export function Sheet({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  children,
}: {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;

  const setOpen = React.useCallback(
    (nextOpen: boolean) => {
      onOpenChange?.(nextOpen);
      if (controlledOpen === undefined) setUncontrolledOpen(nextOpen);
    },
    [controlledOpen, onOpenChange]
  );

  return (
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

export function SheetTrigger({
  asChild = true,
  children,
}: {
  asChild?: boolean;
  children: React.ReactElement<any>;
}) {
  const ctx = React.useContext(SheetContext);
  if (!ctx) throw new Error("SheetTrigger must be used within Sheet");

  const triggerProps = {
    onClick: (e: React.MouseEvent) => {
      children.props?.onClick?.(e);
      if (!e.defaultPrevented) ctx.setOpen(true);
    },
  };

  if (asChild) return React.cloneElement(children, triggerProps);
  return (
    <button type="button" {...triggerProps}>
      {children}
    </button>
  );
}

export function SheetClose({
  asChild = true,
  children,
}: {
  asChild?: boolean;
  children: React.ReactElement<any>;
}) {
  const ctx = React.useContext(SheetContext);
  if (!ctx) throw new Error("SheetClose must be used within Sheet");

  const closeProps = {
    onClick: (e: React.MouseEvent) => {
      children.props?.onClick?.(e);
      if (!e.defaultPrevented) ctx.setOpen(false);
    },
  };

  if (asChild) return React.cloneElement(children, closeProps);
  return (
    <button type="button" {...closeProps}>
      {children}
    </button>
  );
}

export function SheetContent({
  side = "right",
  className,
  children,
}: {
  side?: "right" | "left";
  className?: string;
  children: React.ReactNode;
}) {
  const ctx = React.useContext(SheetContext);
  if (!ctx) throw new Error("SheetContent must be used within Sheet");

  React.useEffect(() => {
    if (!ctx.open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") ctx.setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [ctx]);

  if (!ctx.open || typeof document === "undefined") return null;

  const sideClass =
    side === "left" ? "left-0 -translate-x-0" : "right-0 translate-x-0";
  const startTransform = side === "left" ? "-translate-x-full" : "translate-x-full";

  return createPortal(
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={() => ctx.setOpen(false)}
      />
      <div
        className={cn(
          "absolute top-0 h-full w-[min(92vw,420px)] border border-slate-200 bg-white shadow-2xl transition-transform",
          sideClass,
          ctx.open ? "translate-x-0" : startTransform,
          className
        )}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
