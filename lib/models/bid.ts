import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import type { ZoneSlug } from "@/lib/zones";

export type BidStatus = "pending" | "approved" | "rejected";

export type Bid = {
  _id?: ObjectId;
  zoneSlug: ZoneSlug;
  bidderName: string;
  phone: string;
  amount: number;
  adImageUrl: string;
  status: BidStatus;
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
    adImageUrl: bid.adImageUrl,
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
  const collection = await getBidsCollection();
  return collection
    .find({ status: "pending" })
    .sort({ createdAt: -1 })
    .toArray() as Promise<BidDocument[]>;
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

export async function getBidById(id: string): Promise<BidDocument | null> {
  const collection = await getBidsCollection();
  return collection.findOne({ _id: new ObjectId(id) }) as Promise<BidDocument | null>;
}
