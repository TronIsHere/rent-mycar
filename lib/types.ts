import type { WinningBid } from "@/lib/models/bid";
import type { AdZoneTransform } from "@/lib/compute-ad-zones";
import type { AdZoneConfig } from "@/lib/zones";

export type AdZoneWithTransform = AdZoneConfig & AdZoneTransform;

export type ZoneWithBid = AdZoneConfig & {
  winningBid: WinningBid | null;
};

export type BidFormData = {
  bidderName: string;
  phone: string;
  amount: number;
  adImage: File;
};
