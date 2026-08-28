import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { resolveMediaUrl } from "@/lib/media-url";
import { AD_ZONES, type ZoneSlug } from "@/lib/zones";

export type BidStatus = "pending" | "approved" | "rejected";

export type Bid = {
  _id?: ObjectId;
  zoneSlug: ZoneSlug;
  bidderName: string;
  phone: string;
  amount: number;
  adImageUrl: string;
  status: BidStatus;
  paymentScreenshotUrl?: string;
  paymentSubmittedAt?: Date;
  createdAt: Date;
};

export type BidDocument = Bid & { _id: ObjectId };

export type WinningBid = {
  _id: string;
  zoneSlug: ZoneSlug;
  bidderName: string;
  phone: string;
  amount: number;
  adImageUrl: string;
  createdAt: string;
};

const COLLECTION = "bids";

export async function getBidsCollection() {
  const db = await getDb();
  return db.collection<Bid>(COLLECTION);
}

export async function getWinningBidForZone(
  zoneSlug: ZoneSlug,
): Promise<WinningBid | null> {
  const collection = await getBidsCollection();
  const bid = await collection.findOne(
    { zoneSlug, status: "approved" },
    { sort: { amount: -1, createdAt: -1 } },
  );

  if (!bid) return null;

  return {
    _id: bid._id!.toString(),
    zoneSlug: bid.zoneSlug,
    bidderName: bid.bidderName,
    phone: bid.phone,
    amount: bid.amount,
    adImageUrl: resolveMediaUrl(bid.adImageUrl),
    createdAt: bid.createdAt.toISOString(),
  };
}

export async function getHighestApprovedAmount(
  zoneSlug: ZoneSlug,
): Promise<number> {
  const winning = await getWinningBidForZone(zoneSlug);
  return winning?.amount ?? 0;
}

export async function createBid(
  bid: Omit<Bid, "_id" | "status" | "createdAt">,
): Promise<string> {
  const collection = await getBidsCollection();
  const result = await collection.insertOne({
    ...bid,
    status: "pending",
    createdAt: new Date(),
  });
  return result.insertedId.toString();
}

export async function getPendingBids(): Promise<BidDocument[]> {
  return getBidsByStatus("pending");
}

export async function getBidsByStatus(
  status: BidStatus,
): Promise<BidDocument[]> {
  const collection = await getBidsCollection();
  return collection
    .find({ status })
    .sort({ createdAt: -1 })
    .toArray() as Promise<BidDocument[]>;
}

export type BidAnalytics = {
  totalBids: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalApprovedValue: number;
  activeAdValue: number;
  zonesFilled: number;
  totalZones: number;
  bidsByZone: { zoneSlug: ZoneSlug; count: number }[];
};

export async function getBidAnalytics(): Promise<BidAnalytics> {
  const collection = await getBidsCollection();

  const [statusCounts, zoneCounts, totalApprovedValue, winningBids] =
    await Promise.all([
      collection
        .aggregate<{ _id: BidStatus; count: number }>([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ])
        .toArray(),
      collection
        .aggregate<{ _id: ZoneSlug; count: number }>([
          { $group: { _id: "$zoneSlug", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray(),
      collection
        .aggregate<{ total: number }>([
          { $match: { status: "approved" } },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ])
        .toArray(),
      Promise.all(AD_ZONES.map((zone) => getWinningBidForZone(zone.slug))),
    ]);

  const countByStatus = Object.fromEntries(
    statusCounts.map((row) => [row._id, row.count]),
  ) as Partial<Record<BidStatus, number>>;

  const pendingCount = countByStatus.pending ?? 0;
  const approvedCount = countByStatus.approved ?? 0;
  const rejectedCount = countByStatus.rejected ?? 0;

  return {
    totalBids: pendingCount + approvedCount + rejectedCount,
    pendingCount,
    approvedCount,
    rejectedCount,
    totalApprovedValue: totalApprovedValue[0]?.total ?? 0,
    activeAdValue: winningBids.reduce(
      (sum, bid) => sum + (bid?.amount ?? 0),
      0,
    ),
    zonesFilled: winningBids.filter(Boolean).length,
    totalZones: AD_ZONES.length,
    bidsByZone: zoneCounts.map((row) => ({
      zoneSlug: row._id,
      count: row.count,
    })),
  };
}

export async function updateBidStatus(
  id: string,
  status: BidStatus,
): Promise<boolean> {
  const collection = await getBidsCollection();
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { status } },
  );
  return result.modifiedCount === 1;
}

export async function updateBidAdImage(
  id: string,
  adImageUrl: string,
): Promise<boolean> {
  const collection = await getBidsCollection();
  const result = await collection.updateOne(
    { _id: new ObjectId(id) },
    { $set: { adImageUrl } },
  );
  return result.modifiedCount === 1;
}

export async function deleteBid(id: string): Promise<boolean> {
  const collection = await getBidsCollection();
  const result = await collection.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

export async function getBidById(id: string): Promise<BidDocument | null> {
  const collection = await getBidsCollection();
  return collection.findOne({ _id: new ObjectId(id) }) as Promise<BidDocument | null>;
}

export async function submitPaymentProof(
  id: string,
  phone: string,
  paymentScreenshotUrl: string,
): Promise<boolean> {
  const collection = await getBidsCollection();
  const result = await collection.updateOne(
    {
      _id: new ObjectId(id),
      phone,
      status: "pending",
      paymentScreenshotUrl: { $exists: false },
    },
    {
      $set: {
        paymentScreenshotUrl,
        paymentSubmittedAt: new Date(),
      },
    },
  );
  return result.modifiedCount === 1;
}
