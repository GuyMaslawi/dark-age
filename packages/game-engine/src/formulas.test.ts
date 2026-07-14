import { describe, it, expect } from "vitest";
import { maxHpFor, maxEnergyFor, STARTING_STATS } from "./formulas";

describe("maxHpFor", () => {
  it("computes starting hp for a fresh character", () => {
    expect(maxHpFor(STARTING_STATS.endurance, 1)).toBe(60 + 5 * 8 + 1 * 6);
  });

  it("rises with endurance", () => {
    expect(maxHpFor(10, 1)).toBeGreaterThan(maxHpFor(5, 1));
  });

  it("rises with level", () => {
    expect(maxHpFor(5, 10)).toBeGreaterThan(maxHpFor(5, 1));
  });
});

describe("maxEnergyFor", () => {
  it("is 100 at level 1", () => {
    expect(maxEnergyFor(1)).toBe(100);
  });

  it("rises with level", () => {
    expect(maxEnergyFor(5)).toBeGreaterThan(maxEnergyFor(1));
  });
});
