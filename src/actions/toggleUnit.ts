import type { Config } from "../types/City";
import { saveConfig } from "../storage/citiesStorage";
import { unitSymbol } from "../utils/format";
import { verde } from "../utils/colors";

export async function toggleUnit(config: Config): Promise<void> {
  config.unit = config.unit === "celsius" ? "fahrenheit" : "celsius";
  await saveConfig(config);
  console.log(verde(`Unidad configurada: ${unitSymbol(config.unit)}.`));
}
