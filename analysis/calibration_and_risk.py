"""
PakuBara - Peat Soil Bin Calibration & Multi-Criteria Risk Scoring Analysis
Standar Acuan: Permen LHK No. P.32/2016 & Riset Karhutla Gambut Indonesia

Script ini memodelkan:
1. Kurva kalibrasi penetrasi panas pirolisis gambut (20cm, 50cm, 100cm).
2. Regresi linear OLS laju pemanasan (r_z) dan estimasi R^2.
3. Kalkulasi Matriks Prioritas Siaga 1 km² berbasis 4 faktor tertimbang.
"""

import math
import json
import csv
from datetime import datetime

def calibrate_peat_bin_data():
    """
    Simulasi uji bak gambut kedalaman 120 cm dengan sumber bara terpusat pada 50 cm.
    Menghasilkan profil gradien suhu eksponensial khas konduktivitas termal gambut rendah.
    """
    hours = list(range(0, 25))
    results = []
    
    for h in hours:
        # Simulasi bara berkembang pada kedalaman 50 cm
        progress = h / 24.0
        t20 = round(30.0 + progress * 6.4 + 0.2 * math.sin(h), 2)
        t50 = round(32.0 + (progress ** 2) * 55.3 + 0.3 * math.cos(h), 2) # Puncak 87.3°C
        t100 = round(31.0 + progress * 11.0, 2)
        
        results.append({
            "hour": h,
            "t20": t20,
            "t50": t50,
            "t100": t100
        })
        
    return results

def compute_linear_rate(series):
    """
    Menghitung regresi linier OLS: y = mx + c
    Mengembalikan slope (m) dan koefisien determinasi R^2.
    """
    n = len(series)
    if n < 2:
        return 0.0, 0.0
        
    x = [s["hour"] for s in series]
    y = [s["t50"] for s in series]
    
    x_mean = sum(x) / n
    y_mean = sum(y) / n
    
    numerator = sum((x[i] - x_mean) * (y[i] - y_mean) for i in range(n))
    denominator = sum((x[i] - x_mean) ** 2 for i in range(n))
    
    if denominator == 0:
        return 0.0, 0.0
        
    slope = numerator / denominator
    intercept = y_mean - slope * x_mean
    
    # R^2
    ss_tot = sum((y[i] - y_mean) ** 2 for i in range(n))
    ss_res = sum((y[i] - (slope * x[i] + intercept)) ** 2 for i in range(n))
    r_squared = 1.0 - (ss_res / ss_tot) if ss_tot > 0 else 0.0
    
    return round(slope, 3), round(r_squared, 3)

def compute_priority_grid(num_cells=20):
    """
    Menghitung skor Prioritas Siaga 1 km²:
    Skor = 100 * (0.35 * F_cuaca + 0.30 * F_historis + 0.20 * F_gambut + 0.15 * F_akses)
    """
    grid = []
    
    for i in range(1, num_cells + 1):
        cell_id = f"CELL-{i:03d}"
        
        # Bobot sintesis berdasarkan variasi bentang lahan Pulau Padang
        f_cuaca = round(0.5 + 0.45 * math.sin(i * 0.8), 2)
        f_historis = round(0.4 + 0.5 * math.cos(i * 0.5), 2)
        f_gambut = round(0.6 + 0.35 * math.sin(i * 1.2), 2)
        f_akses = round(0.3 + 0.6 * math.cos(i * 0.9), 2)
        
        # Normalisasi ke range [0, 1]
        f_cuaca = max(0.1, min(1.0, f_cuaca))
        f_historis = max(0.1, min(1.0, f_historis))
        f_gambut = max(0.1, min(1.0, f_gambut))
        f_akses = max(0.1, min(1.0, f_akses))
        
        score = round(100 * (0.35 * f_cuaca + 0.30 * f_historis + 0.20 * f_gambut + 0.15 * f_akses), 1)
        
        grid.append({
            "cell_id": cell_id,
            "f_cuaca": f_cuaca,
            "f_historis": f_historis,
            "f_gambut": f_gambut,
            "f_akses": f_akses,
            "score": score
        })
        
    grid.sort(key=lambda x: x["score"], reverse=True)
    return grid

if __name__ == "__main__":
    print("=" * 60)
    print("PakuBara - Peat Soil Bin Calibration & Risk Analysis Engine")
    print("=" * 60)
    
    calibration_data = calibrate_peat_bin_data()
    slope, r2 = compute_linear_rate(calibration_data)
    
    print(f"\n[Kalibrasi Suhu 50cm]:")
    print(f"Laju Pemanasan (r_z): {slope} °C/jam")
    print(f"Koefisien Determinasi (R²): {r2}")
    if slope >= 5.0 and r2 >= 0.8:
        print("Status: TERVERIFIKASI BARA AKTIF (Laju melebihi ambang batas 5.0°C/jam)")
        
    grid_scores = compute_priority_grid(10)
    print("\n[Top 5 Sel Prioritas Siaga 1 km²]:")
    for cell in grid_scores[:5]:
        print(f"{cell['cell_id']} | Skor: {cell['score']} | Cuaca: {cell['f_cuaca']} | Historis: {cell['f_historis']} | Gambut: {cell['f_gambut']}")
        
    print("\nSelesai. Modul analitik siap diintegrasikan ke API backend PakuBara.")

