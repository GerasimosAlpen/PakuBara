-- Seed Data PakuBara Demo

-- 1. Organization Demo
insert into organizations (id, name, is_demo)
values ('d0000000-0000-0000-0000-000000000001', 'Posko KHG Pulau Padang - BPBD Riau', true)
on conflict (id) do nothing;

-- 2. Area Demo (Riau & Kalimantan KHG)
insert into areas (id, org_id, name, slug, boundary, stable_days_required, status)
values
  (
    'a0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'Blok B Pulau Padang (Sektor B-04)',
    'blok-b-pulau-padang',
    ST_Multi(ST_GeomFromText('POLYGON((102.665 -1.225, 102.695 -1.225, 102.695 -1.245, 102.665 -1.245, 102.665 -1.225))', 4326)),
    3,
    'monitoring'
  ),
  (
    'a0000000-0000-0000-0000-000000000003',
    'd0000000-0000-0000-0000-000000000001',
    'KHG Kahayan - Sebangau (Sektor Pulang Pisau)',
    'khg-kahayan-sebangau',
    ST_Multi(ST_GeomFromText('POLYGON((113.880 -2.260, 113.980 -2.260, 113.980 -2.360, 113.880 -2.360, 113.880 -2.260))', 4326)),
    3,
    'monitoring'
  )
on conflict (id) do nothing;

-- 3. Gateway Posko
insert into gateways (id, org_id, area_id, api_key_hash)
values
  (
    'GW-01',
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000001',
    'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f'
  ),
  (
    'GW-K01',
    'd0000000-0000-0000-0000-000000000001',
    'a0000000-0000-0000-0000-000000000003',
    '7c86a3456bde1289fe45c90812ab56ef890123456789abcdef0123456789abcd'
  )
on conflict (id) do nothing;

-- 4. Paku Suhu (Lapis 2) & Tiang Gas (Lapis 1)
insert into nodes (id, short_id, org_id, area_id, gateway_id, type, location, batt_mv, rssi, status, last_reading)
values
  ('PK-01', 1, 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'GW-01', 'probe', ST_SetSRID(ST_MakePoint(102.6710, -1.2310), 4326), 3920, -78, 'normal', '{"t20":29.2,"t50":30.5,"t100":30.0}'),
  ('PK-02', 2, 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'GW-01', 'probe', ST_SetSRID(ST_MakePoint(102.6735, -1.2325), 4326), 3900, -80, 'normal', '{"t20":30.0,"t50":31.2,"t100":30.8}'),
  ('PK-03', 3, 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'GW-01', 'probe', ST_SetSRID(ST_MakePoint(102.6760, -1.2330), 4326), 3890, -82, 'normal', '{"t20":29.8,"t50":31.0,"t100":30.5}'),
  ('PK-04', 4, 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'GW-01', 'probe', ST_SetSRID(ST_MakePoint(102.6789, -1.2345), 4326), 3860, -84, 'active', '{"t20":36.4,"t50":87.3,"t100":42.0}'),
  ('PK-05', 5, 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'GW-01', 'probe', ST_SetSRID(ST_MakePoint(102.6820, -1.2335), 4326), 3900, -82, 'watch', '{"t20":32.1,"t50":48.6,"t100":34.0}'),
  ('PK-06', 6, 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'GW-01', 'probe', ST_SetSRID(ST_MakePoint(102.6845, -1.2360), 4326), 3880, -85, 'normal', '{"t20":29.5,"t50":30.8,"t100":30.2}'),
  ('PK-07', 7, 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'GW-01', 'probe', ST_SetSRID(ST_MakePoint(102.6750, -1.2370), 4326), 3200, -96, 'offline', '{"t20":28.0,"t50":29.1,"t100":29.0}'),
  ('PK-08', 8, 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'GW-01', 'probe', ST_SetSRID(ST_MakePoint(102.6870, -1.2385), 4326), 3910, -83, 'normal', '{"t20":29.0,"t50":30.2,"t100":29.8}'),
  ('GS-01', 101, 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'GW-01', 'gas', ST_SetSRID(ST_MakePoint(102.6780, -1.2340), 4326), 3840, -85, 'active', '{"co":185.0}'),
  ('GS-02', 102, 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'GW-01', 'gas', ST_SetSRID(ST_MakePoint(102.6830, -1.2370), 4326), 3890, -81, 'normal', '{"co":24.0}'),
  ('PK-K01', 11, 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'GW-K01', 'probe', ST_SetSRID(ST_MakePoint(113.9180, -2.2920), 4326), 3920, -79, 'normal', '{"t20":29.4,"t50":31.0,"t100":30.2}'),
  ('PK-K02', 12, 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'GW-K01', 'probe', ST_SetSRID(ST_MakePoint(113.9240, -2.2980), 4326), 3890, -81, 'watch', '{"t20":33.2,"t50":52.1,"t100":36.4}'),
  ('PK-K03', 13, 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'GW-K01', 'probe', ST_SetSRID(ST_MakePoint(113.9315, -2.3045), 4326), 3850, -83, 'active', '{"t20":38.2,"t50":89.6,"t100":43.1}'),
  ('PK-K04', 14, 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'GW-K01', 'probe', ST_SetSRID(ST_MakePoint(113.9380, -2.3110), 4326), 3930, -80, 'normal', '{"t20":29.8,"t50":31.5,"t100":30.6}'),
  ('PK-K05', 15, 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'GW-K01', 'probe', ST_SetSRID(ST_MakePoint(113.9450, -2.3175), 4326), 3900, -82, 'normal', '{"t20":29.5,"t50":30.9,"t100":30.0}'),
  ('PK-K06', 16, 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'GW-K01', 'probe', ST_SetSRID(ST_MakePoint(113.9390, -2.3010), 4326), 3880, -84, 'normal', '{"t20":29.2,"t50":30.8,"t100":30.1}'),
  ('PK-K07', 17, 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'GW-K01', 'probe', ST_SetSRID(ST_MakePoint(113.9260, -2.3140), 4326), 3910, -81, 'normal', '{"t20":29.6,"t50":31.1,"t100":30.4}'),
  ('PK-K08', 18, 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'GW-K01', 'probe', ST_SetSRID(ST_MakePoint(113.9340, -2.3210), 4326), 3150, -95, 'offline', '{"t20":28.2,"t50":29.5,"t100":29.2}'),
  ('GS-K01', 111, 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'GW-K01', 'gas', ST_SetSRID(ST_MakePoint(113.9305, -2.3038), 4326), 3840, -84, 'active', '{"co":195.0}'),
  ('GS-K02', 112, 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 'GW-K01', 'gas', ST_SetSRID(ST_MakePoint(113.9420, -2.3130), 4326), 3890, -82, 'normal', '{"co":22.0}')
on conflict (id) do nothing;

-- 5. Default Threshold
insert into thresholds (id, org_id, area_id, temp_abs_c, temp_rate_c_per_h, co_ppm, neighbor_radius_m)
values
  ('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 60.0, 3.0, 50.0, 50),
  ('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000003', 60.0, 3.0, 50.0, 50)
on conflict (id) do nothing;

-- 6. Sample Predictions
insert into predictions (node_id, computed_at, rate_c_per_h, ember_depth_cm, direction_deg, speed_cm_per_h, eta_surface_h, confidence)
values
  ('PK-04', now(), '{"t20":2.1,"t50":6.0,"t100":0.3}', 50, 45.0, 4.2, 11.9, 'high'),
  ('PK-K03', now(), '{"t20":2.4,"t50":6.8,"t100":0.4}', 50, 135.0, 4.5, 9.2, 'high');

-- 7. Sample Open Alerts
insert into alerts (id, org_id, node_id, area_id, level, signals, snapshot, status, created_at)
values
  ('b1c7e6e2-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'PK-04', 'a0000000-0000-0000-0000-000000000001', 'active', '{"temp_trend":true,"neighbor":true,"co":true}', '{"t50":87.3,"co_ppm":185,"rate":6.0,"eta":11.9,"direction":"Timur Laut"}', 'open', now()),
  ('b1c7e6e2-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 'PK-K03', 'a0000000-0000-0000-0000-000000000003', 'active', '{"temp_trend":true,"neighbor":true,"co":true}', '{"t50":89.6,"co_ppm":195,"rate":6.8,"eta":9.2,"direction":"Tenggara"}', 'open', now())
on conflict (id) do nothing;

-- 8. Sample Risk Cells (Prioritas Siaga Grid 1 km2)
insert into risk_cells (cell_id, org_id, geom, score, reasons, computed_on)
values
  ('PADANG-R01C01', 'd0000000-0000-0000-0000-000000000001', ST_GeomFromText('POLYGON((102.660 -1.220, 102.670 -1.220, 102.670 -1.230, 102.660 -1.230, 102.660 -1.220))', 4326), 84.5, '[{"factor":"Kepadatan kanal gambut","share":0.38},{"factor":"Riwayat kebakaran 5 tahun","share":0.27},{"factor":"Akses jalan dan kanal","share":0.18}]', current_date),
  ('PADANG-R01C02', 'd0000000-0000-0000-0000-000000000001', ST_GeomFromText('POLYGON((102.670 -1.220, 102.680 -1.220, 102.680 -1.230, 102.670 -1.230, 102.670 -1.220))', 4326), 91.2, '[{"factor":"Kepadatan kanal gambut","share":0.40},{"factor":"Lahan baru dibuka","share":0.30},{"factor":"Kekeringan 30 hari","share":0.15}]', current_date),
  ('PADANG-R02C01', 'd0000000-0000-0000-0000-000000000001', ST_GeomFromText('POLYGON((102.660 -1.230, 102.670 -1.230, 102.670 -1.240, 102.660 -1.240, 102.660 -1.230))', 4326), 62.0, '[{"factor":"Akses jalan dan kanal","share":0.35},{"factor":"Riwayat kebakaran 5 tahun","share":0.25},{"factor":"Kepadatan kanal","share":0.20}]', current_date),
  ('PADANG-R02C02', 'd0000000-0000-0000-0000-000000000001', ST_GeomFromText('POLYGON((102.670 -1.230, 102.680 -1.230, 102.680 -1.240, 102.670 -1.240, 102.670 -1.230))', 4326), 45.8, '[{"factor":"Kekeringan 30 hari","share":0.30},{"factor":"Kepadatan kanal","share":0.25},{"factor":"Akses jalan","share":0.20}]', current_date),
  ('SEBANGAU-R01C01', 'd0000000-0000-0000-0000-000000000001', ST_GeomFromText('POLYGON((113.910 -2.290, 113.920 -2.290, 113.920 -2.300, 113.910 -2.300, 113.910 -2.290))', 4326), 94.2, '[{"factor":"Kepadatan kubah gambut dalam","share":0.45},{"factor":"Riwayat karhutla Sebangau","share":0.30},{"factor":"Kanal drainase terbuka","share":0.15}]', current_date),
  ('SEBANGAU-R01C02', 'd0000000-0000-0000-0000-000000000001', ST_GeomFromText('POLYGON((113.920 -2.290, 113.930 -2.290, 113.930 -2.300, 113.920 -2.300, 113.920 -2.290))', 4326), 88.5, '[{"factor":"Kepadatan kubah gambut dalam","share":0.40},{"factor":"Defisit air tanah","share":0.35},{"factor":"Kanal liar","share":0.15}]', current_date),
  ('SEBANGAU-R02C01', 'd0000000-0000-0000-0000-000000000001', ST_GeomFromText('POLYGON((113.910 -2.300, 113.920 -2.300, 113.920 -2.310, 113.910 -2.310, 113.910 -2.300))', 4326), 76.0, '[{"factor":"Defisit air tanah","share":0.40},{"factor":"Jarak posko respon","share":0.30},{"factor":"Vegetasi pakis kering","share":0.20}]', current_date)
on conflict (cell_id) do nothing;
