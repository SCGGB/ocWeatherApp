import { describe, it, expect, afterEach } from "bun:test";
import { readFile, writeFile, unlink } from "node:fs/promises";
import { CONFIG_PATH } from "../../src/utils/constants";

afterEach(async () => {
  try { await unlink(CONFIG_PATH); } catch {}
});

describe("loadConfig", () => {
  it("devuelve config por defecto cuando no existe el archivo", async () => {
    const { loadConfig } = await import("../../src/storage/citiesStorage");
    const config = await loadConfig();
    expect(config.cities).toEqual([]);
    expect(config.defaultCity).toBeNull();
    expect(config.unit).toBe("celsius");
  });

  it("carga config válida desde archivo", async () => {
    const testConfig = {
      cities: [
        { name: "Madrid", country: "España", latitude: 40, longitude: -3 },
      ],
      defaultCity: { name: "Madrid", country: "España", latitude: 40, longitude: -3 },
      unit: "fahrenheit",
    };
    await writeFile(CONFIG_PATH, JSON.stringify(testConfig));

    const { loadConfig } = await import("../../src/storage/citiesStorage");
    const config = await loadConfig();
    expect(config.cities).toHaveLength(1);
    expect(config.cities[0]!.name).toBe("Madrid");
    expect(config.defaultCity!.name).toBe("Madrid");
    expect(config.unit).toBe("fahrenheit");
  });

  it("maneja archivo con datos parciales", async () => {
    await writeFile(CONFIG_PATH, JSON.stringify({ cities: [] }));

    const { loadConfig } = await import("../../src/storage/citiesStorage");
    const config = await loadConfig();
    expect(config.cities).toEqual([]);
    expect(config.defaultCity).toBeNull();
    expect(config.unit).toBe("celsius");
  });

  it("normaliza unit inválido a celsius", async () => {
    await writeFile(CONFIG_PATH, JSON.stringify({ unit: "invalido" }));

    const { loadConfig } = await import("../../src/storage/citiesStorage");
    const config = await loadConfig();
    expect(config.unit).toBe("celsius");
  });
});

describe("saveConfig", () => {
  it("guarda la configuración correctamente", async () => {
    const { saveConfig, loadConfig } = await import("../../src/storage/citiesStorage");

    const config = {
      cities: [{ name: "Lima", country: "Perú", latitude: -12, longitude: -77 }],
      defaultCity: null,
      unit: "celsius" as const,
    };

    await saveConfig(config);

    const raw = await readFile(CONFIG_PATH, "utf-8");
    const saved = JSON.parse(raw);
    expect(saved.cities).toHaveLength(1);
    expect(saved.cities[0].name).toBe("Lima");

    const loaded = await loadConfig();
    expect(loaded.cities[0]!.name).toBe("Lima");
  });

  it("guarda JSON formateado con indentación", async () => {
    const { saveConfig } = await import("../../src/storage/citiesStorage");

    await saveConfig({
      cities: [],
      defaultCity: null,
      unit: "celsius",
    });

    const raw = await readFile(CONFIG_PATH, "utf-8");
    expect(raw).toContain("\n");
    expect(raw).toContain("  ");
  });
});
