import { loadConfig } from "./storage/citiesStorage";
import { printMenu } from "./presentation/menu";
import { ask, InputClosed } from "./presentation/input";
import { verde, rojo } from "./utils/colors";
import { weatherDefault, weatherAll } from "./actions/getWeather";
import { addCity } from "./actions/addCity";
import { removeCity } from "./actions/removeCity";
import { setDefaultCity } from "./actions/setDefaultCity";
import { toggleUnit } from "./actions/toggleUnit";

async function main(): Promise<void> {
  const config = await loadConfig();
  try {
    while (true) {
      printMenu(config);
      const option = await ask("Selecciona una opción: ");
      switch (option) {
        case "1":
          await weatherDefault(config);
          break;
        case "2":
          await weatherAll(config);
          break;
        case "3":
          await addCity(config);
          break;
        case "4":
          await removeCity(config);
          break;
        case "5":
          await setDefaultCity(config);
          break;
        case "8":
          await toggleUnit(config);
          break;
        case "9":
          console.log(verde("¡Hasta luego!"));
          return;
        default:
          console.log(rojo("Opción inválida."));
      }
    }
  } catch (error) {
    if (!(error instanceof InputClosed)) {
      console.log(rojo(error instanceof Error ? error.message : "Error inesperado."));
    }
  }
}

main();
