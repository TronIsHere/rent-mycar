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

export function AdInsights() {
  return (
    <section
      aria-label="راهنمای اجاره فضای تبلیغاتی"
      className="rounded-2xl border border-border bg-card p-4 sm:p-5"
    >
      <h2 className="text-sm font-bold text-foreground sm:text-base">
        نکات مهم
      </h2>
      <ul className="mt-3 space-y-3">
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
