import type { Config } from "../types/City";
import { saveConfig } from "../storage/citiesStorage";
import { cityLabel } from "../utils/format";
import { verde, rojo } from "../utils/colors";
import { ask } from "../presentation/input";
import { printCityList } from "../presentation/output";

export async function removeCity(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    console.log(rojo("No hay ciudades guardadas."));
    return;
  }
  printCityList(config.cities);
  const pick = Number(await ask("Número de la ciudad a eliminar: ")) - 1;
  const city = config.cities[pick];
  if (!city) {
    console.log(rojo("Opción inválida."));
    return;
  }
  config.cities.splice(pick, 1);
  if (
    config.defaultCity &&
    config.defaultCity.latitude === city.latitude &&
    config.defaultCity.longitude === city.longitude
  ) {
    config.defaultCity = null;
    console.log(rojo("La ciudad default fue eliminada y quedó sin configurar."));
  }
  await saveConfig(config);
  console.log(verde(`"${cityLabel(city)}" eliminada.`));
}
