/* 
 * Pulse UI — Popover (fixed-position, boundary-clamped)
 * Version: v0.6.4
 *
 * New: forceTopPx (absolute, viewport px). If provided, top = max(forceTopPx, computed).
 * Keeps: pointerdown (capture) for outside-close, fixed portal to body, boundary clamp.
 */

import * as React from "react";
import { createPortal } from "react-dom";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type Ctx = {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
};

const PopoverContext = React.createContext<Ctx | null>(null);
export function usePopover(): Ctx {
  const ctx = React.useContext(PopoverContext);
  if (!ctx) throw new Error("usePopover must be used within <Popover>");
  return ctx;
}

type PopoverProps = React.HTMLAttributes<HTMLDivElement> & { defaultOpen?: boolean };
export function Popover({ defaultOpen = false, className, children, ...rest }: PopoverProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  const toggle = React.useCallback(() => setOpen(v => !v), []);

  React.useEffect(() => {
    if (!open) return;
    const onPD = (ev: PointerEvent) => {
      const t = ev.target as Node;
      if (!t) return;
      if (contentRef.current && contentRef.current.contains(t)) return;
      if (triggerRef.current && triggerRef.current.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("pointerdown", onPD, true);
    return () => document.removeEventListener("pointerdown", onPD, true);
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (ev: KeyboardEvent) => { if (ev.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <PopoverContext.Provider value={{ open, setOpen, toggle, triggerRef, contentRef }}>
      <div className={cn("relative inline-block", className)} {...rest}>
        {children}
      </div>
    </PopoverContext.Provider>
  );
}

type TriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean };
export const PopoverTrigger = React.forwardRef<HTMLButtonElement, TriggerProps>(
  ({ className, asChild, children, onClick, ...props }, ref) => {
    const { toggle, triggerRef } = usePopover();

    const handle = (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      toggle();
    };

    const classes = cn(
      "h-9 px-4 rounded-full text-sm leading-tight border bg-white hover:bg-gray-50 border-gray-300 text-gray-800",
      "inline-flex items-center gap-2 whitespace-nowrap flex-shrink-0",
      className
    );

    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement, {
        ref: (node: HTMLElement) => {
          // @ts-ignore
          if (typeof (children as any).ref === "function") (children as any).ref(node);
          triggerRef.current = node;
          if (typeof ref === "function") ref(node as any);
        },
        onClick: (e: any) => {
          // @ts-ignore
          children.props.onClick?.(e);
          handle(e);
        },
        className: cn((children as any).props?.className, classes),
      });
    }

    return (
      <button
        ref={(node) => {
          triggerRef.current = node as any;
          if (typeof ref === "function") ref(node);
        }}
        type="button"
        onClick={handle}
        className={classes}
        {...props}
      >
        {children as React.ReactNode}
      </button>
    );
  }
);
PopoverTrigger.displayName = "PopoverTrigger";

type ContentProps = React.HTMLAttributes<HTMLDivElement> & {
  container?: HTMLElement | null;   // boundary clamp element
  align?: "start" | "center" | "end";
  sideOffset?: number;
  minTop?: number;                  // min top relative to container top (legacy)
  centerOnMobile?: boolean;
  forceTopPx?: number;              // absolute viewport top (px), overrides when higher
};
export const PopoverContent = React.forwardRef<HTMLDivElement, ContentProps>(
  ({ className, container, sideOffset = 8, align = "start", minTop, centerOnMobile = true, forceTopPx, children, ...rest }, ref) => {
    const { open, contentRef, triggerRef } = usePopover();
    const [style, setStyle] = React.useState<React.CSSProperties>({});

    const compute = React.useCallback(() => {
      const trig = triggerRef.current; if (!trig) return;
      const boundary = container ?? document.body;
      const b = boundary.getBoundingClientRect();
      const t = trig.getBoundingClientRect();

      const isMobile = window.innerWidth < 768;
      const maxWidth = Math.min(b.width - 16, 360);
      const width = maxWidth;

      // start under trigger
      let top = t.bottom + sideOffset + (isMobile ? 24 : 0);

      // legacy minTop (container-relative)
      if (typeof minTop === "number") {
        const limit = b.top + minTop + sideOffset;
        if (top < limit) top = limit;
      }
      // absolute override
      if (typeof forceTopPx === "number") {
        top = Math.max(top, forceTopPx);
      }

      let left: number;
      if (isMobile && centerOnMobile) {
        left = b.left + (b.width - width) / 2;
      } else {
        if (align === "start") left = t.left;
        else if (align === "end") left = t.right - width;
        else left = t.left + t.width / 2 - width / 2;
        const minL = b.left + 8, maxL = b.right - width - 8;
        left = Math.max(minL, Math.min(left, maxL));
      }

      const maxTop = Math.min(b.bottom - 8, window.innerHeight - 8);
      const minTopPxAbs = Math.max(b.top + 8, 8);
      top = Math.max(minTopPxAbs, Math.min(top, maxTop));

      setStyle({ position: "fixed", top, left, width, boxSizing: "border-box", zIndex: 3000 });
    }, [container, align, sideOffset, minTop, centerOnMobile, forceTopPx]);

    React.useEffect(() => {
      if (!open) return;
      compute();
      const onScroll = () => compute();
      const onResize = () => compute();
      window.addEventListener("scroll", onScroll, true);
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("scroll", onScroll, true);
        window.removeEventListener("resize", onResize);
      };
    }, [open, compute]);

    const node = (
      <div
        ref={(el) => {
          contentRef.current = el;
          if (typeof ref === "function") ref(el!);
        }}
        style={style}
        className={cn(
          "rounded-2xl border border-gray-200 bg-white shadow-lg outline-none p-0 max-h-[70vh] overflow-auto",
          className
        )}
        {...rest}
      >
        {children}
      </div>
    );
    if (!open) return null;
    return createPortal(node, document.body);
  }
);
PopoverContent.displayName = "PopoverContent";
