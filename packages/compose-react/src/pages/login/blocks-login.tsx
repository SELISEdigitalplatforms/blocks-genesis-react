import { LoginHeader } from "@/components/common/login-header/login-header";
import { Badge } from "@/components/core/badge";
import { Button } from "@/components/core/button";
import { useRef } from "react";
import { blocksLoginStyles } from "./login.styles";
import type { BlocksLoginPageProps, LoginCarouselStack } from "./login.types";
import { useAtmosphericCanvas } from "./use-atmospheric-canvas";
import { isBlocksProduct, useLoginCarousel } from "./use-login-carousel";

export const BlocksLoginPage = ({
  name,
  onLogin,
  isLoading = false,
  eyebrow = "Blocks · Core Services",
  loginLabel = "Log in to your account",
  docsUrl = "https://docs.seliseblocks.com/",
  footerLink = { label: "Visit Blocks", url: "https://seliseblocks.com" },
  signUpUrl,
  carouselItems,
}: BlocksLoginPageProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useAtmosphericCanvas(canvasRef);

  const {
    active,
    carouselSource,
    carouselCards,
    titleHead,
    titleTail,
    heroSubtitle,
    features,
  } = useLoginCarousel({ name, carouselItems });

  return (
    <div className="blocksLogin-page">
      <style>{blocksLoginStyles}</style>

      <div className="grid-bg" />
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

      <LoginHeader signUpUrl={signUpUrl} />

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
          {signUpUrl && (
            <p className="cta-signup">
              Not a member?{" "}
              <a href={signUpUrl} className="cta-signup-link">
                Sign up
                <svg
                  width="11"
                  height="11"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
            </p>
          )}
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
