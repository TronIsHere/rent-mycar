import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";

export type PageView = {
  _id?: ObjectId;
  path: string;
  sessionId: string;
  referrer?: string;
  createdAt: Date;
};

export type PageViewAnalytics = {
  totalViews: number;
  viewsToday: number;
  viewsLast7Days: number;
  viewsLast30Days: number;
  uniqueSessionsToday: number;
  uniqueSessionsLast7Days: number;
  uniqueSessionsLast30Days: number;
  viewsByDay: { date: string; views: number; uniqueSessions: number }[];
  viewsByPath: { path: string; views: number }[];
};

const COLLECTION = "page_views";

export async function getPageViewsCollection() {
  const db = await getDb();
  return db.collection<PageView>(COLLECTION);
}

export async function recordPageView(input: {
  path: string;
  sessionId: string;
  referrer?: string;
}): Promise<void> {
  const collection = await getPageViewsCollection();
  await collection.insertOne({
    path: input.path,
    sessionId: input.sessionId,
    referrer: input.referrer || undefined,
    createdAt: new Date(),
  });
}

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getPageViewAnalytics(): Promise<PageViewAnalytics> {
  const collection = await getPageViewsCollection();
  const now = new Date();
  const todayStart = startOfDay(now);
  const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [
    totalViews,
    viewsToday,
    viewsLast7Days,
    viewsLast30Days,
    uniqueSessionsToday,
    uniqueSessionsLast7Days,
    uniqueSessionsLast30Days,
    viewsByDayRaw,
    viewsByPathRaw,
  ] = await Promise.all([
    collection.countDocuments(),
    collection.countDocuments({ createdAt: { $gte: todayStart } }),
    collection.countDocuments({ createdAt: { $gte: last7Days } }),
    collection.countDocuments({ createdAt: { $gte: last30Days } }),
    collection.distinct("sessionId", { createdAt: { $gte: todayStart } }),
    collection.distinct("sessionId", { createdAt: { $gte: last7Days } }),
    collection.distinct("sessionId", { createdAt: { $gte: last30Days } }),
    collection
      .aggregate<{ _id: string; views: number; sessions: string[] }>([
        { $match: { createdAt: { $gte: last30Days } } },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            views: { $sum: 1 },
            sessions: { $addToSet: "$sessionId" },
          },
        },
        { $sort: { _id: 1 } },
      ])
      .toArray(),
    collection
      .aggregate<{ _id: string; count: number }>([
        { $group: { _id: "$path", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ])
      .toArray(),
  ]);

  return {
    totalViews,
    viewsToday,
    viewsLast7Days,
    viewsLast30Days,
    uniqueSessionsToday: uniqueSessionsToday.length,
    uniqueSessionsLast7Days: uniqueSessionsLast7Days.length,
    uniqueSessionsLast30Days: uniqueSessionsLast30Days.length,
    viewsByDay: viewsByDayRaw.map((row) => ({
      date: row._id,
      views: row.views,
      uniqueSessions: row.sessions.length,
    })),
    viewsByPath: viewsByPathRaw.map((row) => ({
      path: row._id,
      views: row.count,
    })),
  };
}
