export interface WeatherData {
  windSpeedMs: number;
  windDirDeg: number;
  windDirText: string;
  coUgm3?: number;
  pm25Ugm3?: number;
  timestamp: string;
}

/**
 * Converts degree angle to Indonesian compass direction.
 */
function degToCompass(deg: number): string {
  const directions = [
    "Utara",
    "Timur Laut",
    "Timur",
    "Tenggara",
    "Selatan",
    "Barat Daya",
    "Barat",
    "Barat Laut",
  ];
  const index = Math.round(((deg % 360) + 360) % 360 / 45) % 8;
  return directions[index];
}

/**
 * Fetches real-time wind vector and air quality for a latitude/longitude point.
 * Free Open-Meteo API (non-commercial, no API key required).
 */
export async function fetchWeatherData(
  lat: number = -1.2345,
  lon: number = 102.6789
): Promise<WeatherData> {
  try {
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=wind_speed_10m,wind_direction_10m&timezone=Asia/Jakarta`;
    const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=carbon_monoxide,pm2_5&timezone=Asia/Jakarta`;

    const [weatherRes, aqRes] = await Promise.allSettled([
      fetch(weatherUrl, { next: { revalidate: 3600 } }),
      fetch(aqUrl, { next: { revalidate: 3600 } }),
    ]);

    let windSpeed = 3.2; // default m/s
    let windDir = 45; // default Northeast

    if (weatherRes.status === "fulfilled" && weatherRes.value.ok) {
      const data = await weatherRes.value.json();
      if (data.current) {
        windSpeed = data.current.wind_speed_10m ?? 3.2;
        windDir = data.current.wind_direction_10m ?? 45;
      }
    }

    let co = 210; // µg/m³
    let pm25 = 28.5; // µg/m³

    if (aqRes.status === "fulfilled" && aqRes.value.ok) {
      const aqData = await aqRes.value.json();
      if (aqData.current) {
        co = aqData.current.carbon_monoxide ?? 210;
        pm25 = aqData.current.pm2_5 ?? 28.5;
      }
    }

    return {
      windSpeedMs: parseFloat(windSpeed.toFixed(1)),
      windDirDeg: Math.round(windDir),
      windDirText: degToCompass(windDir),
      coUgm3: parseFloat(co.toFixed(1)),
      pm25Ugm3: parseFloat(pm25.toFixed(1)),
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.warn("Open-Meteo weather fetch error. Using regional default:", error);
    return {
      windSpeedMs: 3.5,
      windDirDeg: 60,
      windDirText: "Timur Laut",
      coUgm3: 180,
      pm25Ugm3: 25.0,
      timestamp: new Date().toISOString(),
    };
  }
}

