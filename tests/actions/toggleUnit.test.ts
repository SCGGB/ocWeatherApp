import { describe, it, expect, mock, spyOn, afterEach } from "bun:test";
import { writeFile, unlink } from "node:fs/promises";
import { CONFIG_PATH } from "../../src/utils/constants";
import type { Config } from "../../src/types/City";

afterEach(async () => {
  try { await unlink(CONFIG_PATH); } catch {}
});

const madrid = { name: "Madrid", country: "España", latitude: 40.4165, longitude: -3.70256 };

describe("toggleUnit", () => {
  it("cambia de celsius a fahrenheit", async () => {
    const consoleSpy = spyOn(console, "log").mockImplementation(() => {});
    const config: Config = { cities: [], defaultCity: null, unit: "celsius" };

    const { toggleUnit } = await import("../../src/actions/toggleUnit");
    await toggleUnit(config);

    expect(config.unit).toBe("fahrenheit");
    consoleSpy.mockRestore();
  });

  it("cambia de fahrenheit a celsius", async () => {
    const consoleSpy = spyOn(console, "log").mockImplementation(() => {});
    const config: Config = { cities: [], defaultCity: null, unit: "fahrenheit" };

    const { toggleUnit } = await import("../../src/actions/toggleUnit");
    await toggleUnit(config);

    expect(config.unit).toBe("celsius");
    consoleSpy.mockRestore();
  });

  it("muestra mensaje de confirmación", async () => {
    const consoleSpy = spyOn(console, "log").mockImplementation(() => {});
    const config: Config = { cities: [], defaultCity: null, unit: "celsius" };

    const { toggleUnit } = await import("../../src/actions/toggleUnit");
    await toggleUnit(config);

    expect(consoleSpy).toHaveBeenCalled();
    const msg = consoleSpy.mock.calls[0]![0] as string;
    expect(msg).toContain("°F");
    consoleSpy.mockRestore();
  });
});
