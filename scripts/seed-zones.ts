/**
 * Ensures MongoDB indexes for bids and page_views collections.
 * Run: npx tsx scripts/seed-zones.ts
 */
import { getBidsCollection } from "../lib/models/bid";
import { getPageViewsCollection } from "../lib/models/page-view";

async function main() {
  const bids = await getBidsCollection();
  await bids.createIndex({ zoneSlug: 1, status: 1, amount: -1 });
  await bids.createIndex({ status: 1, createdAt: -1 });

  const pageViews = await getPageViewsCollection();
  await pageViews.createIndex({ createdAt: -1 });
  await pageViews.createIndex({ path: 1, createdAt: -1 });
  await pageViews.createIndex({ sessionId: 1, createdAt: -1 });

  console.log("MongoDB indexes created for bids and page_views collections.");
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
