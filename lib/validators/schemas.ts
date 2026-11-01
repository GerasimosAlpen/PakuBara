import { z } from "zod";

export const readingItemSchema = z.object({
  node: z.number().int().min(1).max(65535),
  seq: z.number().int().min(0),
  measured_at: z.string().datetime(),
  t20: z.number().min(-10).max(150).nullable().optional(),
  t50: z.number().min(-10).max(150).nullable().optional(),
  t100: z.number().min(-10).max(150).nullable().optional(),
  co: z.number().min(0).nullable().optional(),
  batt_mv: z.number().int().min(0).max(6000).nullable().optional(),
  flags: z.number().int().default(0),
  rssi: z.number().int().nullable().optional(),
  snr: z.number().nullable().optional(),
});

export const ingestBatchSchema = z.object({
  gateway_id: z.string().min(1),
  sent_at: z.string().datetime().optional(),
  readings: z.array(readingItemSchema).min(1).max(500),
});

export const createNodeSchema = z.object({
  id: z.string().min(2).max(20),
  short_id: z.number().int().min(1).max(65535),
  org_id: z.string().uuid(),
  area_id: z.string().uuid().optional().nullable(),
  gateway_id: z.string().optional().nullable(),
  type: z.enum(["probe", "gas"]),
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
});

export const updateNodeSchema = z.object({
  area_id: z.string().uuid().optional().nullable(),
  active: z.boolean().optional(),
  lat: z.number().min(-90).max(90).optional(),
  lon: z.number().min(-180).max(180).optional(),
});

export const createAreaSchema = z.object({
  org_id: z.string().uuid().optional(),
  name: z.string().min(3),
  slug: z.string().optional(),
  boundary_geojson: z.record(z.string(), z.unknown()).optional(),
  coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))).optional(),
  phone_recipients: z.array(z.string()).optional(),
  stable_days_required: z.number().int().default(3),
});

export const registerGatewaySchema = z.object({
  area_id: z.string().min(1),
  name: z.string().min(2),
  mac_address: z.string().min(5),
  firmware_version: z.string().optional(),
});

export const acknowledgeAlertSchema = z.object({
  actor_id: z.string().uuid().optional(),
});

export const resolveAlertSchema = z.object({
  actor_id: z.string().uuid().optional(),
  status: z.enum(["resolved", "false_alarm"]),
  resolution_note: z.string().min(3),
  target_phone: z.string().optional(),
});

export const createActionSchema = z.object({
  org_id: z.string().uuid(),
  alert_id: z.string().uuid().optional().nullable(),
  node_id: z.string().optional().nullable(),
  actor: z.string().uuid().optional().nullable(),
  kind: z.enum(["injection", "inspection", "relocate", "other"]),
  water_liters: z.number().int().min(0).optional().nullable(),
  depth_cm: z.number().int().min(0).max(200).optional().nullable(),
  note: z.string().optional().nullable(),
  photo_url: z.string().url().optional().nullable(),
});

export const updateThresholdSchema = z.object({
  org_id: z.string().uuid(),
  area_id: z.string().uuid().optional().nullable(),
  temp_abs_c: z.number().min(30).max(120).optional(),
  temp_rate_c_per_h: z.number().min(0.5).max(30).optional(),
  co_ppm: z.number().min(10).max(500).optional(),
  neighbor_radius_m: z.number().int().min(10).max(500).optional(),
});

export const demoScenarioSchema = z.object({
  scenario: z.enum([
    "spread_northeast",
    "false_alarm_co_only",
    "battery_dead",
    "area_recovery",
  ]),
  speed: z.union([z.literal(1), z.literal(10), z.literal(60)]).default(1),
  target_phone: z.string().optional(),
});
