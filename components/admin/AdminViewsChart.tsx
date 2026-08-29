type DayStat = {
  date: string;
  views: number;
  uniqueSessions: number;
};

export function AdminViewsChart({ data }: { data: DayStat[] }) {
  const maxViews = Math.max(...data.map((day) => day.views), 1);

  return (
    <div className="space-y-2">
      {data.map((day) => {
        const widthPercent = Math.max(
          (day.views / maxViews) * 100,
          day.views > 0 ? 4 : 0,
        );

        return (
          <div
            key={day.date}
            className="grid grid-cols-[5.5rem_1fr_5rem] items-center gap-3 text-sm"
          >
            <span className="text-xs text-muted-foreground" dir="ltr">
              {day.date}
            </span>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-foreground/70"
                style={{ width: `${widthPercent}%` }}
              />
            </div>
            <span className="text-left text-xs text-muted-foreground">
              {day.uniqueSessions.toLocaleString("fa-IR")}
            </span>
          </div>
        );
      })}
    </div>
  );
}
