import { describe, it, expect, mock, spyOn, afterEach } from "bun:test";
import { writeFile, unlink } from "node:fs/promises";
import { CONFIG_PATH } from "../../src/utils/constants";
import type { Config } from "../../src/types/City";

const originalFetch = globalThis.fetch;

afterEach(async () => {
  globalThis.fetch = originalFetch;
  try { await unlink(CONFIG_PATH); } catch {}
});

async function writeTestConfig(config: Config) {
  await writeFile(CONFIG_PATH, JSON.stringify(config));
}

const barcelona = {
  name: "Barcelona",
  country: "España",
  admin1: "Cataluña",
  latitude: 41.3851,
  longitude: 2.1734,
};

describe("addCity", () => {
  it("agrega una ciudad cuando se encuentra y se confirma", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({ results: [barcelona] }), { status: 200 })
      )
    ) as unknown as typeof fetch;
    await writeTestConfig({ cities: [], defaultCity: null, unit: "celsius" });

    let callCount = 0;
    mock.module("../../src/presentation/input", () => ({
      ask: mock((prompt: string) => {
        callCount++;
        if (callCount === 1) return Promise.resolve("Barcelona");
        if (callCount === 2) return Promise.resolve("s");
        return Promise.resolve("");
      }),
      InputClosed: class InputClosed extends Error {},
    }));

    const consoleSpy = spyOn(console, "log").mockImplementation(() => {});
    const config: Config = { cities: [], defaultCity: null, unit: "celsius" };

    const { addCity } = await import("../../src/actions/addCity");
    await addCity(config);

    expect(config.cities).toHaveLength(1);
    expect(config.cities[0]!.name).toBe("Barcelona");
    consoleSpy.mockRestore();
  });

  it("cancela cuando el usuario responde no", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({ results: [barcelona] }), { status: 200 })
      )
    ) as unknown as typeof fetch;
    await writeTestConfig({ cities: [], defaultCity: null, unit: "celsius" });

    let callCount = 0;
    mock.module("../../src/presentation/input", () => ({
      ask: mock((prompt: string) => {
        callCount++;
        if (callCount === 1) return Promise.resolve("Barcelona");
        if (callCount === 2) return Promise.resolve("n");
        return Promise.resolve("");
      }),
      InputClosed: class InputClosed extends Error {},
    }));

    const consoleSpy = spyOn(console, "log").mockImplementation(() => {});
    const config: Config = { cities: [], defaultCity: null, unit: "celsius" };

    const { addCity } = await import("../../src/actions/addCity");
    await addCity(config);

    expect(config.cities).toHaveLength(0);
    const lastCall = consoleSpy.mock.calls.at(-1)?.[0] as string;
    expect(lastCall).toContain("Cancelado");
    consoleSpy.mockRestore();
  });

  it("muestra error cuando no se encuentra la ciudad", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify({}), { status: 200 }))
    ) as unknown as typeof fetch;
    await writeTestConfig({ cities: [], defaultCity: null, unit: "celsius" });

    mock.module("../../src/presentation/input", () => ({
      ask: mock(() => Promise.resolve("CiudadFakeXYZ")),
      InputClosed: class InputClosed extends Error {},
    }));

    const consoleSpy = spyOn(console, "log").mockImplementation(() => {});
    const config: Config = { cities: [], defaultCity: null, unit: "celsius" };

    const { addCity } = await import("../../src/actions/addCity");
    await addCity(config);

    expect(config.cities).toHaveLength(0);
    const msg = consoleSpy.mock.calls[0]![0] as string;
    expect(msg).toMatch(/no se encontr/i);
    consoleSpy.mockRestore();
  });
});
