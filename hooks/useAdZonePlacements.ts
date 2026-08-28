"use client";

import { useCallback, useEffect, useState } from "react";
import type { AdZoneTransform } from "@/lib/compute-ad-zones";
import {
  clearAdZonePlacements,
  loadAdZonePlacements,
  saveAdZonePlacements,
  type AdZonePlacements,
} from "@/lib/ad-zone-placement";
import type { ZoneSlug } from "@/lib/zones";

export function useAdZonePlacements() {
  const [placements, setPlacements] = useState<AdZonePlacements>({});

  useEffect(() => {
    setPlacements(loadAdZonePlacements());
  }, []);

  const setPlacement = useCallback((slug: ZoneSlug, transform: AdZoneTransform) => {
    setPlacements((prev) => {
      const next = { ...prev, [slug]: transform };
      saveAdZonePlacements(next);
      return next;
    });
  }, []);

  const resetZone = useCallback((slug: ZoneSlug) => {
    setPlacements((prev) => {
      const next = { ...prev };
      delete next[slug];
      saveAdZonePlacements(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    clearAdZonePlacements();
    setPlacements({});
  }, []);

  return { placements, setPlacement, resetZone, resetAll };
}
