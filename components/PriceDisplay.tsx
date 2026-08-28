import { formatPrice } from "@/lib/format";

type PriceDisplayProps = {
  amount: number;
  className?: string;
};

export function PriceDisplay({ amount, className }: PriceDisplayProps) {
  return <span className={className}>{formatPrice(amount)}</span>;
}
