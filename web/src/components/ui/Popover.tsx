/**
 * Pulse Web — components/ui/Popover.tsx
 * Version: v0.3.1
 */

import React, {
  createContext, useContext, useEffect, useMemo, useRef,
  useState, cloneElement
} from "react";

type CtxType = {
  open: boolean;
  setOpen: (v: boolean) => void;
  triggerRef: React.RefObject<HTMLElement>;
  contentRef: React.RefObject<HTMLDivElement>;
};
const Ctx = createContext<CtxType | null>(null);

export const Popover = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      const t = e.target as Node;
      if (contentRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      setOpen(false);
    }
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") setOpen(false); }
    if (open) {
      document.addEventListener("mousedown", onDown);
      document.addEventListener("keydown", onKey);
    }
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const value = useMemo(() => ({ open, setOpen, triggerRef, contentRef }), [open]);

  return (
    <Ctx.Provider value={value}>
      <div className="relative inline-block">{children}</div>
    </Ctx.Provider>
  );
};

export const usePopover = () => {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("usePopover must be used inside <Popover>");
  return ctx;
};

export const PopoverTrigger = ({
  asChild,
  children,
  ...rest
}: {
  asChild?: boolean;
  children: React.ReactElement;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) => {
  const ctx = usePopover();
  const common = {
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      ctx.setOpen(!ctx.open);
      children.props?.onClick?.(e);
    },
    ref: ctx.triggerRef as any,
    "aria-expanded": ctx.open,
    "aria-haspopup": "dialog" as const,
  };
  if (asChild) return cloneElement(children, { ...children.props, ...common });
  return <button type="button" {...common} {...rest}>{children}</button>;
};

export const PopoverContent = ({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  const ctx = usePopover();
  if (!ctx.open) return null;
  return (
    <div
      ref={ctx.contentRef}
      role="dialog"
      className={`absolute right-0 top-full z-50 mt-2 w-64 rounded-2xl border border-gray-200 bg-white p-3 shadow-lg ${className}`}
    >
      {children}
    </div>
  );
};
