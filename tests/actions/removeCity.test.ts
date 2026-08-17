import { describe, it, expect, mock, spyOn, afterEach } from "bun:test";
import { writeFile, readFile, unlink } from "node:fs/promises";
import { CONFIG_PATH } from "../../src/utils/constants";
import type { Config } from "../../src/types/City";

afterEach(async () => {
  try { await unlink(CONFIG_PATH); } catch {}
});

const madrid = { name: "Madrid", country: "España", latitude: 40.4165, longitude: -3.70256 };
const lima = { name: "Lima", country: "Perú", latitude: -12.0464, longitude: -77.0428 };

async function writeTestConfig(config: Config) {
  await writeFile(CONFIG_PATH, JSON.stringify(config));
}

describe("removeCity", () => {
  it("muestra error cuando no hay ciudades", async () => {
    await writeTestConfig({ cities: [], defaultCity: null, unit: "celsius" });
    const consoleSpy = spyOn(console, "log").mockImplementation(() => {});
    const config: Config = { cities: [], defaultCity: null, unit: "celsius" };

    const { removeCity } = await import("../../src/actions/removeCity");
    await removeCity(config);

    const msg = consoleSpy.mock.calls[0]![0] as string;
    expect(msg).toContain("No hay ciudades guardadas");
    consoleSpy.mockRestore();
  });

  it("elimina una ciudad correctamente", async () => {
    await writeTestConfig({ cities: [madrid, lima], defaultCity: null, unit: "celsius" });
    mock.module("../../src/presentation/input", () => ({
      ask: mock(() => Promise.resolve("1")),
      InputClosed: class InputClosed extends Error {},
    }));

    const consoleSpy = spyOn(console, "log").mockImplementation(() => {});
    const config: Config = { cities: [madrid, lima], defaultCity: null, unit: "celsius" };

    const { removeCity } = await import("../../src/actions/removeCity");
    await removeCity(config);

    expect(config.cities).toHaveLength(1);
    expect(config.cities[0]!.name).toBe("Lima");

    const raw = await readFile(CONFIG_PATH, "utf-8");
    const saved = JSON.parse(raw);
    expect(saved.cities).toHaveLength(1);
    expect(saved.cities[0].name).toBe("Lima");

    const lastCall = consoleSpy.mock.calls.at(-1)?.[0] as string;
    expect(lastCall).toContain("eliminada");
    consoleSpy.mockRestore();
  });

  it("limpia la default cuando se elimina la ciudad default", async () => {
    await writeTestConfig({ cities: [madrid], defaultCity: { ...madrid }, unit: "celsius" });
    mock.module("../../src/presentation/input", () => ({
      ask: mock(() => Promise.resolve("1")),
      InputClosed: class InputClosed extends Error {},
    }));

    const consoleSpy = spyOn(console, "log").mockImplementation(() => {});
    const config: Config = { cities: [madrid], defaultCity: { ...madrid }, unit: "celsius" };

    const { removeCity } = await import("../../src/actions/removeCity");
    await removeCity(config);

    expect(config.cities).toHaveLength(0);
    expect(config.defaultCity).toBeNull();
    const msgs = consoleSpy.mock.calls.map((c) => c[0] as string);
    expect(msgs.some((m) => m.includes("ciudad default fue eliminada"))).toBe(true);
    consoleSpy.mockRestore();
  });

  it("muestra error con opción inválida", async () => {
    await writeTestConfig({ cities: [madrid], defaultCity: null, unit: "celsius" });
    mock.module("../../src/presentation/input", () => ({
      ask: mock(() => Promise.resolve("99")),
      InputClosed: class InputClosed extends Error {},
    }));

    const consoleSpy = spyOn(console, "log").mockImplementation(() => {});
    const config: Config = { cities: [madrid], defaultCity: null, unit: "celsius" };

    const { removeCity } = await import("../../src/actions/removeCity");
    await removeCity(config);

    expect(config.cities).toHaveLength(1);
    const lastCall = consoleSpy.mock.calls.at(-1)?.[0] as string;
    expect(lastCall).toMatch(/opci[oó]n inv[aá]lida/i);
    consoleSpy.mockRestore();
  });
});
