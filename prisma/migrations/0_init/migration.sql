-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "node_type" AS ENUM ('probe', 'gas');

-- CreateEnum
CREATE TYPE "node_status" AS ENUM ('normal', 'watch', 'warning', 'active', 'offline');

-- CreateEnum
CREATE TYPE "alert_status" AS ENUM ('open', 'acknowledged', 'in_progress', 'resolved', 'false_alarm');

-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('admin', 'coordinator', 'responder', 'viewer');

-- CreateTable
CREATE TABLE "organizations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "is_demo" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "user_id" UUID NOT NULL,
    "org_id" UUID NOT NULL,
    "full_name" TEXT,
    "role" "user_role" NOT NULL DEFAULT 'viewer',
    "whatsapp" TEXT,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "areas" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "boundary" geography(MultiPolygon, 4326) NOT NULL,
    "stable_days_required" INTEGER NOT NULL DEFAULT 3,
    "status" TEXT NOT NULL DEFAULT 'monitoring',
    "safe_since" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "areas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gateways" (
    "id" TEXT NOT NULL,
    "org_id" UUID NOT NULL,
    "area_id" UUID,
    "api_key_hash" TEXT NOT NULL,
    "last_seen" TIMESTAMPTZ,

    CONSTRAINT "gateways_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nodes" (
    "id" TEXT NOT NULL,
    "short_id" INTEGER NOT NULL,
    "org_id" UUID NOT NULL,
    "area_id" UUID,
    "gateway_id" TEXT,
    "type" "node_type" NOT NULL,
    "location" geography(Point, 4326) NOT NULL,
    "installed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "status" "node_status" NOT NULL DEFAULT 'normal',
    "last_seen" TIMESTAMPTZ,
    "last_reading" JSONB,
    "batt_mv" INTEGER,
    "rssi" INTEGER,

    CONSTRAINT "nodes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "readings" (
    "id" BIGSERIAL NOT NULL,
    "node_id" TEXT NOT NULL,
    "seq" INTEGER NOT NULL,
    "measured_at" TIMESTAMPTZ NOT NULL,
    "received_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "t20" REAL,
    "t50" REAL,
    "t100" REAL,
    "co_ppm" REAL,
    "batt_mv" INTEGER,
    "rssi" INTEGER,
    "snr" REAL,
    "flags" SMALLINT NOT NULL DEFAULT 0,
    "is_simulated" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "predictions" (
    "id" BIGSERIAL NOT NULL,
    "node_id" TEXT NOT NULL,
    "computed_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rate_c_per_h" JSONB NOT NULL,
    "ember_depth_cm" INTEGER,
    "direction_deg" REAL,
    "speed_cm_per_h" REAL,
    "eta_surface_h" REAL,
    "confidence" TEXT NOT NULL,

    CONSTRAINT "predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "node_id" TEXT NOT NULL,
    "area_id" UUID,
    "level" TEXT NOT NULL,
    "signals" JSONB NOT NULL,
    "snapshot" JSONB NOT NULL,
    "status" "alert_status" NOT NULL DEFAULT 'open',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledged_at" TIMESTAMPTZ,
    "acknowledged_by" UUID,
    "resolved_at" TIMESTAMPTZ,
    "resolved_by" UUID,
    "resolution_note" TEXT,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" BIGSERIAL NOT NULL,
    "alert_id" UUID NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'whatsapp',
    "target" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "provider_response" JSONB,
    "sent_at" TIMESTAMPTZ,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "actions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "alert_id" UUID,
    "node_id" TEXT,
    "actor" UUID,
    "kind" TEXT NOT NULL,
    "water_liters" INTEGER,
    "depth_cm" INTEGER,
    "note" TEXT,
    "photo_url" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "thresholds" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "org_id" UUID NOT NULL,
    "area_id" UUID,
    "temp_abs_c" REAL NOT NULL DEFAULT 60,
    "temp_rate_c_per_h" REAL NOT NULL DEFAULT 3,
    "co_ppm" REAL NOT NULL DEFAULT 50,
    "neighbor_radius_m" INTEGER NOT NULL DEFAULT 50,

    CONSTRAINT "thresholds_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_cells" (
    "cell_id" TEXT NOT NULL,
    "org_id" UUID NOT NULL,
    "geom" geography(Polygon, 4326) NOT NULL,
    "score" REAL NOT NULL,
    "reasons" JSONB NOT NULL,
    "computed_on" DATE NOT NULL,

    CONSTRAINT "risk_cells_pkey" PRIMARY KEY ("cell_id")
);

-- CreateTable
CREATE TABLE "hotspots" (
    "id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "location" geography(Point, 4326) NOT NULL,
    "acquired_at" TIMESTAMPTZ NOT NULL,
    "frp" REAL,
    "confidence" TEXT,

    CONSTRAINT "hotspots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weather" (
    "area_id" UUID NOT NULL,
    "valid_at" TIMESTAMPTZ NOT NULL,
    "wind_speed_ms" REAL,
    "wind_dir_deg" REAL,
    "co_ugm3" REAL,
    "pm2_5_ugm3" REAL,

    CONSTRAINT "weather_pkey" PRIMARY KEY ("area_id","valid_at")
);

-- CreateTable
CREATE TABLE "device_commands" (
    "id" BIGSERIAL NOT NULL,
    "node_id" TEXT NOT NULL,
    "command" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "delivered_at" TIMESTAMPTZ,

    CONSTRAINT "device_commands_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "areas_slug_key" ON "areas"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "nodes_org_id_short_id_key" ON "nodes"("org_id", "short_id");

-- CreateIndex
CREATE INDEX "readings_node_id_measured_at_idx" ON "readings"("node_id", "measured_at" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "thresholds_org_id_area_id_key" ON "thresholds"("org_id", "area_id");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "areas" ADD CONSTRAINT "areas_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gateways" ADD CONSTRAINT "gateways_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gateways" ADD CONSTRAINT "gateways_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nodes" ADD CONSTRAINT "nodes_gateway_id_fkey" FOREIGN KEY ("gateway_id") REFERENCES "gateways"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readings" ADD CONSTRAINT "readings_node_id_fkey" FOREIGN KEY ("node_id") REFERENCES "nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_node_id_fkey" FOREIGN KEY ("node_id") REFERENCES "nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_node_id_fkey" FOREIGN KEY ("node_id") REFERENCES "nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_alert_id_fkey" FOREIGN KEY ("alert_id") REFERENCES "alerts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_alert_id_fkey" FOREIGN KEY ("alert_id") REFERENCES "alerts"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "actions" ADD CONSTRAINT "actions_node_id_fkey" FOREIGN KEY ("node_id") REFERENCES "nodes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thresholds" ADD CONSTRAINT "thresholds_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "thresholds" ADD CONSTRAINT "thresholds_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_cells" ADD CONSTRAINT "risk_cells_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weather" ADD CONSTRAINT "weather_area_id_fkey" FOREIGN KEY ("area_id") REFERENCES "areas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_commands" ADD CONSTRAINT "device_commands_node_id_fkey" FOREIGN KEY ("node_id") REFERENCES "nodes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

