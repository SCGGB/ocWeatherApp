import { describe, it, expect, mock, afterEach } from "bun:test";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const madrid = {
  name: "Madrid",
  country: "España",
  latitude: 40.4165,
  longitude: -3.70256,
};

describe("getTemperature", () => {
  it("devuelve temperatura en celsius", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({ current: { temperature_2m: 25.3 } }),
          { status: 200 }
        )
      )
    ) as unknown as typeof fetch;

    const { getTemperature } = await import("../../src/api/weather");
    const temp = await getTemperature(madrid, "celsius");
    expect(temp).toBe(25.3);

    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof mock>;
    const calledUrl = fetchMock.mock.calls[0]![0] as string;
    expect(calledUrl).not.toContain("temperature_unit=fahrenheit");
  });

  it("devuelve temperatura en fahrenheit", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({ current: { temperature_2m: 77.5 } }),
          { status: 200 }
        )
      )
    ) as unknown as typeof fetch;

    const { getTemperature } = await import("../../src/api/weather");
    const temp = await getTemperature(madrid, "fahrenheit");
    expect(temp).toBe(77.5);

    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof mock>;
    const calledUrl = fetchMock.mock.calls[0]![0] as string;
    expect(calledUrl).toContain("temperature_unit=fahrenheit");
  });

  it("lanza error cuando fetch falla", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(null, { status: 500 }))
    ) as unknown as typeof fetch;

    const { getTemperature } = await import("../../src/api/weather");
    await expect(getTemperature(madrid, "celsius")).rejects.toThrow(
      /Error al consultar el clima/
    );
  });

  it("lanza error cuando no se recibe temperatura", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(JSON.stringify({ current: {} }), { status: 200 })
      )
    ) as unknown as typeof fetch;

    const { getTemperature } = await import("../../src/api/weather");
    await expect(getTemperature(madrid, "celsius")).rejects.toThrow(
      /temperatura/i
    );
  });
});
