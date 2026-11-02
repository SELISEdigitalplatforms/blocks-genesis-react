import { useMemo } from "react";
import { useT } from "@/i18n";
import { getDefaultBlocksProducts } from "./login.constant";
import type {
  BlocksProduct,
  LoginCarouselItem,
  LoginCarouselStack,
} from "./login.types";

/** Split "blocks IAM" -> ["blocks", "IAM"] so the hero can render two lines. */
export function splitAppName(appName: string): [string, string] {
  const idx = appName.indexOf(" ");
  if (idx === -1) return [appName, ""];
  return [appName.slice(0, idx), appName.slice(idx + 1)];
}

/** Type guard to distinguish between BlocksProduct and LoginCarouselItem. */
export const isBlocksProduct = (
  item: BlocksProduct | LoginCarouselItem,
): item is BlocksProduct => {
  return "appName" in item;
};

export interface UseLoginCarouselParams {
  name: string;
  carouselItems?: (BlocksProduct | LoginCarouselItem)[];
}

export interface UseLoginCarouselResult {
  active: BlocksProduct | undefined;
  otherProducts: BlocksProduct[];
  carouselSource: (BlocksProduct | LoginCarouselItem)[];
  carouselCards: (BlocksProduct | LoginCarouselItem)[];
  titleHead: string;
  titleTail: string;
  heroSubtitle: string | undefined;
  features: string[] | undefined;
}

export function useLoginCarousel({
  name,
  carouselItems,
}: UseLoginCarouselParams): UseLoginCarouselResult {
  const { t } = useT("genesis.login");
  const defaultProducts = useMemo(() => getDefaultBlocksProducts(t), [t]);
  const active = useMemo(() => {
    const products = carouselItems?.filter(isBlocksProduct) ?? defaultProducts;
    return products.find((p) => p.name === name) ?? products[0];
  }, [name, carouselItems, defaultProducts]);

  const otherProducts = useMemo(
    () => defaultProducts.filter((p) => p.name !== active?.name),
    [defaultProducts, active?.name],
  );

  const carouselSource = carouselItems ?? otherProducts;
  const [titleHead, titleTail] = splitAppName(active?.appName ?? "");
  const heroSubtitle = active?.tagline;
  const features = active?.featureChips;

  const carouselCards = useMemo(
    () => [...carouselSource, ...carouselSource],
    [carouselSource],
  );

  return {
    active,
    otherProducts,
    carouselSource,
    carouselCards,
    titleHead,
    titleTail,
    heroSubtitle,
    features,
  };
}

export type { BlocksProduct, LoginCarouselItem, LoginCarouselStack };
