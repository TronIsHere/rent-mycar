import { PriceDisplay } from "@/components/PriceDisplay";
import type { ZoneWithBid } from "@/lib/types";

type ZoneCardProps = {
  zone: ZoneWithBid;
  selected: boolean;
  onSelect: (slug: string) => void;
};

export function ZoneCard({ zone, selected, onSelect }: ZoneCardProps) {
  const winning = zone.winningBid;
  const currentAmount = winning?.amount ?? zone.minBid;

  return (
    <button
      type="button"
      onClick={() => onSelect(zone.slug)}
      className={`w-full rounded-2xl border p-4 text-right transition-all ${
        selected
          ? "border-accent bg-selected shadow-md ring-2 ring-accent/20"
          : "border-border bg-card hover:border-accent/40 hover:shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold text-foreground">{zone.label}</h3>
          <p className="mt-1 text-sm text-muted">
            {winning ? (
              <>
                مالک فعلی:{" "}
                <span className="font-medium text-foreground">
                  {winning.bidderName}
                </span>
              </>
            ) : (
              "هنوز اجاره داده نشده"
            )}
          </p>
        </div>
        {winning?.adImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={winning.adImageUrl}
            alt={`تبلیغ ${zone.label}`}
            className="h-14 w-14 shrink-0 rounded-lg border border-border object-cover"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-dashed border-border bg-background text-xs text-muted">
            خالی
          </div>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-muted">بالاترین پیشنهاد</span>
        <PriceDisplay amount={currentAmount} className="font-semibold text-accent" />
      </div>
      {!winning && (
        <p className="mt-2 text-xs text-muted">
          حداقل پیشنهاد: <PriceDisplay amount={zone.minBid} />
        </p>
      )}
    </button>
  );
}
