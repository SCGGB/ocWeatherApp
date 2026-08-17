export const USE_COLOR = process.stdout.isTTY ?? false;

export function cyan(text: string): string {
  return USE_COLOR ? `\x1b[36m${text}\x1b[0m` : text;
}

export function amarillo(text: string): string {
  return USE_COLOR ? `\x1b[33m${text}\x1b[0m` : text;
}

export function verde(text: string): string {
  return USE_COLOR ? `\x1b[32m${text}\x1b[0m` : text;
}

export function rojo(text: string): string {
  return USE_COLOR ? `\x1b[31m${text}\x1b[0m` : text;
}
