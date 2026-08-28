/**
 * Ensures MongoDB indexes for bids collection.
 * Run: npx tsx scripts/seed-zones.ts
 */
import { getBidsCollection } from "../lib/models/bid";

async function main() {
  const collection = await getBidsCollection();
  await collection.createIndex({ zoneSlug: 1, status: 1, amount: -1 });
  await collection.createIndex({ status: 1, createdAt: -1 });
  console.log("MongoDB indexes created for bids collection.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
