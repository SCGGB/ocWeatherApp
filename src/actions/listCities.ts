import type { City } from "../types/City";

export function listCities(cities: City[]): void {
  cities.forEach((city, index) => console.log(`${index + 1}. ${city.name}`));
}
