-- Ekstensi PostgreSQL & PostGIS
create extension if not exists postgis;

-- Enum Types
create type node_type as enum ('probe', 'gas');
create type node_status as enum ('normal', 'watch', 'warning', 'active', 'offline');
create type alert_status as enum ('open', 'acknowledged', 'in_progress', 'resolved', 'false_alarm');
create type user_role as enum ('admin', 'coordinator', 'responder', 'viewer');

-- 1. Organizations
create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  is_demo boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2. Profiles (User RBAC)
create table if not exists profiles (
  user_id uuid primary key references auth.users on delete cascade,
  org_id uuid not null references organizations on delete cascade,
  full_name text,
  role user_role not null default 'viewer',
  whatsapp text
);

-- 3. Areas (Monitoring Sectors)
create table if not exists areas (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations on delete cascade,
  name text not null,
  slug text unique,
  boundary geography(MultiPolygon, 4326) not null,
  stable_days_required int not null default 3,
  status text not null default 'monitoring',
  safe_since timestamptz,
  created_at timestamptz not null default now()
);

-- 4. Gateways
create table if not exists gateways (
  id text primary key,
  org_id uuid not null references organizations on delete cascade,
  area_id uuid references areas on delete set null,
  api_key_hash text not null,
  last_seen timestamptz
);

-- 5. Nodes (Paku Suhu & Tiang Gas)
create table if not exists nodes (
  id text primary key,
  short_id int not null,
  org_id uuid not null references organizations on delete cascade,
  area_id uuid references areas on delete set null,
  gateway_id text references gateways on delete set null,
  type node_type not null,
  location geography(Point, 4326) not null,
  installed_at timestamptz not null default now(),
  active boolean not null default true,
  status node_status not null default 'normal',
  last_seen timestamptz,
  last_reading jsonb,
  batt_mv int,
  rssi int,
  unique (org_id, short_id)
);

-- 6. Readings (Time-Series Telemetry)
create table if not exists readings (
  id bigint generated always as identity primary key,
  node_id text not null references nodes on delete cascade,
  seq int not null,
  measured_at timestamptz not null,
  received_at timestamptz not null default now(),
  t20 real,
  t50 real,
  t100 real,
  co_ppm real,
  batt_mv int,
  rssi int,
  snr real,
  flags smallint not null default 0,
  is_simulated boolean not null default false
);
create index if not exists idx_readings_node_waktu on readings (node_id, measured_at desc);

-- 7. Predictions (AI Physics Model)
create table if not exists predictions (
  id bigint generated always as identity primary key,
  node_id text not null references nodes on delete cascade,
  computed_at timestamptz not null default now(),
  rate_c_per_h jsonb not null,
  ember_depth_cm int,
  direction_deg real,
  speed_cm_per_h real,
  eta_surface_h real,
  confidence text not null
);

-- 8. Alerts
create table if not exists alerts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations on delete cascade,
  node_id text not null references nodes on delete cascade,
  area_id uuid references areas on delete set null,
  level text not null,
  signals jsonb not null,
  snapshot jsonb not null,
  status alert_status not null default 'open',
  created_at timestamptz not null default now(),
  acknowledged_at timestamptz,
  acknowledged_by uuid,
  resolved_at timestamptz,
  resolved_by uuid,
  resolution_note text
);
create unique index if not exists one_open_alert_per_node on alerts (node_id)
  where status in ('open', 'acknowledged', 'in_progress');

-- 9. Notifications (WhatsApp Dispatch Log)
create table if not exists notifications (
  id bigint generated always as identity primary key,
  alert_id uuid not null references alerts on delete cascade,
  channel text not null default 'whatsapp',
  target text not null,
  status text not null,
  provider_response jsonb,
  sent_at timestamptz
);

-- 10. Actions (Activity Log Penanganan)
create table if not exists actions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations on delete cascade,
  alert_id uuid references alerts on delete set null,
  node_id text references nodes on delete set null,
  actor uuid,
  kind text not null,
  water_liters int,
  depth_cm int,
  note text,
  photo_url text,
  created_at timestamptz not null default now()
);

-- 11. Thresholds
create table if not exists thresholds (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations on delete cascade,
  area_id uuid references areas on delete cascade,
  temp_abs_c real not null default 60,
  temp_rate_c_per_h real not null default 3,
  co_ppm real not null default 50,
  neighbor_radius_m int not null default 50,
  unique (org_id, area_id)
);

-- 12. Risk Cells (Peta Prioritas Siaga 1 km2)
create table if not exists risk_cells (
  cell_id text primary key,
  org_id uuid not null references organizations on delete cascade,
  geom geography(Polygon, 4326) not null,
  score real not null,
  reasons jsonb not null,
  computed_on date not null
);

-- 13. Hotspots (NASA FIRMS Cache)
create table if not exists hotspots (
  id text primary key,
  source text not null,
  location geography(Point, 4326) not null,
  acquired_at timestamptz not null,
  frp real,
  confidence text
);

-- 14. Weather (Open-Meteo Cache)
create table if not exists weather (
  area_id uuid references areas on delete cascade,
  valid_at timestamptz not null,
  wind_speed_ms real,
  wind_dir_deg real,
  co_ugm3 real,
  pm2_5_ugm3 real,
  primary key (area_id, valid_at)
);

-- 15. Device Commands
create table if not exists device_commands (
  id bigint generated always as identity primary key,
  node_id text not null references nodes on delete cascade,
  command jsonb not null,
  created_at timestamptz not null default now(),
  delivered_at timestamptz
);

