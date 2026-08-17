import { describe, it, expect, mock, spyOn, afterEach } from "bun:test";
import { writeFile, unlink } from "node:fs/promises";
import { CONFIG_PATH } from "../../src/utils/constants";
import type { Config } from "../../src/types/City";

const originalFetch = globalThis.fetch;

afterEach(async () => {
  globalThis.fetch = originalFetch;
  try { await unlink(CONFIG_PATH); } catch {}
});

const madrid = { name: "Madrid", country: "España", latitude: 40.4165, longitude: -3.70256 };
const lima = { name: "Lima", country: "Perú", latitude: -12.0464, longitude: -77.0428 };

async function writeTestConfig(config: Config) {
  await writeFile(CONFIG_PATH, JSON.stringify(config));
}

describe("weatherDefault", () => {
  it("muestra error cuando no hay ciudad default", async () => {
    await writeTestConfig({ cities: [], defaultCity: null, unit: "celsius" });
    const consoleSpy = spyOn(console, "log").mockImplementation(() => {});
    const config: Config = { cities: [], defaultCity: null, unit: "celsius" };

    const { weatherDefault } = await import("../../src/actions/getWeather");
    await weatherDefault(config);

    expect(consoleSpy).toHaveBeenCalled();
    const msg = consoleSpy.mock.calls[0]![0] as string;
    expect(msg).toContain("No hay ciudad default configurada");
    consoleSpy.mockRestore();
  });

  it("muestra el clima de la ciudad default", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({ current: { temperature_2m: 22.5 } }), { status: 200 })
      )
    ) as unknown as typeof fetch;
    await writeTestConfig({ cities: [], defaultCity: madrid, unit: "celsius" });

    const consoleSpy = spyOn(console, "log").mockImplementation(() => {});
    const config: Config = { cities: [], defaultCity: madrid, unit: "celsius" };

    const { weatherDefault } = await import("../../src/actions/getWeather");
    await weatherDefault(config);

    expect(consoleSpy).toHaveBeenCalled();
    const lastCall = consoleSpy.mock.calls.at(-1)?.[0] as string;
    expect(lastCall).toContain("Madrid");
    consoleSpy.mockRestore();
  });
});

describe("weatherAll", () => {
  it("muestra error cuando no hay ciudades guardadas", async () => {
    await writeTestConfig({ cities: [], defaultCity: null, unit: "celsius" });
    const consoleSpy = spyOn(console, "log").mockImplementation(() => {});
    const config: Config = { cities: [], defaultCity: null, unit: "celsius" };

    const { weatherAll } = await import("../../src/actions/getWeather");
    await weatherAll(config);

    expect(consoleSpy).toHaveBeenCalled();
    const msg = consoleSpy.mock.calls[0]![0] as string;
    expect(msg).toContain("No hay ciudades guardadas");
    consoleSpy.mockRestore();
  });

  it("muestra el clima de todas las ciudades", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({ current: { temperature_2m: 20 } }), { status: 200 })
      )
    ) as unknown as typeof fetch;
    await writeTestConfig({ cities: [madrid, lima], defaultCity: null, unit: "celsius" });

    const consoleSpy = spyOn(console, "log").mockImplementation(() => {});
    const config: Config = { cities: [madrid, lima], defaultCity: null, unit: "celsius" };

    const { weatherAll } = await import("../../src/actions/getWeather");
    await weatherAll(config);

    expect(consoleSpy).toHaveBeenCalledTimes(2);
    consoleSpy.mockRestore();
  });
});
