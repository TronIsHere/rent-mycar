"use client";

import { useEffect } from "react";

type BottomSheetProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function BottomSheet({
  open,
  onClose,
  title,
  subtitle,
  children,
}: BottomSheetProps) {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 animate-fade-in"
        style={{ background: "var(--overlay)" }}
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className="sheet-panel fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] flex-col animate-slide-up"
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b-2 border-border p-5">
          <div className="min-w-0">
            <h2 id="sheet-title" className="display-section">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-2 text-base text-muted-foreground md:text-lg">
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-outline shrink-0"
            aria-label="بستن"
          >
            بستن
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] [-webkit-overflow-scrolling:touch]">
          {children}
        </div>
      </div>
    </>
  );
}
