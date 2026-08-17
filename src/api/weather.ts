import type { City, Config } from "../types/City";

export async function getTemperature(city: City, unit: Config["unit"]): Promise<number> {
  const fahrenheit = unit === "fahrenheit" ? "&temperature_unit=fahrenheit" : "";
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m${fahrenheit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al consultar el clima.");
  const data = (await res.json()) as { current?: { temperature_2m?: number } };
  const temperature = data.current?.temperature_2m;
  if (temperature === undefined) throw new Error("No se recibió la temperatura.");
  return temperature;
}
