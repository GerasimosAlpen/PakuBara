-- Aktifkan RLS di seluruh tabel
alter table organizations enable row level security;
alter table profiles enable row level security;
alter table areas enable row level security;
alter table gateways enable row level security;
alter table nodes enable row level security;
alter table readings enable row level security;
alter table predictions enable row level security;
alter table alerts enable row level security;
alter table notifications enable row level security;
alter table actions enable row level security;
alter table thresholds enable row level security;
alter table risk_cells enable row level security;
alter table hotspots enable row level security;
alter table weather enable row level security;
alter table device_commands enable row level security;

-- Kebijakan Akses Demo & Public (Anon read untuk organisasi demo)
create policy "Allow anon read demo organizations"
  on organizations for select
  using (is_demo = true);

create policy "Allow anon read demo areas"
  on areas for select
  using (exists (select 1 from organizations where organizations.id = areas.org_id and organizations.is_demo = true));

create policy "Allow anon read demo nodes"
  on nodes for select
  using (exists (select 1 from organizations where organizations.id = nodes.org_id and organizations.is_demo = true));

create policy "Allow anon read demo readings"
  on readings for select
  using (exists (select 1 from nodes join organizations on nodes.org_id = organizations.id where nodes.id = readings.node_id and organizations.is_demo = true));

create policy "Allow anon read demo predictions"
  on predictions for select
  using (exists (select 1 from nodes join organizations on nodes.org_id = organizations.id where nodes.id = predictions.node_id and organizations.is_demo = true));

create policy "Allow anon read demo alerts"
  on alerts for select
  using (exists (select 1 from organizations where organizations.id = alerts.org_id and organizations.is_demo = true));

create policy "Allow anon read demo actions"
  on actions for select
  using (exists (select 1 from organizations where organizations.id = actions.org_id and organizations.is_demo = true));

create policy "Allow anon read demo risk cells"
  on risk_cells for select
  using (exists (select 1 from organizations where organizations.id = risk_cells.org_id and organizations.is_demo = true));

create policy "Allow anon read hotspots"
  on hotspots for select
  using (true);

create policy "Allow anon read weather"
  on weather for select
  using (true);

-- Tambahkan tabel ke publikasi Supabase Realtime
alter publication supabase_realtime add table nodes;
alter publication supabase_realtime add table readings;
alter publication supabase_realtime add table predictions;
alter publication supabase_realtime add table alerts;
alter publication supabase_realtime add table actions;
alter publication supabase_realtime add table hotspots;

