import type { Config } from "../types/City";
import { loadConfig, saveConfig } from "./citiesStorage";

export async function loadSettings(): Promise<Pick<Config, "unit">> {
  const config = await loadConfig();
  return { unit: config.unit };
}

export async function saveSettings(config: Config): Promise<void> {
  await saveConfig(config);
}
