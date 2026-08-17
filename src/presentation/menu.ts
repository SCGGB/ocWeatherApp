import type { Config } from "../types/City";
import { cyan } from "../utils/colors";
import { unitSymbol } from "../utils/format";
import { SEPARATOR } from "../utils/constants";

export function printMenu(config: Config): void {
  console.log("");
  console.log(cyan(SEPARATOR));
  console.log(cyan("         WEATHER CLI"));
  console.log(cyan(SEPARATOR));
  console.log(cyan("  1. Clima de ciudad default"));
  console.log(cyan(`  2. Clima de todas las ciudades (${config.cities.length})`));
  console.log(cyan("  3. Buscar y agregar ciudad"));
  console.log(cyan("  4. Eliminar ciudad"));
  console.log(cyan("  5. Establecer ciudad default"));
  console.log(cyan(`  8. Ajustes (${unitSymbol(config.unit)})`));
  console.log(cyan("  9. Salir"));
  console.log(cyan(SEPARATOR));
}
