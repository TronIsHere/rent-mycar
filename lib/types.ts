import type { WinningBid } from "@/lib/models/bid";
import type { AdZoneConfig } from "@/lib/zones";

export type ZoneWithBid = AdZoneConfig & {
  winningBid: WinningBid | null;
};

export type BidFormData = {
  bidderName: string;
  phone: string;
  amount: number;
  adImage: File;
};
