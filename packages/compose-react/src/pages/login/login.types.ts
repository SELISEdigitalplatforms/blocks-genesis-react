export interface BlocksProduct {
  name: string;
  appName: string;
  badge: string;
  tagline: string;
  descriptionTitle: string;
  keywords: string[];
  shortDescription: string;
  description: string;
  featureChips: string[];
  url: string;
  cta: string;
}

export interface LoginCarouselStack {
  name: string;
  available: boolean;
  links: { label: string; to: string }[];
}

export interface LoginCarouselItem {
  badge: string;
  title: string;
  description: string;
  features: string[];
  url: string;
  cta: string;
  stacks?: LoginCarouselStack[];
}

export interface BlocksLoginPageProps {
  name: string;
  onLogin: () => void | Promise<void>;
  isLoading?: boolean;
  eyebrow?: string;
  keywords?: string[];
  keywordPrefix?: string;
  loginLabel?: string;
  docsUrl?: string;
  footerLink?: { label: string; url: string };
  /** IAM signup page URL. Omitted when the tenant has signup switched off. */
  signUpUrl?: string;
  // Was LoginCarouselItem[] — widened to accept either shape
  carouselItems?: (LoginCarouselItem | BlocksProduct)[];
}
