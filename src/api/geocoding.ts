import type { City } from "../types/City";
import type { GeoResult } from "../types/Weather";

export async function searchCity(name: string): Promise<City | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=es&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al consultar el servicio de geocodificación.");
  const data = (await res.json()) as { results?: GeoResult[] };
  const first = data.results?.[0];
  if (!first) return null;
  return {
    name: first.name,
    country: first.country,
    admin1: first.admin1,
    latitude: first.latitude,
    longitude: first.longitude,
  };
}
