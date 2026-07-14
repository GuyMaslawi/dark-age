import { describe, it, expect } from "vitest";
import { withinPvpRange, pvpLevelBounds } from "./formulas";

describe("withinPvpRange", () => {
  it("accepts opponents inside the ±20% band", () => {
    expect(withinPvpRange(20, 20)).toBe(true);
    expect(withinPvpRange(20, 16)).toBe(true);
    expect(withinPvpRange(20, 24)).toBe(true);
  });

  it("rejects opponents outside the band", () => {
    expect(withinPvpRange(20, 15)).toBe(false);
    expect(withinPvpRange(20, 25)).toBe(false);
  });

  it("exposes the computed bounds", () => {
    expect(pvpLevelBounds(20)).toEqual({ low: 16, high: 24 });
  });
});
