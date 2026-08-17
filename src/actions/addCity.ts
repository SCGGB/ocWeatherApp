import type { City, Config } from "../types/City";
import { searchCity } from "../api/geocoding";
import { saveConfig } from "../storage/citiesStorage";
import { cityLabel } from "../utils/format";
import { verde, rojo } from "../utils/colors";
import { ask } from "../presentation/input";

export async function addCity(config: Config): Promise<void> {
  const name = await ask("Nombre de la ciudad a buscar: ");
  const city = await searchCity(name);
  if (!city) {
    console.log(rojo(`No se encontró ninguna ciudad llamada "${name}".`));
    return;
  }
  const label = cityLabel(city as City);
  const confirm = await ask(`¿Agregar "${label}"? (s/n): `);
  if (confirm.toLowerCase() !== "s") {
    console.log(rojo("Cancelado."));
    return;
  }
  config.cities.push(city);
  await saveConfig(config);
  console.log(verde("Ciudad agregada."));
}
