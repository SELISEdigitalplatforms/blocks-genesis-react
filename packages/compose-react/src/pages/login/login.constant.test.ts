import { describe, it, expect } from "vitest";
import {
  getBlocksProducts,
  getDefaultBlocksProducts,
} from "@/pages/login/login.constant";
import { tStatic } from "@/i18n";

const t = (key: string, values?: Record<string, string | number>) =>
  tStatic("genesis.login", key, values);
const BLOCKS_PRODUCTS = getBlocksProducts(t);
const DEFAULT_BLOCKS_PRODUCTS = getDefaultBlocksProducts(t);

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
