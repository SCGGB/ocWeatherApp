import type { Config } from "../types/City";
import { saveConfig } from "../storage/citiesStorage";
import { cityLabel } from "../utils/format";
import { verde, rojo } from "../utils/colors";
import { ask } from "../presentation/input";
import { printCityList } from "../presentation/output";

export async function setDefaultCity(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    console.log(rojo("No hay ciudades guardadas. Usa la opción 3 para agregar una."));
    return;
  }
  printCityList(config.cities);
  const pick = Number(await ask("Número de la ciudad a establecer como default: ")) - 1;
  const city = config.cities[pick];
  if (!city) {
    console.log(rojo("Opción inválida."));
    return;
  }
  config.defaultCity = { ...city };
  await saveConfig(config);
  console.log(verde(`Ciudad default establecida: ${cityLabel(city)}.`));
}
