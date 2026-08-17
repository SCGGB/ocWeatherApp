import { dirname } from "node:path";

const baseDir = import.meta.dir.includes("~BUN")
  ? dirname(process.execPath)
  : dirname(import.meta.dir);

export const CONFIG_PATH = `${baseDir}\\weather-cli.json`;
export const SEPARATOR = "════════════════════════════════════════";
