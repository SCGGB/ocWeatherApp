import type { City, Config } from "../types/City";
import { CONFIG_PATH } from "../utils/constants";

export async function loadConfig(): Promise<Config> {
  const file = Bun.file(CONFIG_PATH);
  if (!(await file.exists())) {
    return { cities: [], defaultCity: null, unit: "celsius" };
  }
  const data = (await file.json()) as Partial<Config>;
  return {
    cities: data.cities ?? [],
    defaultCity: data.defaultCity ?? null,
    unit: data.unit === "fahrenheit" ? "fahrenheit" : "celsius",
  };
}

export async function saveConfig(config: Config): Promise<void> {
  await Bun.write(CONFIG_PATH, JSON.stringify(config, null, 2));
}
