export function formatPrice(amount: number): string {
  return `${amount.toLocaleString("fa-IR")} تومان`;
}

function toAsciiDigits(value: string): string {
  return value.replace(/[۰-۹٠-٩]/g, (char) => {
    const code = char.charCodeAt(0);
    if (code >= 0x06f0 && code <= 0x06f9) return String(code - 0x06f0);
    if (code >= 0x0660 && code <= 0x0669) return String(code - 0x0660);
    return char;
  });
}

export function extractDigits(value: string): string {
  return toAsciiDigits(value).replace(/[^\d]/g, "");
}

export function formatNumberDisplay(digits: string): string {
  if (!digits) return "";
  return Number(digits).toLocaleString("fa-IR");
}

export function parseNumberInput(value: string): number {
  return Number(extractDigits(value));
}

export function formatPhoneDisplay(phone: string): string {
  return phone.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)] ?? d);
}
