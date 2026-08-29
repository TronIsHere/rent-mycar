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
  const isOccupied = Boolean(winning);

  return (
    <button
      type="button"
      onClick={() => onSelect(zone.slug)}
      className={`group kinetic-card relative w-full cursor-pointer overflow-hidden p-4 text-right lg:p-3.5 ${
        selected ? "kinetic-card-selected" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="kinetic-card-fg text-lg font-bold leading-none md:text-xl lg:text-base">
              {zone.label}
            </h3>
            <span
              className={`label-kinetic border px-2 py-1 ${
                isOccupied
                  ? "border-success bg-success-bg text-success-text group-hover:border-black group-hover:bg-black/10 group-hover:text-black"
                  : "border-border bg-muted text-muted-foreground group-hover:border-black group-hover:bg-black/10 group-hover:text-black"
              }`}
            >
              {isOccupied ? "اجاره شده" : "آزاد"}
            </span>
          </div>
          <p className="kinetic-card-muted mt-2 text-sm text-muted-foreground lg:mt-1.5 lg:text-xs">
            {winning ? (
              <>
                مالک:{" "}
                <span className="kinetic-card-fg font-bold text-foreground">
                  {winning.bidderName}
                </span>
              </>
            ) : (
              "اولین پیشنهاد را شما بدهید"
            )}
          </p>
        </div>

        {winning?.adImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={winning.adImageUrl}
            alt={`تبلیغ ${zone.label}`}
            className="h-14 w-14 shrink-0 border-2 border-border bg-background object-contain p-1 group-hover:border-black md:h-16 md:w-16 lg:h-12 lg:w-12"
          />
        ) : (
          <div className="flex h-14 w-14 shrink-0 items-center justify-center border-2 border-dashed border-border bg-muted text-xs text-muted-foreground group-hover:border-black group-hover:text-black md:h-16 md:w-16 lg:h-12 lg:w-12">
            خالی
          </div>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t-2 border-border pt-3 group-hover:border-black lg:mt-2 lg:pt-2">
        <span className="kinetic-card-muted label-kinetic text-muted-foreground">
          {isOccupied ? "بالاترین" : "حداقل"}
        </span>
        <PriceDisplay
          amount={currentAmount}
          className="kinetic-card-fg text-base font-bold md:text-lg lg:text-sm"
        />
      </div>
    </button>
  );
}
