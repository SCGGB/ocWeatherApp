import type { City, Config } from "../types/City";
import { getTemperature } from "../api/weather";
import { cityLabel, formatTemp } from "../utils/format";
import { amarillo } from "../utils/colors";

export function printCityList(cities: City[]): void {
  cities.forEach((city, index) => console.log(`${index + 1}. ${cityLabel(city)}`));
}

export async function showWeather(city: City, unit: Config["unit"]): Promise<void> {
  const temperature = await getTemperature(city, unit);
  console.log(`${cityLabel(city)}: ${amarillo(formatTemp(temperature, unit))}`);
}
