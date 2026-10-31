"use client";

import React, { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {
  Globe,
  Mountain,
  Building2,
  RefreshCw,
  Box,
  Wind,
  Cloud,
  Footprints,
  Flame,
  Bell,
  WifiOff,
  Compass,
  Navigation,
  ListFilter,
  LocateFixed,
} from "lucide-react";

export interface MapNode {
  id: string;
  type: "probe" | "gas";
  area_id?: string;
  lat: number;
  lon: number;
  status: "normal" | "watch" | "warning" | "active" | "offline";
  last_reading: {
    t20?: number;
    t50?: number;
    t100?: number;
    co?: number;
  };
}

export interface MapHotspot {
  id: string;
  lat: number;
  lon: number;
  brightness: number;
  frp: number;
  confidence: string;
}

interface CommandMapProps {
  nodes?: MapNode[];
  hotspots?: MapHotspot[];
  selectedNodeId?: string | null;
  onSelectNode?: (node: MapNode) => void;
  activeAreaId?: string;
  onSelectArea?: (areaId: string) => void;
  spreadVector?: {
    origin: [number, number];
    directionDeg: number;
    distanceMeters: number;
    etaHours: number;
  } | null;
  wind?: {
    speedKmh: number;
    directionDeg: number;
  };
}

const BASEMAPS = {
  esri_dark: {
    name: "Dark Canvas",
    style: {
      version: 8,
      sources: {
        "esri-dark-base": {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "&copy; OpenMapTiles Data from OpenStreetMap",
        },
        "esri-dark-ref": {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
        },
      },
      layers: [
        {
          id: "esri-dark-base-layer",
          type: "raster",
          source: "esri-dark-base",
          minzoom: 0,
          maxzoom: 16,
        },
        {
          id: "esri-dark-ref-layer",
          type: "raster",
          source: "esri-dark-ref",
          minzoom: 0,
          maxzoom: 16,
        },
      ],
    },
  },
  esri_satellite: {
    name: "Satelit Esri",
    style: {
      version: 8,
      sources: {
        "esri-sat": {
          type: "raster",
          tiles: [
            "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
          ],
          tileSize: 256,
          attribution: "Esri, Maxar, Earthstar Geographics",
        },
      },
      layers: [
        {
          id: "esri-sat-layer",
          type: "raster",
          source: "esri-sat",
          minzoom: 0,
          maxzoom: 20,
        },
      ],
    },
  },
  osm_standard: {
    name: "OpenStreetMap",
    style: {
      version: 8,
      sources: {
        "osm-tiles": {
          type: "raster",
          tiles: [
            "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
          ],
          tileSize: 256,
          attribution: "&copy; OpenStreetMap contributors",
        },
      },
      layers: [
        {
          id: "osm-tiles-layer",
          type: "raster",
          source: "osm-tiles",
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    },
  },
};

export function CommandMap({
  nodes = [],
  hotspots = [],
  selectedNodeId,
  onSelectNode,
  activeAreaId = "a0000000-0000-0000-0000-000000000001",
  onSelectArea,
  spreadVector,
  wind = { speedKmh: 14.2, directionDeg: 220 },
}: CommandMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  const [basemapKey, setBasemapKey] = useState<keyof typeof BASEMAPS>("esri_dark");
  const [is3D, setIs3D] = useState<boolean>(false);
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);
  const [showFirms, setShowFirms] = useState<boolean>(true);
  const [showSpread, setShowSpread] = useState<boolean>(true);
  const [showWind, setShowWind] = useState<boolean>(true);
  const [showBoundary, setShowBoundary] = useState<boolean>(true);
  const [showLegend, setShowLegend] = useState<boolean>(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: BASEMAPS[basemapKey].style as unknown as string,
      center: [102.6789, -1.2345], // Pusat Lapangan Paku Sensor Pulau Padang
      zoom: 15.0,
      pitch: 0,
      bearing: 0,
      attributionControl: false,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      updateMapLayers();
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Handle Basemap Switch
  useEffect(() => {
    if (!map.current) return;
    map.current.setStyle(BASEMAPS[basemapKey].style as unknown as string);
    map.current.once("style.load", () => {
      updateMapLayers();
    });
  }, [basemapKey]);

  // Handle 2D / 3D Pitch toggle
  useEffect(() => {
    if (!map.current) return;
    map.current.easeTo({
      pitch: is3D ? 58 : 0,
      bearing: is3D ? 25 : 0,
      duration: 1000,
    });
  }, [is3D]);

  // Update GeoJSON layers when nodes or hotspots update
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    updateMapLayers();
  }, [nodes, hotspots, showHeatmap, showFirms, showSpread, showWind]);

  const updateMapLayers = () => {
    const m = map.current;
    if (!m) return;

    // 1. Boundary Polygons for Monitored Peat Areas (Riau & Kalimantan KHG)
    const boundaryGeoJSON: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [102.665, -1.225],
                [102.695, -1.225],
                [102.695, -1.245],
                [102.665, -1.245],
                [102.665, -1.225],
              ],
            ],
          },
          properties: { name: "Blok B Hutan Gambut Lindung (Riau)" },
        },
        {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [113.880, -2.260],
                [113.980, -2.260],
                [113.980, -2.360],
                [113.880, -2.360],
                [113.880, -2.260],
              ],
            ],
          },
          properties: { name: "KHG Kahayan - Sebangau (Kalimantan Tengah)" },
        },
      ],
    };

    if (m.getSource("area-boundary")) {
      (m.getSource("area-boundary") as maplibregl.GeoJSONSource).setData(boundaryGeoJSON);
    } else {
      m.addSource("area-boundary", { type: "geojson", data: boundaryGeoJSON });
      m.addLayer({
        id: "area-boundary-fill",
        type: "fill",
        source: "area-boundary",
        paint: {
          "fill-color": "#0284C7",
          "fill-opacity": 0.05,
        },
      });
      m.addLayer({
        id: "area-boundary-line",
        type: "line",
        source: "area-boundary",
        paint: {
          "line-color": "#38BDF8",
          "line-width": 1.5,
          "line-dasharray": [3, 2],
        },
      });
    }

    // 2. Nodes Data
    const nodesGeoJSON: GeoJSON.FeatureCollection = {
      type: "FeatureCollection",
      features: nodes.map((n) => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [n.lon, n.lat] },
        properties: {
          id: n.id,
          type: n.type,
          status: n.status,
          t50: n.last_reading.t50 ?? 30,
          co: n.last_reading.co ?? 0,
          label: n.id,
        },
      })),
    };

    if (m.getSource("nodes-source")) {
      (m.getSource("nodes-source") as maplibregl.GeoJSONSource).setData(nodesGeoJSON);
    } else {
      m.addSource("nodes-source", { type: "geojson", data: nodesGeoJSON });

      // Heatmap layer for smoldering peat
      m.addLayer({
        id: "nodes-heat",
        type: "heatmap",
        source: "nodes-source",
        layout: { visibility: showHeatmap ? "visible" : "none" },
        paint: {
          "heatmap-weight": ["interpolate", ["linear"], ["get", "t50"], 30, 0.1, 60, 0.6, 90, 1.2],
          "heatmap-intensity": 1.5,
          "heatmap-color": [
            "interpolate",
            ["linear"],
            ["heatmap-density"],
            0,
            "rgba(0,0,0,0)",
            0.2,
            "rgba(16,185,129,0.3)",
            0.5,
            "rgba(245,158,11,0.6)",
            0.8,
            "rgba(234,88,12,0.85)",
            1,
            "rgba(220,38,38,0.95)",
          ],
          "heatmap-radius": 60,
          "heatmap-opacity": 0.75,
        },
      });

      // Node circles
      m.addLayer({
        id: "nodes-circle",
        type: "circle",
        source: "nodes-source",
        paint: {
          "circle-radius": [
            "case",
            ["==", ["get", "status"], "active"],
            12,
            ["==", ["get", "status"], "warning"],
            10,
            8,
          ],
          "circle-color": [
            "match",
            ["get", "status"],
            "active",
            "#DC2626",
            "warning",
            "#EA580C",
            "watch",
            "#F59E0B",
            "offline",
            "#64748B",
            "#10B981", // normal
          ],
          "circle-stroke-width": 2.5,
          "circle-stroke-color": "#FFFFFF",
        },
      });

      // Node labels
      m.addLayer({
        id: "nodes-label",
        type: "symbol",
        source: "nodes-source",
        layout: {
          "text-field": ["get", "label"],
          "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
          "text-size": 11,
          "text-offset": [0, 1.4],
          "text-anchor": "top",
        },
        paint: {
          "text-color": "#FFFFFF",
          "text-halo-color": "#121010",
          "text-halo-width": 2,
        },
      });

      // Node click handler
      m.on("click", "nodes-circle", (e) => {
        if (!e.features || e.features.length === 0) return;
        const feat = e.features[0];
        const clickedId = feat.properties?.id;
        const found = nodes.find((n) => n.id === clickedId);
        if (found && onSelectNode) {
          onSelectNode(found);
        }
      });

      m.on("mouseenter", "nodes-circle", () => {
        m.getCanvas().style.cursor = "pointer";
      });
      m.on("mouseleave", "nodes-circle", () => {
        m.getCanvas().style.cursor = "";
      });
    }

    // Toggle heatmap visibility
    if (m.getLayer("nodes-heat")) {
      m.setLayoutProperty("nodes-heat", "visibility", showHeatmap ? "visible" : "none");
    }

    // 3. Smoldering Spread Vector (Ray with direction theta and ETA)
    if (spreadVector && showSpread) {
      const [lon1, lat1] = spreadVector.origin;
      // Project destination point based on bearing
      const rad = (spreadVector.directionDeg * Math.PI) / 180;
      const meters = spreadVector.distanceMeters;
      // Approx 1 deg lat = 111,000m, 1 deg lon = 111,000m * cos(lat)
      const dLat = (meters * Math.cos(rad)) / 111000;
      const dLon = (meters * Math.sin(rad)) / (111000 * Math.cos((lat1 * Math.PI) / 180));
      const lon2 = lon1 + dLon;
      const lat2 = lat1 + dLat;

      const vectorGeoJSON: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: [
                [lon1, lat1],
                [lon2, lat2],
              ],
            },
            properties: {
              label: `Arah Rambat: ${spreadVector.directionDeg}° (ETA ${spreadVector.etaHours} jam)`,
            },
          },
        ],
      };

      if (m.getSource("spread-vector")) {
        (m.getSource("spread-vector") as maplibregl.GeoJSONSource).setData(vectorGeoJSON);
      } else {
        m.addSource("spread-vector", { type: "geojson", data: vectorGeoJSON });
        m.addLayer({
          id: "spread-vector-line",
          type: "line",
          source: "spread-vector",
          paint: {
            "line-color": "#EF4444",
            "line-width": 3,
            "line-dasharray": [4, 2],
          },
        });
        m.addLayer({
          id: "spread-vector-label",
          type: "symbol",
          source: "spread-vector",
          layout: {
            "symbol-placement": "line-center",
            "text-field": ["get", "label"],
            "text-size": 11,
            "text-offset": [0, -1.2],
          },
          paint: {
            "text-color": "#FCA5A5",
            "text-halo-color": "#450A0A",
            "text-halo-width": 2,
          },
        });
      }
    } else if (m.getLayer("spread-vector-line")) {
      m.setLayoutProperty("spread-vector-line", "visibility", "none");
      m.setLayoutProperty("spread-vector-label", "visibility", "none");
    }

    // 4. NASA FIRMS VIIRS Hotspots
    if (hotspots.length > 0 && showFirms) {
      const firmsGeoJSON: GeoJSON.FeatureCollection = {
        type: "FeatureCollection",
        features: hotspots.map((h) => ({
          type: "Feature",
          geometry: { type: "Point", coordinates: [h.lon, h.lat] },
          properties: {
            frp: h.frp,
            confidence: h.confidence,
            label: `FIRMS ${h.frp} MW`,
          },
        })),
      };

      if (m.getSource("firms-hotspots")) {
        (m.getSource("firms-hotspots") as maplibregl.GeoJSONSource).setData(firmsGeoJSON);
      } else {
        m.addSource("firms-hotspots", { type: "geojson", data: firmsGeoJSON });
        m.addLayer({
          id: "firms-circle",
          type: "circle",
          source: "firms-hotspots",
          paint: {
            "circle-radius": 7,
            "circle-color": "#E11D48",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#FFE4E6",
          },
        });
        m.addLayer({
          id: "firms-label",
          type: "symbol",
          source: "firms-hotspots",
          layout: {
            "text-field": ["get", "label"],
            "text-size": 9,
            "text-offset": [0, 1.2],
          },
          paint: {
            "text-color": "#FECDD3",
            "text-halo-color": "#121010",
            "text-halo-width": 1.5,
          },
        });
      }
    }
  };

  const cycleBasemap = () => {
    const keys = Object.keys(BASEMAPS) as (keyof typeof BASEMAPS)[];
    const nextIdx = (keys.indexOf(basemapKey) + 1) % keys.length;
    setBasemapKey(keys[nextIdx]);
  };

  const flyToPaku = (targetAreaId?: string) => {
    const aid = targetAreaId || activeAreaId;
    if (aid === "a0000000-0000-0000-0000-000000000003") {
      // Focus to Kalimantan KHG Sebangau cluster
      map.current?.flyTo({
        center: [113.9315, -2.3045],
        zoom: 14.8,
        pitch: 35,
        duration: 1600,
      });
    } else if (aid === "all") {
      // Overview all clusters
      map.current?.flyTo({
        center: [108.5, -1.8],
        zoom: 6.0,
        pitch: 20,
        bearing: 0,
        duration: 1600,
      });
    } else {
      // Focus to Riau Pulau Padang cluster
      map.current?.flyTo({
        center: [102.6789, -1.2345],
        zoom: 15.2,
        pitch: 35,
        duration: 1600,
      });
    }
  };

  const flyToActiveEmber = () => {
    if (activeAreaId === "a0000000-0000-0000-0000-000000000003") {
      // Jump to active ember in Kalimantan (PK-K03 89.6°C)
      map.current?.flyTo({
        center: [113.9315, -2.3045],
        zoom: 16.5,
        pitch: 52,
        bearing: 135,
        duration: 1600,
      });
    } else {
      // Jump to active ember in Riau (PK-04 87.3°C)
      map.current?.flyTo({
        center: [102.6789, -1.2345],
        zoom: 16.5,
        pitch: 52,
        bearing: 45,
        duration: 1600,
      });
    }
  };

  const resetNorth = () => {
    map.current?.resetNorthPitch({ duration: 800 });
  };

  // Sync flyTo when activeAreaId prop changes
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;
    flyToPaku(activeAreaId);
  }, [activeAreaId]);

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden rounded-xl border border-slate-800 bg-[#0B0F19]">
      {/* MapLibre WebGL Canvas Container */}
      <div ref={mapContainer} className="w-full h-full min-h-[500px]" />

      {/* Floating Icon Toolbar (Top Left) */}
      <div className="absolute top-3 left-3 z-10 flex flex-col items-start gap-2">
        <div className="flex items-center gap-1 bg-[#111622]/95 backdrop-blur-md p-1.5 rounded-xl border border-slate-800/90 shadow-2xl">
          <button
            onClick={cycleBasemap}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white transition-colors"
            title={`Ganti Peta Dasar (${BASEMAPS[basemapKey].name})`}
          >
            <Globe className="w-4 h-4 text-sky-400" />
          </button>

          <button
            onClick={() => setShowBoundary(!showBoundary)}
            className={`p-1.5 rounded-lg transition-colors ${
              showBoundary ? "bg-slate-800 text-white" : "text-slate-400 hover:text-white"
            }`}
            title="Batas Blok Konsesi Gambut"
          >
            <Building2 className="w-4 h-4 text-amber-400" />
          </button>

          <button
            onClick={() => flyToPaku()}
            className="p-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600 text-sky-400 hover:text-white border border-sky-500/40 transition-colors"
            title="Fokus ke Paku Sensor Wilayah Aktif"
          >
            <LocateFixed className="w-4 h-4 text-sky-400 hover:text-white" />
          </button>

          <button
            onClick={() => {
              map.current?.flyTo({ center: [118.0, -2.5], zoom: 4.8, pitch: 0, bearing: 0, duration: 1500 });
            }}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Lihat Seluruh Indonesia (Overview Nasional)"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-800 mx-0.5" />

          <button
            onClick={() => setIs3D(!is3D)}
            className={`p-1.5 rounded-lg transition-colors ${
              is3D ? "bg-sky-600 text-white font-bold" : "text-slate-400 hover:text-white"
            }`}
            title="Perspektif 2D / 3D"
          >
            <Box className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowWind(!showWind)}
            className={`p-1.5 rounded-lg transition-colors ${
              showWind ? "bg-slate-800 text-sky-300" : "text-slate-400 hover:text-white"
            }`}
            title="Lapisan Arah Angin"
          >
            <Wind className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowSpread(!showSpread)}
            className={`p-1.5 rounded-lg transition-colors ${
              showSpread ? "bg-red-950/80 text-red-400 border border-red-700/60" : "text-slate-400 hover:text-white"
            }`}
            title="Vektor Prediksi Arah Rambat"
          >
            <Footprints className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`p-1.5 rounded-lg transition-colors ${
              showHeatmap ? "bg-amber-950/80 text-amber-400 border border-amber-700/60" : "text-slate-400 hover:text-white"
            }`}
            title="Heatmap Suhu Bawah Permukaan"
          >
            <Flame className="w-4 h-4" />
          </button>

          <button
            onClick={flyToActiveEmber}
            className="p-1.5 rounded-lg hover:bg-red-900/60 text-red-400 hover:text-red-300 transition-colors"
            title="Lompat ke Titik Bara Aktif"
          >
            <Bell className="w-4 h-4 animate-bounce" />
          </button>

          <button
            onClick={resetNorth}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Reset Arah Utara (North Up)"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Area Jump Buttons (Pills) */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => {
              onSelectArea?.("a0000000-0000-0000-0000-000000000001");
              flyToPaku("a0000000-0000-0000-0000-000000000001");
            }}
            className={`px-2.5 py-1 text-[11px] font-mono rounded-lg backdrop-blur-md border transition-colors ${
              activeAreaId === "a0000000-0000-0000-0000-000000000001"
                ? "bg-slate-800 text-sky-300 border-sky-500/60 font-semibold shadow-md shadow-sky-950/40"
                : "bg-[#111622]/90 text-slate-300 border-slate-800/90 hover:bg-slate-800 hover:text-white"
            }`}
          >
            Riau (PK-01..08)
          </button>
          <button
            onClick={() => {
              onSelectArea?.("a0000000-0000-0000-0000-000000000003");
              flyToPaku("a0000000-0000-0000-0000-000000000003");
            }}
            className={`px-2.5 py-1 text-[11px] font-mono rounded-lg backdrop-blur-md border transition-colors ${
              activeAreaId === "a0000000-0000-0000-0000-000000000003"
                ? "bg-slate-800 text-amber-300 border-amber-500/60 font-semibold shadow-md shadow-amber-950/40"
                : "bg-[#111622]/90 text-slate-300 border-slate-800/90 hover:bg-slate-800 hover:text-white"
            }`}
          >
            Kalimantan KHG (PK-K01..K08)
          </button>
          <button
            onClick={() => {
              onSelectArea?.("all");
              flyToPaku("all");
            }}
            className={`px-2.5 py-1 text-[11px] font-mono rounded-lg backdrop-blur-md border transition-colors ${
              activeAreaId === "all"
                ? "bg-slate-800 text-emerald-300 border-emerald-500/60 font-semibold shadow-md shadow-emerald-950/40"
                : "bg-[#111622]/90 text-slate-300 border-slate-800/90 hover:bg-slate-800 hover:text-white"
            }`}
          >
            Semua Titik
          </button>
        </div>

        {/* Collapsible Legenda Button matching Lampiran 2 */}
        <button
          onClick={() => setShowLegend(!showLegend)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-[#111622]/95 backdrop-blur-md text-slate-200 border border-slate-800/90 shadow-xl hover:bg-slate-800 transition-colors"
        >
          <ListFilter className="w-3.5 h-3.5 text-slate-400" />
          <span>Legenda</span>
        </button>

        {/* Expanded Legend Card (Only shown when user opens it) */}
        {showLegend && (
          <div className="bg-[#111622]/95 backdrop-blur-md p-3 rounded-xl border border-slate-800 shadow-2xl text-[11px] flex flex-col gap-1.5 w-64 animate-fadeIn">
            <div className="font-semibold text-slate-300 text-[10px] uppercase tracking-wider mb-0.5">
              Legenda Simbol Peta
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-600 border border-white" />
              <span className="text-slate-200 font-medium">Bara Aktif (&ge;60°C atau laju &ge;5°C/j)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-slate-300">Waspada (45-59°C)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-slate-300">Normal (&lt;45°C)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-600 border border-rose-300" />
              <span className="text-slate-300">Hotspot Satelit NASA FIRMS</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-4 h-0.5 bg-red-500 border-b border-red-500 border-dashed" />
              <span className="text-slate-300">Vektor Prediksi Arah Rambat &amp; ETA</span>
            </div>
          </div>
        )}
      </div>

      {/* Wind & Weather Indicator Badge (Top Right) - Matching Lampiran 2 */}
      <div className="absolute top-3 right-14 bg-[#111622]/95 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-800/90 shadow-2xl flex items-center gap-2 z-10">
        <Navigation className="w-3.5 h-3.5 text-sky-400 rotate-45 shrink-0" />
        <div className="text-[11px] font-mono text-slate-200">
          Angin di 1.234°S 102.678°E: ke Timur Laut (45°) | {wind.speedKmh} km/jam · RH 88% · 31°C
        </div>
      </div>

      {/* Bottom Right Watermark Attribution - Matching Lampiran 2 */}
      <div className="absolute bottom-2 right-3 text-[10px] font-mono text-slate-400/80 bg-slate-950/70 px-2 py-0.5 rounded pointer-events-none z-10">
        OpenMapTiles Data from OpenStreetMap
      </div>
    </div>
  );
}

