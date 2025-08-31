// lib/weather.ts
export type Weather = { tempC: number; isRaining: boolean; };

export async function getWeather(lat: number, lon: number): Promise<Weather> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation&forecast_days=1`;
  const res = await fetch(url);
  const data = await res.json();
  const tempC = data?.current?.temperature_2m ?? 22;
  const isRaining = (data?.current?.precipitation ?? 0) > 0.1;
  return { tempC, isRaining };
}
