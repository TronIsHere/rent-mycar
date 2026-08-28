const insights = [
  {
    title: "تبلیغ چند وقت نمایش داده می‌شود؟",
    body: "تا زمانی که کسی برای همان فضا پیشنهاد بالاتری ندهد و آن تأیید شود. محدودیت زمانی ثابتی وجود ندارد.",
  },
  {
    title: "چطور جایگاه را از دست می‌دهید؟",
    body: "اگر فرد دیگری مبلغ بیشتری پیشنهاد دهد، پرداخت کند و مدیر آن را تأیید کند، تبلیغ او جایگزین تبلیغ شما می‌شود.",
  },
  {
    title: "چطور تبلیغ روی خودرو می‌آید؟",
    body: "فضا را انتخاب کنید، پیشنهاد بالاتر بدهید، تصویر تبلیغ را آپلود کنید و پس از پرداخت، منتظر تأیید مدیر بمانید.",
  },
];

type AdInsightsProps = {
  embedded?: boolean;
};

export function AdInsights({ embedded = false }: AdInsightsProps) {
  return (
    <section
      aria-label="راهنمای اجاره فضای تبلیغاتی"
      className={
        embedded
          ? undefined
          : "rounded-2xl border border-border bg-card p-4 sm:p-5"
      }
    >
      {!embedded ? (
        <h2 className="text-sm font-bold text-foreground sm:text-base">
          نکات مهم
        </h2>
      ) : (
        <p className="mb-1 text-sm font-bold text-foreground">نکات مهم</p>
      )}
      <ul className={embedded ? "space-y-3" : "mt-3 space-y-3"}>
        {insights.map((item) => (
          <li key={item.title} className="text-sm leading-7">
            <p className="font-medium text-foreground">{item.title}</p>
            <p className="mt-0.5 text-muted">{item.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
