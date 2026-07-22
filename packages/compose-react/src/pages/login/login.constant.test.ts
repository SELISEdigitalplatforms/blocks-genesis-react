import { describe, it, expect } from "vitest";
import {
  BLOCKS_PRODUCTS,
  DEFAULT_BLOCKS_PRODUCTS,
} from "@/pages/login/login.constant";

describe("login product catalogue", () => {
  it("exposes a non-empty product list", () => {
    expect(Array.isArray(BLOCKS_PRODUCTS)).toBe(true);
    expect(BLOCKS_PRODUCTS.length).toBeGreaterThan(0);
  });

  it("gives every product the required display fields", () => {
    for (const product of BLOCKS_PRODUCTS) {
      expect(product.name).toBeTruthy();
      expect(product.appName).toBeTruthy();
      expect(product.cta).toBeTruthy();
      expect(Array.isArray(product.featureChips)).toBe(true);
    }
  });

  it("exposes a non-empty default product list", () => {
    expect(DEFAULT_BLOCKS_PRODUCTS.length).toBeGreaterThan(0);
  });
});
