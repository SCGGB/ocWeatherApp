import { describe, it, expect } from "bun:test";
import { unitSymbol, cityLabel, formatTemp } from "../../src/utils/format";
import type { City, Config } from "../../src/types/City";

describe("unitSymbol", () => {
  it("devuelve °C para celsius", () => {
    expect(unitSymbol("celsius")).toBe("°C");
  });

  it("devuelve °F para fahrenheit", () => {
    expect(unitSymbol("fahrenheit")).toBe("°F");
  });
});

describe("cityLabel", () => {
  it("muestra ciudad y país cuando hay país", () => {
    const city: City = { name: "Madrid", country: "España", latitude: 0, longitude: 0 };
    expect(cityLabel(city)).toBe("Madrid, España");
  });

  it("muestra solo el nombre cuando no hay país", () => {
    const city: City = { name: "Madrid", latitude: 0, longitude: 0 };
    expect(cityLabel(city)).toBe("Madrid");
  });
});

describe("formatTemp", () => {
  it("redondea a un decimal", () => {
    expect(formatTemp(23.456, "celsius")).toBe("23.5 °C");
  });

  it("redondea entero correctamente", () => {
    expect(formatTemp(23.0, "fahrenheit")).toBe("23 °F");
  });

  it("maneja temperaturas negativas", () => {
    expect(formatTemp(-5.67, "celsius")).toBe("-5.7 °C");
  });

  it("maneja cero", () => {
    expect(formatTemp(0, "fahrenheit")).toBe("0 °F");
  });
});
