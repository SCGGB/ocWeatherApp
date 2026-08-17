import type { Config } from "../types/City";
import { showWeather } from "../presentation/output";
import { rojo } from "../utils/colors";

export async function weatherDefault(config: Config): Promise<void> {
  if (!config.defaultCity) {
    console.log(rojo("No hay ciudad default configurada. Usa la opción 5 para establecerla."));
    return;
  }
  await showWeather(config.defaultCity, config.unit);
}

export async function weatherAll(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    console.log(rojo("No hay ciudades guardadas. Usa la opción 3 para agregar una."));
    return;
  }
  for (const city of config.cities) {
    await showWeather(city, config.unit);
  }
}
