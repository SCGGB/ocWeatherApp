import { dirname } from "node:path";

const baseDir = import.meta.dir.startsWith("B:\\~BUN") ? dirname(process.execPath) : import.meta.dir;
const CONFIG_PATH = `${baseDir}\\weather-cli.json`;
const SEPARATOR = "════════════════════════════════════════";

const USE_COLOR = process.stdout.isTTY ?? false;

function cyan(text: string): string {
  return USE_COLOR ? `\x1b[36m${text}\x1b[0m` : text;
}

function amarillo(text: string): string {
  return USE_COLOR ? `\x1b[33m${text}\x1b[0m` : text;
}

function verde(text: string): string {
  return USE_COLOR ? `\x1b[32m${text}\x1b[0m` : text;
}

function rojo(text: string): string {
  return USE_COLOR ? `\x1b[31m${text}\x1b[0m` : text;
}

type City = {
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
};

type Config = {
  cities: City[];
  defaultCity: City | null;
  unit: "celsius" | "fahrenheit";
};

const stdin = Bun.stdin.stream();
const decoder = new TextDecoder();
let inputBuffer = "";

async function* readLines(): AsyncGenerator<string> {
  for await (const chunk of stdin) {
    inputBuffer += decoder.decode(chunk, { stream: true });
    let newline: number;
    while ((newline = inputBuffer.indexOf("\n")) !== -1) {
      const line = inputBuffer.slice(0, newline).replace(/\r$/, "");
      inputBuffer = inputBuffer.slice(newline + 1);
      yield line;
    }
  }
  if (inputBuffer) {
    const last = inputBuffer;
    inputBuffer = "";
    yield last;
  }
}

const lines = readLines();

class InputClosed extends Error {}

async function ask(prompt: string): Promise<string> {
  process.stdout.write(prompt);
  const { value, done } = await lines.next();
  if (done) throw new InputClosed();
  return value.trim();
}

function unitSymbol(unit: Config["unit"]): string {
  return unit === "fahrenheit" ? "°F" : "°C";
}

function cityLabel(city: City): string {
  return city.country ? `${city.name}, ${city.country}` : city.name;
}

async function loadConfig(): Promise<Config> {
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

async function saveConfig(config: Config): Promise<void> {
  await Bun.write(CONFIG_PATH, JSON.stringify(config, null, 2));
}

type GeoResult = {
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
};

async function searchCity(name: string): Promise<City | null> {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(name)}&count=1&language=es&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al consultar el servicio de geocodificación.");
  const data = (await res.json()) as { results?: GeoResult[] };
  const first = data.results?.[0];
  if (!first) return null;
  return {
    name: first.name,
    country: first.country,
    admin1: first.admin1,
    latitude: first.latitude,
    longitude: first.longitude,
  };
}

async function getTemperature(city: City, unit: Config["unit"]): Promise<number> {
  const fahrenheit = unit === "fahrenheit" ? "&temperature_unit=fahrenheit" : "";
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m${fahrenheit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error al consultar el clima.");
  const data = (await res.json()) as { current?: { temperature_2m?: number } };
  const temperature = data.current?.temperature_2m;
  if (temperature === undefined) throw new Error("No se recibió la temperatura.");
  return temperature;
}

function formatTemp(temperature: number, unit: Config["unit"]): string {
  return `${Math.round(temperature * 10) / 10} ${unitSymbol(unit)}`;
}

function printMenu(config: Config): void {
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

function printCityList(cities: City[]): void {
  cities.forEach((city, index) => console.log(`${index + 1}. ${cityLabel(city)}`));
}

async function showWeather(city: City, unit: Config["unit"]): Promise<void> {
  const temperature = await getTemperature(city, unit);
  console.log(`${cityLabel(city)}: ${amarillo(formatTemp(temperature, unit))}`);
}

async function weatherDefault(config: Config): Promise<void> {
  if (!config.defaultCity) {
    console.log(rojo("No hay ciudad default configurada. Usa la opción 5 para establecerla."));
    return;
  }
  await showWeather(config.defaultCity, config.unit);
}

async function weatherAll(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    console.log(rojo("No hay ciudades guardadas. Usa la opción 3 para agregar una."));
    return;
  }
  for (const city of config.cities) {
    await showWeather(city, config.unit);
  }
}

async function addCity(config: Config): Promise<void> {
  const name = await ask("Nombre de la ciudad a buscar: ");
  const city = await searchCity(name);
  if (!city) {
    console.log(rojo(`No se encontró ninguna ciudad llamada "${name}".`));
    return;
  }
  const label = city.country ? `${city.name}, ${city.country}` : city.name;
  const confirm = await ask(`¿Agregar "${label}"? (s/n): `);
  if (confirm.toLowerCase() !== "s") {
    console.log(rojo("Cancelado."));
    return;
  }
  config.cities.push(city);
  await saveConfig(config);
  console.log(verde("Ciudad agregada."));
}

async function removeCity(config: Config): Promise<void> {
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

async function setDefault(config: Config): Promise<void> {
  if (config.cities.length === 0) {
    console.log(rojo("No hay ciudades guardadas. Usa la opción 3 para agregar una."));
    return;
  }
  printCityList(config.cities);
  const pick = Number(await ask("Número de la ciudad a establecer como default: ")) - 1;
  const city = config.cities[pick];
  if (!city) {
    console.log(rojo("Opción inválida."));
    return;
  }
  config.defaultCity = { ...city };
  await saveConfig(config);
  console.log(verde(`Ciudad default establecida: ${cityLabel(city)}.`));
}

async function toggleUnit(config: Config): Promise<void> {
  config.unit = config.unit === "celsius" ? "fahrenheit" : "celsius";
  await saveConfig(config);
  console.log(verde(`Unidad configurada: ${unitSymbol(config.unit)}.`));
}

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
          await setDefault(config);
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
