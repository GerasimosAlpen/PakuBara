export interface MockNode {
  id: string;
  short_id: number;
  org_id: string;
  area_id: string;
  type: "probe" | "gas";
  lat: number;
  lon: number;
  status: "normal" | "watch" | "warning" | "active" | "offline";
  batt_mv: number;
  rssi: number;
  last_seen: string;
  last_reading: {
    t20?: number;
    t50?: number;
    t100?: number;
    co?: number;
  };
}

export interface MockReading {
  id: number;
  node_id: string;
  seq: number;
  measured_at: string;
  t20?: number | null;
  t50?: number | null;
  t100?: number | null;
  co_ppm?: number | null;
  batt_mv?: number | null;
  rssi?: number | null;
  snr?: number | null;
}

export interface MockAlert {
  id: string;
  org_id: string;
  node_id: string;
  area_id: string;
  level: "warning" | "active";
  signals: {
    temp_trend: boolean;
    neighbor: boolean;
    co: boolean;
  };
  snapshot: Record<string, unknown>;
  status: "open" | "acknowledged" | "in_progress" | "resolved" | "false_alarm";
  created_at: string;
  acknowledged_at?: string | null;
  resolved_at?: string | null;
  resolution_note?: string | null;
}

export interface MockAction {
  id: string;
  org_id: string;
  alert_id?: string | null;
  node_id?: string | null;
  kind: "injection" | "inspection" | "relocate" | "other";
  water_liters?: number | null;
  depth_cm?: number | null;
  note?: string | null;
  photo_url?: string | null;
  created_at: string;
}

export interface MockArea {
  id: string;
  org_id: string;
  name: string;
  slug: string;
  boundary_geojson: Record<string, unknown>;
  risk_level: "low" | "medium" | "high" | "extreme";
  safe_days_streak: number;
  phone_recipients: string[];
  is_active: boolean;
}

export interface MockGateway {
  id: string;
  org_id: string;
  area_id: string;
  name: string;
  mac_address: string;
  status: "online" | "offline";
  firmware_version: string;
  last_ping: string;
  api_key_hash: string;
}

const DEFAULT_AREAS: MockArea[] = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    org_id: "d0000000-0000-0000-0000-000000000001",
    name: "Blok B Hutan Gambut Lindung",
    slug: "blok-b-pulau-padang",
    boundary_geojson: {
      type: "Polygon",
      coordinates: [
        [
          [102.668, -1.229],
          [102.689, -1.229],
          [102.689, -1.242],
          [102.668, -1.242],
          [102.668, -1.229],
        ],
      ],
    },
    risk_level: "high",
    safe_days_streak: 1,
    phone_recipients: ["6281234567890"],
    is_active: true,
  },
  {
    id: "a0000000-0000-0000-0000-000000000002",
    org_id: "d0000000-0000-0000-0000-000000000001",
    name: "Blok A Zona Penyangga Perkebunan",
    slug: "blok-a-zona-penyangga",
    boundary_geojson: {
      type: "Polygon",
      coordinates: [
        [
          [102.65, -1.215],
          [102.667, -1.215],
          [102.667, -1.228],
          [102.65, -1.228],
          [102.65, -1.215],
        ],
      ],
    },
    risk_level: "low",
    safe_days_streak: 5,
    phone_recipients: ["6281234567890"],
    is_active: true,
  },
];

const DEFAULT_GATEWAYS: MockGateway[] = [
  {
    id: "gw-0000-0001",
    org_id: "d0000000-0000-0000-0000-000000000001",
    area_id: "a0000000-0000-0000-0000-000000000001",
    name: "Posko Utama Pulau Padang",
    mac_address: "A4:CF:12:88:9B:01",
    status: "online",
    firmware_version: "v1.2.0-esp32",
    last_ping: new Date().toISOString(),
    api_key_hash: "hash_pkb_gw_demo_01",
  },
];

const DEFAULT_NODES: MockNode[] = [
  {
    id: "PK-01",
    short_id: 1,
    org_id: "d0000000-0000-0000-0000-000000000001",
    area_id: "a0000000-0000-0000-0000-000000000001",
    type: "probe",
    lat: -1.231,
    lon: 102.671,
    status: "normal",
    batt_mv: 3920,
    rssi: -78,
    last_seen: new Date().toISOString(),
    last_reading: { t20: 29.2, t50: 30.5, t100: 30.0 },
  },
  {
    id: "PK-02",
    short_id: 2,
    org_id: "d0000000-0000-0000-0000-000000000001",
    area_id: "a0000000-0000-0000-0000-000000000001",
    type: "probe",
    lat: -1.2325,
    lon: 102.6735,
    status: "normal",
    batt_mv: 3900,
    rssi: -80,
    last_seen: new Date().toISOString(),
    last_reading: { t20: 30.0, t50: 31.2, t100: 30.8 },
  },
  {
    id: "PK-03",
    short_id: 3,
    org_id: "d0000000-0000-0000-0000-000000000001",
    area_id: "a0000000-0000-0000-0000-000000000001",
    type: "probe",
    lat: -1.233,
    lon: 102.676,
    status: "normal",
    batt_mv: 3890,
    rssi: -82,
    last_seen: new Date().toISOString(),
    last_reading: { t20: 29.8, t50: 31.0, t100: 30.5 },
  },
  {
    id: "PK-04",
    short_id: 4,
    org_id: "d0000000-0000-0000-0000-000000000001",
    area_id: "a0000000-0000-0000-0000-000000000001",
    type: "probe",
    lat: -1.2345,
    lon: 102.6789,
    status: "active",
    batt_mv: 3860,
    rssi: -84,
    last_seen: new Date().toISOString(),
    last_reading: { t20: 36.4, t50: 87.3, t100: 42.0 },
  },
  {
    id: "PK-05",
    short_id: 5,
    org_id: "d0000000-0000-0000-0000-000000000001",
    area_id: "a0000000-0000-0000-0000-000000000001",
    type: "probe",
    lat: -1.2335,
    lon: 102.682,
    status: "watch",
    batt_mv: 3900,
    rssi: -82,
    last_seen: new Date().toISOString(),
    last_reading: { t20: 32.1, t50: 48.6, t100: 34.0 },
  },
  {
    id: "PK-06",
    short_id: 6,
    org_id: "d0000000-0000-0000-0000-000000000001",
    area_id: "a0000000-0000-0000-0000-000000000001",
    type: "probe",
    lat: -1.236,
    lon: 102.6845,
    status: "normal",
    batt_mv: 3880,
    rssi: -85,
    last_seen: new Date().toISOString(),
    last_reading: { t20: 29.5, t50: 30.8, t100: 30.2 },
  },
  {
    id: "PK-07",
    short_id: 7,
    org_id: "d0000000-0000-0000-0000-000000000001",
    area_id: "a0000000-0000-0000-0000-000000000001",
    type: "probe",
    lat: -1.237,
    lon: 102.675,
    status: "offline",
    batt_mv: 3100,
    rssi: -96,
    last_seen: new Date(Date.now() - 3600000).toISOString(),
    last_reading: { t20: 28.0, t50: 29.1, t100: 29.0 },
  },
  {
    id: "PK-08",
    short_id: 8,
    org_id: "d0000000-0000-0000-0000-000000000001",
    area_id: "a0000000-0000-0000-0000-000000000001",
    type: "probe",
    lat: -1.2385,
    lon: 102.687,
    status: "normal",
    batt_mv: 3910,
    rssi: -83,
    last_seen: new Date().toISOString(),
    last_reading: { t20: 29.0, t50: 30.2, t100: 29.8 },
  },
  {
    id: "GS-01",
    short_id: 101,
    org_id: "d0000000-0000-0000-0000-000000000001",
    area_id: "a0000000-0000-0000-0000-000000000001",
    type: "gas",
    lat: -1.234,
    lon: 102.678,
    status: "active",
    batt_mv: 3840,
    rssi: -85,
    last_seen: new Date().toISOString(),
    last_reading: { co: 185.0 },
  },
  {
    id: "GS-02",
    short_id: 102,
    org_id: "d0000000-0000-0000-0000-000000000001",
    area_id: "a0000000-0000-0000-0000-000000000001",
    type: "gas",
    lat: -1.237,
    lon: 102.683,
    status: "normal",
    batt_mv: 3890,
    rssi: -81,
    last_seen: new Date().toISOString(),
    last_reading: { co: 24.0 },
  },
];

const DEFAULT_ALERTS: MockAlert[] = [
  {
    id: "b1c7e6e2-0000-0000-0000-000000000001",
    org_id: "d0000000-0000-0000-0000-000000000001",
    node_id: "PK-04",
    area_id: "a0000000-0000-0000-0000-000000000001",
    level: "active",
    signals: { temp_trend: true, neighbor: true, co: true },
    snapshot: {
      t50: 87.3,
      co_ppm: 185,
      rate: 6.0,
      eta: 11.9,
      direction: "Timur Laut (45°)",
      ember_depth_cm: 50,
    },
    status: "open",
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
];

const DEFAULT_ACTIONS: MockAction[] = [
  {
    id: "ac000000-0000-0000-0000-000000000001",
    org_id: "d0000000-0000-0000-0000-000000000001",
    alert_id: "b1c7e6e2-0000-0000-0000-000000000001",
    node_id: "PK-04",
    kind: "inspection",
    water_liters: 0,
    depth_cm: 50,
    note: "Regu Manggala Agni tiba di lokasi PK-04, mempersiapkan selang suntik air gambut.",
    created_at: new Date(Date.now() - 900000).toISOString(),
  },
];

function generateDefaultReadings(): MockReading[] {
  const readings: MockReading[] = [];
  const now = Date.now();
  for (let i = 24; i >= 0; i--) {
    const t = new Date(now - i * 3600000).toISOString();
    const progress = (24 - i) / 24;

    readings.push({
      id: 1000 + i,
      node_id: "PK-04",
      seq: 500 + i,
      measured_at: t,
      t20: parseFloat((30.0 + progress * 6.4).toFixed(1)),
      t50: parseFloat((32.0 + Math.pow(progress, 2) * 55.3).toFixed(1)),
      t100: parseFloat((31.0 + progress * 11.0).toFixed(1)),
      batt_mv: 3860,
      rssi: -84,
    });

    readings.push({
      id: 2000 + i,
      node_id: "GS-01",
      seq: 500 + i,
      measured_at: t,
      co_ppm: parseFloat((20.0 + Math.pow(progress, 2) * 165).toFixed(1)),
      batt_mv: 3840,
      rssi: -85,
    });

    // Baselines for other nodes
    for (const nid of ["PK-01", "PK-02", "PK-03", "PK-05", "PK-06", "PK-08"]) {
      readings.push({
        id: 3000 + i * 10 + parseInt(nid.replace("PK-0", ""), 10),
        node_id: nid,
        seq: 500 + i,
        measured_at: t,
        t20: 29.5 + Math.sin(i) * 0.5,
        t50: 30.5 + Math.cos(i) * 0.4,
        t100: 30.0 + Math.sin(i) * 0.2,
        batt_mv: 3900,
        rssi: -80,
      });
    }
  }
  return readings;
}

class MockDataStore {
  private static instance: MockDataStore;

  public areas: MockArea[] = JSON.parse(JSON.stringify(DEFAULT_AREAS));
  public gateways: MockGateway[] = JSON.parse(JSON.stringify(DEFAULT_GATEWAYS));
  public nodes: MockNode[] = JSON.parse(JSON.stringify(DEFAULT_NODES));
  public alerts: MockAlert[] = JSON.parse(JSON.stringify(DEFAULT_ALERTS));
  public actions: MockAction[] = JSON.parse(JSON.stringify(DEFAULT_ACTIONS));
  public readings: MockReading[] = generateDefaultReadings();

  public reset() {
    this.areas = JSON.parse(JSON.stringify(DEFAULT_AREAS));
    this.gateways = JSON.parse(JSON.stringify(DEFAULT_GATEWAYS));
    this.nodes = JSON.parse(JSON.stringify(DEFAULT_NODES));
    this.alerts = JSON.parse(JSON.stringify(DEFAULT_ALERTS));
    this.actions = JSON.parse(JSON.stringify(DEFAULT_ACTIONS));
    this.readings = generateDefaultReadings();
  }

  public heatNode(nodeId: string, targetTemp = 95.0, coPpm = 210.0) {
    const node = this.nodes.find((n) => n.id === nodeId);
    if (!node) return null;

    node.status = "active";
    node.last_seen = new Date().toISOString();
    node.last_reading = {
      t20: 42.0,
      t50: targetTemp,
      t100: 55.0,
    };

    const newReading: MockReading = {
      id: Date.now(),
      node_id: nodeId,
      seq: this.readings.length + 1,
      measured_at: new Date().toISOString(),
      t20: 42.0,
      t50: targetTemp,
      t100: 55.0,
      batt_mv: node.batt_mv,
      rssi: node.rssi,
    };
    this.readings.push(newReading);

    // Also update or link gas post GS-01
    const gasNode = this.nodes.find((n) => n.id === "GS-01");
    if (gasNode) {
      gasNode.status = "active";
      gasNode.last_seen = new Date().toISOString();
      gasNode.last_reading = { co: coPpm };
      this.readings.push({
        id: Date.now() + 1,
        node_id: "GS-01",
        seq: this.readings.length + 1,
        measured_at: new Date().toISOString(),
        co_ppm: coPpm,
        batt_mv: gasNode.batt_mv,
        rssi: gasNode.rssi,
      });
    }

    // Create alert if none exists for this node
    let alert = this.alerts.find((a) => a.node_id === nodeId && a.status === "open");
    if (!alert) {
      alert = {
        id: "alert-" + Date.now(),
        org_id: node.org_id,
        node_id: nodeId,
        area_id: node.area_id,
        level: "active",
        signals: { temp_trend: true, neighbor: true, co: true },
        snapshot: {
          t50: targetTemp,
          co_ppm: coPpm,
          rate: 8.5,
          eta: 8.4,
          direction: "Timur Laut (45°)",
          ember_depth_cm: 50,
        },
        status: "open",
        created_at: new Date().toISOString(),
      };
      this.alerts.unshift(alert);
    }
    return { node, alert };
  }

  public static getInstance(): MockDataStore {
    if (!MockDataStore.instance) {
      MockDataStore.instance = new MockDataStore();
    }
    return MockDataStore.instance;
  }
}

export const mockStore = MockDataStore.getInstance();
