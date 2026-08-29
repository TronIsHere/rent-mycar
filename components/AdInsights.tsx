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
    <section aria-label="راهنمای اجاره فضای تبلیغاتی">
      {!embedded && (
        <div className="mb-6 border-b-2 border-border pb-4">
          <h2 className="display-section">نکات مهم</h2>
          <p className="mt-3 text-lg text-muted-foreground">
            قبل از ثبت پیشنهاد بخوانید
          </p>
        </div>
      )}

      <ul className="grid gap-px border-2 border-border bg-border">
        {insights.map((item, index) => (
          <li
            key={item.title}
            className="group kinetic-card bg-card p-6 transition-colors duration-300 hover:bg-accent hover:text-accent-foreground"
          >
            <p className="label-kinetic text-muted-foreground group-hover:text-black/60">
              {String(index + 1).padStart(2, "0")}
            </p>
            <p className="mt-2 text-xl font-bold leading-tight md:text-2xl">
              {item.title}
            </p>
            <p className="mt-3 text-base leading-8 text-muted-foreground group-hover:text-black/70 md:text-lg">
              {item.body}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
