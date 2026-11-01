"use client";

import { useEffect, useState } from "react";

export interface OpenAlertsState {
  /** null sebelum respons pertama atau saat server tidak terjangkau */
  count: number | null;
  connected: boolean;
}

const POLL_MS = 15000;

export function useOpenAlerts(): OpenAlertsState {
  const [state, setState] = useState<OpenAlertsState>({ count: null, connected: false });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/alerts?status=open");
        const json = await res.json();
        if (cancelled) return;
        if (res.ok && json.success && Array.isArray(json.data)) {
          setState({ count: json.data.length, connected: true });
        } else {
          setState({ count: null, connected: false });
        }
      } catch {
        if (!cancelled) setState({ count: null, connected: false });
      }
    }

    load();
    const id = setInterval(load, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return state;
}
