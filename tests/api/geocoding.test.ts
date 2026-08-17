import { describe, it, expect, mock, afterEach } from "bun:test";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("searchCity", () => {
  it("devuelve una ciudad cuando se encuentra", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            results: [
              {
                name: "Madrid",
                country: "España",
                admin1: "Comunidad de Madrid",
                latitude: 40.4165,
                longitude: -3.70256,
              },
            ],
          }),
          { status: 200 }
        )
      )
    ) as unknown as typeof fetch;

    const { searchCity } = await import("../../src/api/geocoding");
    const city = await searchCity("Madrid");
    expect(city).not.toBeNull();
    expect(city!.name).toBe("Madrid");
    expect(city!.country).toBe("España");
    expect(city!.latitude).toBe(40.4165);
  });

  it("devuelve null cuando no se encuentra la ciudad", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(JSON.stringify({}), { status: 200 }))
    ) as unknown as typeof fetch;

    const { searchCity } = await import("../../src/api/geocoding");
    const city = await searchCity("CiudadInexistenteXYZ");
    expect(city).toBeNull();
  });

  it("lanza error cuando fetch falla", async () => {
    globalThis.fetch = mock(() =>
      Promise.resolve(new Response(null, { status: 500 }))
    ) as unknown as typeof fetch;

    const { searchCity } = await import("../../src/api/geocoding");
    await expect(searchCity("Madrid")).rejects.toThrow(
      /geocodificaci/i
    );
  });

  it("lanza error cuando el fetch de red falla", async () => {
    globalThis.fetch = mock(() => Promise.reject(new Error("Network error"))) as unknown as typeof fetch;

    const { searchCity } = await import("../../src/api/geocoding");
    await expect(searchCity("Madrid")).rejects.toThrow("Network error");
  });
});
