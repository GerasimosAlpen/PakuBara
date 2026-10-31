"""
Kalibrasi Uji Bak Gambut & Evaluasi Fusi 3 Sinyal PakuBara
Mengacu pada PRD Seksi 10.1 - 10.3:
- Regresi Linear Multi-Kedalaman (20 cm, 50 cm, 100 cm) menggunakan scikit-learn
- Kalkulasi vektor arah rambat bawah permukaan (atan2) & ETA permukaan
- Evaluasi aturan fusi '2 dari 3 sinyal' (S1 Tren Suhu, S2 Tetangga, S3 Gas CO MQ-7)
"""

from __future__ import annotations
import math
from dataclasses import dataclass
from typing import Dict, List, Tuple
import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, precision_score, recall_score, f1_score


@dataclass
class SubsurfacePrediction:
    node_id: str
    rates_c_per_h: Dict[str, float]
    r_squared: Dict[str, float]
    ember_depth_cm: int
    direction_deg: float
    direction_cardinal: str
    speed_cm_per_h: float
    eta_surface_h: float
    recommended_water_l: int
    confidence: str


def fit_depth_regression(
    timestamps_hours: np.ndarray, temps_celsius: np.ndarray
) -> Tuple[float, float]:
    """
    Menghitung laju kenaikan suhu r_z (C/jam) dan R^2 menggunakan OLS LinearRegression
    dari scikit-learn pada jendela pengamatan 3-6 jam terakhir.
    """
    if len(timestamps_hours) < 2:
        return 0.0, 0.0

    X = timestamps_hours.reshape(-1, 1)
    y = temps_celsius

    model = LinearRegression()
    model.fit(X, y)
    slope = float(model.coef_[0])

    y_pred = model.predict(X)
    variance = float(np.var(y))
    if variance < 1e-6:
        r2 = 0.0
    else:
        r2 = float(max(0.0, min(1.0, r2_score(y, y_pred))))

    return round(slope, 3), round(r2, 3)


def degree_to_cardinal_id(deg: float) -> str:
    directions = [
        "Utara",
        "Timur Laut",
        "Timur",
        "Tenggara",
        "Selatan",
        "Barat Daya",
        "Barat",
        "Barat Laut",
    ]
    idx = int(round((deg % 360) / 45.0)) % 8
    return directions[idx]


def compute_spread_vector_and_eta(
    node_id: str,
    df_node: pd.DataFrame,
    neighbors: List[Dict[str, float]],
) -> SubsurfacePrediction:
    """
    Menghitung prediksi kedalaman bara aktif z*, vektor arah rambat (theta),
    kecepatan rambat v (cm/jam), dan ETA tembus permukaan.
    """
    t_hours = df_node["hour_offset"].to_numpy(dtype=float)

    rates: Dict[str, float] = {}
    r2_map: Dict[str, float] = {}
    latest_temps: Dict[int, float] = {}

    for depth_cm, col in [(20, "t20"), (50, "t50"), (100, "t100")]:
        series = df_node[col].to_numpy(dtype=float)
        slope, r2 = fit_depth_regression(t_hours, series)
        rates[col] = slope
        r2_map[col] = r2
        latest_temps[depth_cm] = float(series[-1])

    # Kedalaman bara aktif z* = argmax_z (T_z * max(r_z, 0.1))
    scores = {
        20: latest_temps[20] * max(rates["t20"], 0.1),
        50: latest_temps[50] * max(rates["t50"], 0.1),
        100: latest_temps[100] * max(rates["t100"], 0.1),
    }
    ember_depth_cm = max(scores, key=scores.get)

    # Vektor arah rambat dari gradien pemanasan paku tetangga
    sum_rx = 0.0
    sum_ry = 0.0
    valid_neighbors = 0

    for nb in neighbors:
        r_i = max(0.0, nb.get("rate_c_per_h", 0.0))
        if r_i > 0.2:
            valid_neighbors += 1
            sum_rx += r_i * nb["dx_m"]
            sum_ry += r_i * nb["dy_m"]

    if valid_neighbors > 0 and (abs(sum_rx) > 1e-3 or abs(sum_ry) > 1e-3):
        # Konversi atan2 matematis ke kompas geografis (0 = Utara, searah jarum jam)
        angle_rad = math.atan2(sum_rx, sum_ry)
        direction_deg = (math.degrees(angle_rad) + 360.0) % 360.0
    else:
        direction_deg = 45.0  # Default Timur Laut sesuai dominasi angin lokal

    # Laju rambat fisika gambut (Huang & Rein, 2017): dibatasi pada [1.0, 10.0] cm/jam
    max_rate = max(rates.values())
    max_temp = max(latest_temps.values())
    estimated_speed = 1.5 + 0.35 * max(0.0, max_rate) + 0.004 * max(0.0, max_temp - 40.0)
    speed_cm_per_h = round(float(np.clip(estimated_speed, 1.0, 10.0)), 2)

    eta_surface_h = round(ember_depth_cm / speed_cm_per_h, 1)

    # Estimasi kebutuhan air presisi (Liter per titik injeksi Peat Nozzle)
    recommended_water_l = int(round(max(120.0, ember_depth_cm * 2.4)))

    max_r2 = max(r2_map.values())
    if valid_neighbors >= 3 and max_r2 >= 0.8:
        confidence = "high"
    elif valid_neighbors >= 1:
        confidence = "medium"
    else:
        confidence = "low"

    return SubsurfacePrediction(
        node_id=node_id,
        rates_c_per_h=rates,
        r_squared=r2_map,
        ember_depth_cm=ember_depth_cm,
        direction_deg=round(direction_deg, 1),
        direction_cardinal=degree_to_cardinal_id(direction_deg),
        speed_cm_per_h=speed_cm_per_h,
        eta_surface_h=eta_surface_h,
        recommended_water_l=recommended_water_l,
        confidence=confidence,
    )


def evaluate_2_of_3_fusion(
    df_samples: pd.DataFrame,
    temp_abs_c: float = 60.0,
    temp_rate_c_per_h: float = 3.0,
    co_ppm_threshold: float = 50.0,
) -> pd.DataFrame:
    """
    Mengevaluasi aturan fusi 2 dari 3 sinyal terhadap dataset pengujian bak gambut
    dan membandingkannya dengan ambang tunggal konvensional.
    """
    results = []
    for _, row in df_samples.iterrows():
        s1 = (row["max_temp_c"] >= temp_abs_c) or (
            row["rate_c_per_h"] >= temp_rate_c_per_h and row["r2"] >= 0.6
        )
        s2 = row["neighbor_rate_c_per_h"] >= 1.5
        co_adaptive_limit = row["co_median_24h"] + 3.0 * row["co_std_24h"]
        s3 = (row["co_ppm"] >= co_ppm_threshold) or (row["co_ppm"] >= co_adaptive_limit)

        signal_count = int(s1) + int(s2) + int(s3)
        fusion_alert = signal_count >= 2
        single_threshold_alert = (row["max_temp_c"] >= temp_abs_c) or (
            row["co_ppm"] >= co_ppm_threshold
        )

        results.append(
            {
                "sample_id": row["sample_id"],
                "scenario": row["scenario"],
                "s1_temp": s1,
                "s2_neighbor": s2,
                "s3_co": s3,
                "signal_count": signal_count,
                "predicted_active": fusion_alert,
                "single_sensor_alert": single_threshold_alert,
                "ground_truth_ember": bool(row["ground_truth_ember"]),
            }
        )

    return pd.DataFrame(results)


if __name__ == "__main__":
    # 1. Simulasi deret waktu 6 jam pada Node PK-04 (Sektor B-04 KHG Pulau Padang)
    df_pk04 = pd.DataFrame(
        {
            "hour_offset": [0.0, 1.0, 2.0, 3.0, 4.0, 5.0, 6.0],
            "t20": [31.0, 31.5, 32.0, 32.4, 33.0, 33.5, 34.0],
            "t50": [48.0, 85.0, 160.0, 275.0, 390.0, 485.0, 542.0],
            "t100": [30.5, 34.0, 39.5, 46.0, 54.0, 61.5, 68.0],
        }
    )

    neighbors_pk04 = [
        {"node_id": "PK-08", "dx_m": 38.0, "dy_m": 40.0, "rate_c_per_h": 4.2},
        {"node_id": "PK-05", "dx_m": -25.0, "dy_m": -30.0, "rate_c_per_h": 1.8},
        {"node_id": "PK-06", "dx_m": 20.0, "dy_m": 45.0, "rate_c_per_h": 2.1},
    ]

    pred = compute_spread_vector_and_eta("PK-04", df_pk04, neighbors_pk04)
    print("=== HASIL KALIBRASI REGRESI & VEKTOR RAMBAT (NODE PK-04) ===")
    print(f"Node ID               : {pred.node_id}")
    print(f"Laju Pemanasan (r_z)  : {pred.rates_c_per_h}")
    print(f"Skor Determinasi (R2) : {pred.r_squared}")
    print(f"Kedalaman Inti Bara   : {pred.ember_depth_cm} cm")
    print(f"Arah Rambat           : {pred.direction_deg} deg ({pred.direction_cardinal})")
    print(f"Kecepatan Rambat      : {pred.speed_cm_per_h} cm/jam")
    print(f"Estimasi Tembus (ETA) : +/- {pred.eta_surface_h} jam")
    print(f"Rekomendasi Suntik Air: {pred.recommended_water_l} Liter (Peat Nozzle)")
    print(f"Tingkat Keyakinan     : {pred.confidence.upper()}\n")

    # 2. Evaluasi akurasi penyaringan alarm palsu (Fusi 2-dari-3 vs Sensor Tunggal)
    test_cases = pd.DataFrame(
        [
            {
                "sample_id": 1,
                "scenario": "Bara Gambut Aktif 50cm (PK-04)",
                "max_temp_c": 542.0,
                "rate_c_per_h": 82.3,
                "r2": 0.98,
                "neighbor_rate_c_per_h": 4.2,
                "co_ppm": 185.0,
                "co_median_24h": 18.0,
                "co_std_24h": 4.5,
                "ground_truth_ember": True,
            },
            {
                "sample_id": 2,
                "scenario": "Bara Awal Merambat 50cm (PK-05)",
                "max_temp_c": 64.5,
                "rate_c_per_h": 5.4,
                "r2": 0.91,
                "neighbor_rate_c_per_h": 2.1,
                "co_ppm": 68.0,
                "co_median_24h": 20.0,
                "co_std_24h": 5.0,
                "ground_truth_ember": True,
            },
            {
                "sample_id": 3,
                "scenario": "Asap Knalpot Genset Patroli (Alarm Palsu CO)",
                "max_temp_c": 31.2,
                "rate_c_per_h": 0.2,
                "r2": 0.15,
                "neighbor_rate_c_per_h": 0.1,
                "co_ppm": 135.0,
                "co_median_24h": 19.0,
                "co_std_24h": 4.0,
                "ground_truth_ember": False,
            },
            {
                "sample_id": 4,
                "scenario": "Panas Terik Siang Permukaan 20cm (Alarm Palsu Suhu)",
                "max_temp_c": 44.0,
                "rate_c_per_h": 3.2,
                "r2": 0.72,
                "neighbor_rate_c_per_h": 0.3,
                "co_ppm": 21.0,
                "co_median_24h": 18.0,
                "co_std_24h": 3.5,
                "ground_truth_ember": False,
            },
            {
                "sample_id": 5,
                "scenario": "Kondisi Lahan Normal Stabil 72 Jam (PK-01)",
                "max_temp_c": 29.0,
                "rate_c_per_h": 0.0,
                "r2": 0.05,
                "neighbor_rate_c_per_h": 0.0,
                "co_ppm": 12.0,
                "co_median_24h": 14.0,
                "co_std_24h": 2.0,
                "ground_truth_ember": False,
            },
        ]
    )

    eval_df = evaluate_2_of_3_fusion(test_cases)
    y_true = eval_df["ground_truth_ember"]
    y_fusion = eval_df["predicted_active"]
    y_single = eval_df["single_sensor_alert"]

    print("=== EVALUASI METRIK KLASIFIKASI (FUSI 2/3 SINYAL VS SENSOR TUNGGAL) ===")
    print(eval_df[["scenario", "signal_count", "predicted_active", "ground_truth_ember"]].to_string(index=False))
    print(f"\nPrecision Fusi 2/3 Sinyal : {precision_score(y_true, y_fusion):.2f}")
    print(f"Recall Fusi 2/3 Sinyal    : {recall_score(y_true, y_fusion):.2f}")
    print(f"F1-Score Fusi 2/3 Sinyal  : {f1_score(y_true, y_fusion):.2f}")
    print(f"Precision Sensor Tunggal  : {precision_score(y_true, y_single):.2f} (Rawan Alarm Palsu)")

