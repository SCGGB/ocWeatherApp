export type City = {
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
};

export type Config = {
  cities: City[];
  defaultCity: City | null;
  unit: "celsius" | "fahrenheit";
};
