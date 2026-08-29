type CarModelLoadingOverlayProps = {
  progress?: number | null;
  message?: string;
};

export function CarModelLoadingOverlay({
  progress,
  message = "در حال بارگذاری مدل خودرو...",
}: CarModelLoadingOverlayProps) {
  const showBar = typeof progress === "number";

  return (
    <div
      className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-[var(--viewer-from)]/90 backdrop-blur-sm animate-fade-in"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div
        className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground"
        aria-hidden
      />
      <p className="label-kinetic text-sm text-muted-foreground">{message}</p>
      {showBar ? (
        <div
          className="h-1 w-32 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="پیشرفت بارگذاری مدل سه‌بعدی"
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      ) : null}
    </div>
  );
}
