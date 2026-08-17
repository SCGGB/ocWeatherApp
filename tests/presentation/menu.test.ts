import { describe, it, expect, spyOn, afterEach } from "bun:test";
import { unlink } from "node:fs/promises";
import { CONFIG_PATH } from "../../src/utils/constants";
import type { Config } from "../../src/types/City";

afterEach(async () => {
  try { await unlink(CONFIG_PATH); } catch {}
});

describe("printMenu", () => {
  it("muestra las opciones del menú", async () => {
    const consoleSpy = spyOn(console, "log").mockImplementation(() => {});
    const config: Config = {
      cities: [
        { name: "Madrid", country: "España", latitude: 40, longitude: -3 },
        { name: "Lima", country: "Perú", latitude: -12, longitude: -77 },
      ],
      defaultCity: null,
      unit: "celsius",
    };

    const { printMenu } = await import("../../src/presentation/menu");
    printMenu(config);

    expect(consoleSpy).toHaveBeenCalled();
    const allOutput = consoleSpy.mock.calls.map((c) => String(c[0])).join("\n");
    expect(allOutput).toContain("WEATHER CLI");
    expect(allOutput).toContain("1. Clima de ciudad default");
    expect(allOutput).toContain("2. Clima de todas las ciudades (2)");
    expect(allOutput).toContain("3. Buscar y agregar ciudad");
    expect(allOutput).toContain("4. Eliminar ciudad");
    expect(allOutput).toContain("5. Establecer ciudad default");
    expect(allOutput).toContain("8. Ajustes");
    expect(allOutput).toContain("9. Salir");
    consoleSpy.mockRestore();
  });

  it("muestra 0 ciudades cuando la lista está vacía", async () => {
    const consoleSpy = spyOn(console, "log").mockImplementation(() => {});
    const config: Config = { cities: [], defaultCity: null, unit: "celsius" };

    const { printMenu } = await import("../../src/presentation/menu");
    printMenu(config);

    const allOutput = consoleSpy.mock.calls.map((c) => String(c[0])).join("\n");
    expect(allOutput).toContain("0)");
    consoleSpy.mockRestore();
  });

  it("muestra unidad fahrenheit en ajustes", async () => {
    const consoleSpy = spyOn(console, "log").mockImplementation(() => {});
    const config: Config = { cities: [], defaultCity: null, unit: "fahrenheit" };

    const { printMenu } = await import("../../src/presentation/menu");
    printMenu(config);

    const allOutput = consoleSpy.mock.calls.map((c) => String(c[0])).join("\n");
    expect(allOutput).toContain("°F");
    consoleSpy.mockRestore();
  });
});
