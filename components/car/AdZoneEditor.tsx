"use client";

import { useMemo, useState } from "react";
import type { AdZoneTransform } from "@/lib/compute-ad-zones";
import { getPermanentZoneTransform, PERMANENT_AD_ZONE_TRANSFORMS } from "@/lib/ad-zone-defaults";
import {
  copyText,
  formatAllPlacementsExport,
  formatTransformExport,
  resolveZoneTransform,
  type AdZonePlacements,
} from "@/lib/ad-zone-placement";
import { AD_ZONES, type ZoneSlug } from "@/lib/zones";

type AdZoneEditorProps = {
  selectedSlug: ZoneSlug;
  onSelectSlug: (slug: ZoneSlug) => void;
  placements: AdZonePlacements;
  onPlacementChange: (slug: ZoneSlug, transform: AdZoneTransform) => void;
  onResetZone: (slug: ZoneSlug) => void;
  onResetAll: () => void;
  onClose: () => void;
};

type SliderFieldProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
};

function SliderField({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format = (v) => v.toFixed(3),
}: SliderFieldProps) {
  return (
    <label className="grid grid-cols-[4.5rem_1fr_3rem] items-center gap-2 text-xs">
      <span className="text-muted">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-1.5 w-full cursor-pointer accent-accent"
      />
      <span className="tabular-nums text-left text-[10px] text-foreground">
        {format(value)}
      </span>
    </label>
  );
}

function radToDeg(rad: number) {
  return (rad * 180) / Math.PI;
}

function degToRad(deg: number) {
  return (deg * Math.PI) / 180;
}

export function AdZoneEditor({
  selectedSlug,
  onSelectSlug,
  placements,
  onPlacementChange,
  onResetZone,
  onResetAll,
  onClose,
}: AdZoneEditorProps) {
  const currentTransform = useMemo(
    () => resolveZoneTransform(placements[selectedSlug], selectedSlug),
    [placements, selectedSlug],
  );

  const hasOverride = Boolean(placements[selectedSlug]);
  const isPermanentDefault =
    !hasOverride ||
    JSON.stringify(placements[selectedSlug]) ===
      JSON.stringify(PERMANENT_AD_ZONE_TRANSFORMS[selectedSlug]);
  const selectedLabel = AD_ZONES.find((zone) => zone.slug === selectedSlug)?.label;
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const exportSnippet = useMemo(
    () => (currentTransform ? formatTransformExport(selectedSlug, currentTransform) : ""),
    [currentTransform, selectedSlug],
  );

  const exportAllSnippet = useMemo(
    () => formatAllPlacementsExport(placements),
    [placements],
  );

  const handleCopy = async (text: string, message: string) => {
    try {
      await copyText(text);
      setCopyStatus(message);
      window.setTimeout(() => setCopyStatus(null), 2000);
    } catch {
      setCopyStatus("خطا در کپی");
      window.setTimeout(() => setCopyStatus(null), 2000);
    }
  };

  const update = (patch: Partial<AdZoneTransform>) => {
    if (!currentTransform) return;
    onPlacementChange(selectedSlug, {
      position: patch.position ?? currentTransform.position,
      rotation: patch.rotation ?? currentTransform.rotation,
      size: patch.size ?? currentTransform.size,
    });
  };

  if (!currentTransform) {
    return (
      <div className="absolute bottom-2 left-2 z-20 w-[min(100%,20rem)] rounded-xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur-sm">
        <p className="text-xs text-muted">در حال بارگذاری مدل...</p>
      </div>
    );
  }

  return (
    <div className="absolute bottom-2 left-2 z-20 max-h-[min(70dvh,32rem)] w-[min(100%,22rem)] overflow-y-auto rounded-xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold">ویرایش جایگاه تبلیغ</p>
          <p className="text-[10px] text-muted">تغییرات ذخیره می‌شوند</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-lg border border-border px-2 py-1 text-[10px] text-muted hover:bg-surface-muted"
        >
          بستن
        </button>
      </div>

      <label className="mb-3 block text-xs">
        <span className="mb-1 block text-muted">نقطه</span>
        <select
          value={selectedSlug}
          onChange={(event) => onSelectSlug(event.target.value as ZoneSlug)}
          className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm"
        >
          {AD_ZONES.map((zone) => (
            <option key={zone.slug} value={zone.slug}>
              {zone.label}
              {placements[zone.slug] ? " ✓" : ""}
            </option>
          ))}
        </select>
      </label>

      <p className="mb-2 text-[11px] font-medium text-foreground">{selectedLabel}</p>

      <div className="space-y-1.5 border-b border-border pb-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
          موقعیت
        </p>
        <SliderField
          label="X"
          value={currentTransform.position[0]}
          min={-1.5}
          max={1.5}
          step={0.001}
          onChange={(value) =>
            update({ position: [value, currentTransform.position[1], currentTransform.position[2]] })
          }
        />
        <SliderField
          label="Y"
          value={currentTransform.position[1]}
          min={-1}
          max={1.5}
          step={0.001}
          onChange={(value) =>
            update({ position: [currentTransform.position[0], value, currentTransform.position[2]] })
          }
        />
        <SliderField
          label="Z"
          value={currentTransform.position[2]}
          min={-1.5}
          max={1.5}
          step={0.001}
          onChange={(value) =>
            update({ position: [currentTransform.position[0], currentTransform.position[1], value] })
          }
        />
      </div>

      <div className="space-y-1.5 border-b border-border py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
          چرخش (درجه)
        </p>
        <SliderField
          label="X"
          value={radToDeg(currentTransform.rotation[0])}
          min={-180}
          max={180}
          step={1}
          format={(v) => `${Math.round(v)}°`}
          onChange={(value) =>
            update({
              rotation: [
                degToRad(value),
                currentTransform.rotation[1],
                currentTransform.rotation[2],
              ],
            })
          }
        />
        <SliderField
          label="Y"
          value={radToDeg(currentTransform.rotation[1])}
          min={-180}
          max={180}
          step={1}
          format={(v) => `${Math.round(v)}°`}
          onChange={(value) =>
            update({
              rotation: [
                currentTransform.rotation[0],
                degToRad(value),
                currentTransform.rotation[2],
              ],
            })
          }
        />
        <SliderField
          label="Z"
          value={radToDeg(currentTransform.rotation[2])}
          min={-180}
          max={180}
          step={1}
          format={(v) => `${Math.round(v)}°`}
          onChange={(value) =>
            update({
              rotation: [
                currentTransform.rotation[0],
                currentTransform.rotation[1],
                degToRad(value),
              ],
            })
          }
        />
      </div>

      <div className="space-y-1.5 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
          اندازه
        </p>
        <SliderField
          label="عرض"
          value={currentTransform.size[0]}
          min={0.05}
          max={1.5}
          step={0.01}
          onChange={(value) => update({ size: [value, currentTransform.size[1]] })}
        />
        <SliderField
          label="ارتفاع"
          value={currentTransform.size[1]}
          min={0.05}
          max={1.5}
          step={0.01}
          onChange={(value) => update({ size: [currentTransform.size[0], value] })}
        />
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <button
          type="button"
          onClick={() => onResetZone(selectedSlug)}
          disabled={!hasOverride}
          className="rounded-lg border border-border px-2.5 py-1.5 text-[11px] disabled:opacity-40 hover:bg-surface-muted"
        >
          بازنشانی این نقطه
        </button>
        <button
          type="button"
          onClick={onResetAll}
          className="rounded-lg border border-border px-2.5 py-1.5 text-[11px] hover:bg-surface-muted"
        >
          بازنشانی همه
        </button>
        <button
          type="button"
          onClick={() => onPlacementChange(selectedSlug, getPermanentZoneTransform(selectedSlug))}
          disabled={isPermanentDefault}
          className="rounded-lg border border-border px-2.5 py-1.5 text-[11px] disabled:opacity-40 hover:bg-surface-muted"
        >
          مقدار ثابت کد
        </button>
      </div>

      <div className="mt-3 space-y-2 border-t border-border pt-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-muted">
            خروجی برای ذخیره دائمی
          </p>
          {copyStatus && (
            <span className="text-[10px] text-accent">{copyStatus}</span>
          )}
        </div>
        <p className="text-[10px] leading-5 text-muted">
          این مقادیر را کپی کنید و بفرستید تا جایگاه‌ها در کد ثابت شوند.
        </p>
        <pre className="max-h-28 overflow-auto rounded-lg border border-border bg-background p-2 text-[10px] leading-5 text-foreground whitespace-pre-wrap break-all">
          {exportSnippet}
        </pre>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleCopy(exportSnippet, "این نقطه کپی شد")}
            className="rounded-lg border border-border px-2.5 py-1.5 text-[11px] hover:bg-surface-muted"
          >
            کپی این نقطه
          </button>
          <button
            type="button"
            onClick={() => handleCopy(exportAllSnippet, "همه نقاط کپی شد")}
            className="rounded-lg border border-border px-2.5 py-1.5 text-[11px] hover:bg-surface-muted"
          >
            کپی همه نقاط
          </button>
        </div>
        <details className="text-[10px] text-muted">
          <summary className="cursor-pointer select-none hover:text-foreground">
            پیش‌نمایش همه نقاط
          </summary>
          <pre className="mt-2 max-h-40 overflow-auto rounded-lg border border-border bg-background p-2 text-[10px] leading-5 text-foreground whitespace-pre-wrap break-all">
            {exportAllSnippet}
          </pre>
        </details>
      </div>
    </div>
  );
}
