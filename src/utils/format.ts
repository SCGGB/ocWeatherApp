import type { City, Config } from "../types/City";

export function unitSymbol(unit: Config["unit"]): string {
  return unit === "fahrenheit" ? "°F" : "°C";
}

export function cityLabel(city: City): string {
  return city.country ? `${city.name}, ${city.country}` : city.name;
}

export function formatTemp(temperature: number, unit: Config["unit"]): string {
  return `${Math.round(temperature * 10) / 10} ${unitSymbol(unit)}`;
}
