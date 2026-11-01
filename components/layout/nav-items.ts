import { Map, Flame, BarChart3, Radio, FileText, Settings, Compass, Layers } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/app", label: "Peta Komando", icon: Map },
  { href: "/app/alerts", label: "Pusat Alert", icon: Flame, showsAlertCount: true },
  { href: "/app/risk", label: "Prioritas Siaga 1km²", icon: Compass },
  { href: "/app/areas/a0000000-0000-0000-0000-000000000001", label: "Detail Area", icon: Layers },
  { href: "/app/analytics", label: "Analitik Karhutla", icon: BarChart3 },
  { href: "/app/devices", label: "Perangkat & Gateway", icon: Radio },
  { href: "/app/reports", label: "Laporan Audit", icon: FileText },
  { href: "/app/settings", label: "Pengaturan Sistem", icon: Settings },
] as const;
