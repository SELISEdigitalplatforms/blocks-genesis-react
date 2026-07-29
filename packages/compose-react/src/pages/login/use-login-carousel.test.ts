import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useLoginCarousel } from "./use-login-carousel";
import type { BlocksProduct, LoginCarouselItem } from "./login.types";

describe("useLoginCarousel", () => {
  it("selects the active product by name from the provided carousel", () => {
    const items: BlocksProduct[] = [
      {
        name: "blocks-iam",
        appName: "blocks IAM",
        badge: "Identity",
        tagline: "tag",
        descriptionTitle: "title",
        keywords: ["k"],
        shortDescription: "s",
        description: "d",
        featureChips: ["f"],
        url: "",
        cta: "go",
      },
    ];

    const { result } = renderHook(() =>
      useLoginCarousel({ name: "blocks-iam", carouselItems: items }),
    );

    expect(result.current.active?.name).toBe("blocks-iam");
    expect(result.current.titleHead).toBe("blocks");
    expect(result.current.titleTail).toBe("IAM");
    expect(result.current.heroSubtitle).toBe("tag");
    expect(result.current.features).toEqual(["f"]);
  });

  it("falls back to the first product when the name is unknown", () => {
    const items: BlocksProduct[] = [
      {
        name: "blocks-iam",
        appName: "blocks IAM",
        badge: "Identity",
        tagline: "tag",
        descriptionTitle: "title",
        keywords: ["k"],
        shortDescription: "s",
        description: "d",
        featureChips: ["f"],
        url: "",
        cta: "go",
      },
    ];

    const { result } = renderHook(() =>
      useLoginCarousel({ name: "unknown", carouselItems: items }),
    );

    expect(result.current.active?.name).toBe("blocks-iam");
  });

  it("falls back to the default products when no carousel is provided", () => {
    const { result } = renderHook(() =>
      useLoginCarousel({ name: "blocks-os" }),
    );

    expect(result.current.active?.name).toBe("blocks-os");
  });

  it("falls back to undefined when no BlocksProduct entries are present", () => {
    const items: (BlocksProduct | LoginCarouselItem)[] = [
      {
        title: "Generic",
        badge: "b",
        description: "d",
        features: ["a"],
        url: "",
        cta: "go",
      },
    ];

    const { result } = renderHook(() =>
      useLoginCarousel({ name: "anything", carouselItems: items }),
    );

    // No BlocksProduct entries — active product lookup misses and falls
    // back to products[0] on an empty array.
    expect(result.current.active).toBeUndefined();
    expect(result.current.carouselSource).toEqual(items);
  });

  it("duplicates carousel entries for seamless infinite scroll", () => {
    const items: LoginCarouselItem[] = [
      {
        title: "t",
        badge: "b",
        description: "d",
        features: ["a"],
        url: "",
        cta: "go",
      },
    ];

    const { result } = renderHook(() =>
      useLoginCarousel({ name: "anything", carouselItems: items }),
    );

    expect(result.current.carouselCards).toHaveLength(items.length * 2);
    expect(result.current.carouselCards[0]).toBe(items[0]);
  });
});
