import { describe, it, expect } from "vitest";
import { marketFee, marketNetProceeds, MARKET_FEE_RATE } from "./formulas";

describe("market fees", () => {
  it("takes a 5% fee", () => {
    expect(MARKET_FEE_RATE).toBe(0.05);
    expect(marketFee(1000)).toBe(50);
    expect(marketNetProceeds(1000)).toBe(950);
  });

  it("floors the fee and never returns negative proceeds", () => {
    expect(marketFee(19)).toBe(0);
    expect(marketNetProceeds(19)).toBe(19);
    expect(marketNetProceeds(0)).toBe(0);
  });
});
