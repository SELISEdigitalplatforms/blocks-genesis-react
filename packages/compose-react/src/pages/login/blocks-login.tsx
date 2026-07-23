import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/core/badge";
import { Button } from "@/components/core/button";
import { LoginHeader } from "@/components/common/login-header/login-header";
import { blocksLoginStyles } from "./login.styles";
import { DEFAULT_BLOCKS_PRODUCTS } from "./login.constant";
import type {
  BlocksLoginPageProps,
  BlocksProduct,
  LoginCarouselItem,
  LoginCarouselStack,
} from "./login.types";

/** Split "blocks IAM" -> ["blocks", "IAM"] so the hero can render two lines. */
function splitAppName(appName: string): [string, string] {
  const idx = appName.indexOf(" ");
  if (idx === -1) return [appName, ""];
  return [appName.slice(0, idx), appName.slice(idx + 1)];
}

// Type guard to distinguish between BlocksProduct and LoginCarouselItem
const isBlocksProduct = (
  item: BlocksProduct | LoginCarouselItem,
): item is BlocksProduct => {
  return "appName" in item;
};

export const BlocksLoginPage = ({
  name,
  onLogin,
  isLoading = false,
  eyebrow = "Blocks · Core Services",
  loginLabel = "Log in to your account",
  docsUrl = "https://docs.seliseblocks.com/",
  footerLink = { label: "Visit Blocks", url: "https://seliseblocks.com" },
  carouselItems,
}: BlocksLoginPageProps) => {
  const active = useMemo(() => {
    // Filter to BlocksProduct entries only, fall back to the built-in list.
    // This replaces the unsafe `as BlocksProduct[]` cast.
    const products =
      carouselItems?.filter(isBlocksProduct) ?? DEFAULT_BLOCKS_PRODUCTS;
    return products.find((p) => p.name === name) ?? products[0];
  }, [name, carouselItems]);

  const otherProducts = useMemo(
    () => DEFAULT_BLOCKS_PRODUCTS.filter((p) => p.name !== active?.name),
    [active?.name],
  );
  const carouselSource = carouselItems ?? otherProducts;
  const [titleHead, titleTail] = splitAppName(active?.appName ?? "");
  const heroSubtitle = active?.tagline;
  const features = active?.featureChips;
  const derivedKeywordPrefix = active?.descriptionTitle;
  const derivedKeywords = active?.keywords;

  const [keywordIdx, setKeywordIdx] = useState(0);
  const [keywordVisible, setKeywordVisible] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const resolvedKeywords = useMemo(
    () => derivedKeywords ?? [],
    [derivedKeywords],
  );

  useEffect(() => {
    const id = setInterval(() => {
      setKeywordVisible(false);
      setTimeout(() => {
        setKeywordIdx((p) => (p + 1) % resolvedKeywords.length);
        setKeywordVisible(true);
      }, 280);
    }, 2800);
    return () => clearInterval(id);
  }, [resolvedKeywords.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    let t = 0;
    let dpr = window.devicePixelRatio || 1;
    let w = 0;
    let h = 0;

    const resize = () => {
      dpr = window.devicePixelRatio || 1;
      w = canvas.width = Math.floor(window.innerWidth * dpr);
      h = canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const hslToRgb = (hue: number, s: number, l: number) => {
      s /= 100;
      l /= 100;
      const k = (n: number) => (n + hue / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      const f = (n: number) =>
        l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
      return [
        Math.round(f(0) * 255),
        Math.round(f(8) * 255),
        Math.round(f(4) * 255),
      ];
    };

    const draw = () => {
      const time = t * 0.008;
      const baseHue = 185 + 15 * Math.sin(time);
      const c1 = hslToRgb(baseHue, 100, 50);
      const c2 = hslToRgb(baseHue + 15, 100, 50);
      const c3 = hslToRgb(baseHue - 15, 100, 50);
      const cx = (w / dpr) * 0.5;
      const cy = (h / dpr) * 0.5;
      ctx.clearRect(0, 0, w / dpr, h / dpr);

      const r1 = (Math.max(w, h) / dpr) * 0.6;
      const g1 = ctx.createRadialGradient(
        cx * 0.6,
        cy * 0.7,
        0,
        cx * 0.6,
        cy * 0.7,
        r1,
      );
      g1.addColorStop(0, `rgba(${c1[0]},${c1[1]},${c1[2]},0.18)`);
      g1.addColorStop(1, `rgba(${c1[0]},${c1[1]},${c1[2]},0)`);
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, w / dpr, h / dpr);

      const r2 = (Math.max(w, h) / dpr) * 0.5;
      const g2 = ctx.createRadialGradient(
        cx * 1.3,
        cy * 0.4,
        0,
        cx * 1.3,
        cy * 0.4,
        r2,
      );
      g2.addColorStop(0, `rgba(${c2[0]},${c2[1]},${c2[2]},0.12)`);
      g2.addColorStop(1, `rgba(${c2[0]},${c2[1]},${c2[2]},0)`);
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, w / dpr, h / dpr);

      const r3 = (Math.max(w, h) / dpr) * 0.45;
      const g3 = ctx.createRadialGradient(
        cx * 0.3,
        cy * 1.2,
        0,
        cx * 0.3,
        cy * 1.2,
        r3,
      );
      g3.addColorStop(0, `rgba(${c3[0]},${c3[1]},${c3[2]},0.10)`);
      g3.addColorStop(1, `rgba(${c3[0]},${c3[1]},${c3[2]},0)`);
      ctx.fillStyle = g3;
      ctx.fillRect(0, 0, w / dpr, h / dpr);

      t++;
      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Duplicate for seamless infinite scroll
  const carouselCards = [...carouselSource, ...carouselSource];

  return (
    <div className="blocksLogin-page">
      <style>{blocksLoginStyles}</style>

      <div className="grid-bg" />
      <div className="scan-line" />
      <div className="radial-glow" />
      <div className="secondary-glow" />
      <div className="vignette" />
      <div className="noise-overlay" />
      <canvas className="atmospheric-canvas" ref={canvasRef} />

      <div className="corner corner-tl" />
      <div className="corner corner-tr" />
      <div className="corner corner-bl" />
      <div className="corner corner-br" />
      <div className="corner-dot corner-dot-tl" />
      <div className="corner-dot corner-dot-tr" />
      <div className="corner-dot corner-dot-bl" />
      <div className="corner-dot corner-dot-br" />

      <div
        className="particle"
        style={{
          left: "6%",
          animationDuration: "16s",
          animationDelay: "0s",
          width: 2,
          height: 2,
        }}
      />
      <div
        className="particle"
        style={{
          left: "18%",
          animationDuration: "20s",
          animationDelay: "3s",
          width: 1.5,
          height: 1.5,
        }}
      />
      <div
        className="particle large"
        style={{
          left: "35%",
          animationDuration: "14s",
          animationDelay: "1.5s",
          width: 3,
          height: 3,
        }}
      />
      <div
        className="particle"
        style={{
          left: "52%",
          animationDuration: "18s",
          animationDelay: "5s",
          width: 2,
          height: 2,
        }}
      />
      <div
        className="particle"
        style={{
          left: "68%",
          animationDuration: "22s",
          animationDelay: "2s",
          width: 1,
          height: 1,
        }}
      />
      <div
        className="particle large"
        style={{
          left: "82%",
          animationDuration: "15s",
          animationDelay: "4s",
          width: 2.5,
          height: 2.5,
        }}
      />
      <div
        className="particle"
        style={{
          left: "92%",
          animationDuration: "19s",
          animationDelay: "6s",
          width: 1.5,
          height: 1.5,
        }}
      />

      <LoginHeader />

      <main className="main">
        <div className="col-left">
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="title-main">
            {titleHead}
            {titleTail && (
              <>
                <br />
                {titleTail}
              </>
            )}
          </h1>
          <p className="title-sub">{heroSubtitle}</p>
          <p className="keywords">
            {derivedKeywordPrefix}{" "}
            <span
              className="keyword-anim"
              style={{ opacity: keywordVisible ? 1 : 0 }}
            >
              {resolvedKeywords[keywordIdx]}
            </span>
          </p>
          <p className="desc">{active?.description}</p>

          {features && features?.length > 0 && (
            <div className="features">
              {features.map((f) => (
                <Badge key={f} variant="outline" className="feature-pill">
                  {f}
                </Badge>
              ))}
            </div>
          )}

          <div className="cta-row">
            <div className="button-container">
              <div className="button-ring" />
              <div className="button-ring" />
              <Button
                className="launch-btn blocks-gradient"
                disabled={isLoading}
                onClick={onLogin}
              >
                {isLoading ? "Redirecting…" : loginLabel}
              </Button>
            </div>
            <a
              href={docsUrl}
              target="_blank"
              rel="noreferrer"
              className="cta-docs"
            >
              View documentation
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        <div className="col-right">
          <div className="sdk-header-row">
            <p className="sdk-header-label">Core Services — Blocks Platform</p>
            <Badge variant="outline" className="sdk-count-badge">
              {carouselSource.length} services
            </Badge>
          </div>

          <div className="carousel-track">
            <div className="carousel-inner">
              {carouselCards.map((item, i) => {
                const isBlocksProductItem = isBlocksProduct(item);
                const cardKey = isBlocksProductItem
                  ? `${item.name}-${i}`
                  : `${item.title}-${i}`;
                const displayName = isBlocksProductItem
                  ? item.appName
                  : item.title.replace(/^Blocks\s+/, "");
                const description = isBlocksProductItem
                  ? item.shortDescription
                  : item.description;
                const badge = item.badge;
                const stacks = isBlocksProductItem ? undefined : item.stacks;
                const features = isBlocksProductItem
                  ? item.featureChips
                  : item.features;
                const url = item.url;
                const cta = item.cta;

                return (
                  <div className="sdk-card" key={cardKey}>
                    <div className="sdk-card-top">
                      <span className="sdk-name">{displayName}</span>
                      <Badge variant="outline" className="sdk-badge">
                        {badge}
                      </Badge>
                    </div>
                    <div className="sdk-card-body">
                      <p className="sdk-desc">{description}</p>
                      {stacks ? (
                        <div className="sdk-links">
                          {stacks
                            .filter((st: LoginCarouselStack) => st.available)
                            .map((st: LoginCarouselStack) => (
                              <a
                                key={st.name}
                                href={st.links[0]?.to ?? "#"}
                                target="_blank"
                                rel="noreferrer"
                                className="sdk-link"
                              >
                                {st.name}
                              </a>
                            ))}
                          {stacks
                            .filter((st: LoginCarouselStack) => !st.available)
                            .map((st: LoginCarouselStack) => (
                              <Badge
                                key={st.name}
                                variant="outline"
                                className="sdk-link dim"
                              >
                                {st.name}
                              </Badge>
                            ))}
                        </div>
                      ) : (
                        <div className="sdk-links">
                          {features.slice(0, 4).map((chip: string) => (
                            <Badge
                              key={chip}
                              variant="outline"
                              className="sdk-link dim"
                            >
                              {chip}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    {url ? (
                      <div className="sdk-card-footer">
                        <a
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="sdk-cta"
                        >
                          {cta}
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                          >
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </a>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="sdk-footer">
            <a
              href={footerLink.url}
              target="_blank"
              rel="noreferrer"
              className="visit-construct"
            >
              {footerLink.label}
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </a>
            <span className="sdk-open-source">Open source</span>
          </div>
        </div>
      </main>
    </div>
  );
};
