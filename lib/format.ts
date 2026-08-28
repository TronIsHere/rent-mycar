export function formatPrice(amount: number): string {
  return `${amount.toLocaleString("fa-IR")} تومان`;
}

export function formatPhoneDisplay(phone: string): string {
  return phone.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)] ?? d);
}
