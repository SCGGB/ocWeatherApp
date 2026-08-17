export function getUseColor(): boolean {
  return process.env.FORCE_COLOR !== undefined
    ? process.env.FORCE_COLOR === "1"
    : process.stdout?.isTTY ?? false;
}

export const USE_COLOR = getUseColor();

export function cyan(text: string): string {
  return getUseColor() ? `\x1b[36m${text}\x1b[0m` : text;
}

export function amarillo(text: string): string {
  return getUseColor() ? `\x1b[33m${text}\x1b[0m` : text;
}

export function verde(text: string): string {
  return getUseColor() ? `\x1b[32m${text}\x1b[0m` : text;
}

export function rojo(text: string): string {
  return getUseColor() ? `\x1b[31m${text}\x1b[0m` : text;
}
