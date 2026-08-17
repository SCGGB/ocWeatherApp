import { describe, it, expect, beforeEach } from "bun:test";

beforeEach(() => {
  process.env.FORCE_COLOR = "0";
});

describe("USE_COLOR", () => {
  it("es un booleano", async () => {
    delete process.env.FORCE_COLOR;
    const { USE_COLOR } = await import("../../src/utils/colors");
    expect(typeof USE_COLOR).toBe("boolean");
  });

  it("es false en entorno de test (no TTY)", async () => {
    const { getUseColor } = await import("../../src/utils/colors");
    expect(getUseColor()).toBe(false);
  });
});

describe("funciones de color", () => {
  it("cyan devuelve texto sin modificar cuando no hay color", async () => {
    const { cyan } = await import("../../src/utils/colors");
    expect(cyan("hola")).toBe("hola");
  });

  it("verde devuelve texto sin modificar cuando no hay color", async () => {
    const { verde } = await import("../../src/utils/colors");
    expect(verde("ok")).toBe("ok");
  });

  it("rojo devuelve texto sin modificar cuando no hay color", async () => {
    const { rojo } = await import("../../src/utils/colors");
    expect(rojo("error")).toBe("error");
  });

  it("amarillo devuelve texto sin modificar cuando no hay color", async () => {
    const { amarillo } = await import("../../src/utils/colors");
    expect(amarillo("temp")).toBe("temp");
  });
});
