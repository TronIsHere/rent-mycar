"use client";

type BluBankCardProps = {
  cardNumber: string;
  cardHolder: string;
  bankName?: string;
  copied: boolean;
  onCopy: () => void;
};

function formatCardNumber(cardNumber: string) {
  const digits = cardNumber.replace(/\D/g, "");
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
}

function EmvChip() {
  return (
    <div className="relative h-9 w-11 overflow-hidden rounded-md" aria-hidden>
      <div className="absolute inset-0 bg-linear-to-br from-[#e8d5a3] via-[#c9a84c] to-[#a8842a]" />
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-px p-1">
        {Array.from({ length: 9 }).map((_, index) => (
          <div key={index} className="rounded-[1px] bg-[#b8943a]/60" />
        ))}
      </div>
      <div className="absolute inset-x-1 top-1/2 h-px -translate-y-1/2 bg-[#8a6b22]/50" />
      <div className="absolute inset-y-1 left-1/2 w-px -translate-x-1/2 bg-[#8a6b22]/50" />
    </div>
  );
}

function BluLogo() {
  return (
    <div
      className="relative inline-flex items-end text-3xl font-bold leading-none tracking-tight lowercase "
      dir="ltr"
    >
      <span className="relative">
        <span className="absolute -top-1.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white" />
        b
      </span>
      <span>lu</span>
    </div>
  );
}

export function BluBankCard({
  cardNumber,
  cardHolder,
  bankName = "بلو بانک",
  copied,
  onCopy,
}: BluBankCardProps) {
  const formattedNumber = formatCardNumber(cardNumber);

  return (
    <div className="mx-auto w-full max-w-[220px]">
      <div
        className="relative aspect-[5/8] overflow-hidden rounded-[1.35rem] shadow-[0_18px_40px_-12px_rgba(47,111,237,0.55)]"
        style={{ backgroundColor: "#2f6fed" }}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-linear-to-br from-white/12 via-transparent to-black/10"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10 blur-2xl"
          aria-hidden
        />

        <div className="relative flex h-full flex-col px-5 py-6 text-white">
          <div className="flex justify-center">
            <EmvChip />
          </div>

          <div className="flex flex-1 flex-col justify-center">
            <p className="text-center text-[11px] font-light tracking-[0.18em] lowercase opacity-90">
              bank, but lovely
            </p>

            <div className="mt-6 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <p
                  className="min-w-0 flex-1 text-[14px] font-semibold tracking-[0.12em]"
                  dir="ltr"
                >
                  {formattedNumber}
                </p>
                <button
                  type="button"
                  onClick={onCopy}
                  className="shrink-0 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-medium backdrop-blur-sm transition hover:bg-white/25"
                >
                  {copied ? "کپی شد" : "کپی"}
                </button>
              </div>

              {cardHolder && (
                <p className="text-right text-xs font-medium opacity-95">
                  {cardHolder}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-end justify-between">
            <BluLogo />
            {bankName && (
              <p className="text-[10px] font-medium opacity-80">{bankName}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
