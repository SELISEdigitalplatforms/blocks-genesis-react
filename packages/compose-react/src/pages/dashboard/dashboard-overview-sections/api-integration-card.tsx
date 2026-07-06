import type { ReactNode } from "react";
import { CopyToClipboardButton, MaskedText, Skeleton } from "@/index";
import { DashboardSectionCard } from "@/components/common/dashboard-section-card";

export interface AppIntegrationLink {
  id: string;
  label: string;
  href: string;
  icon: ReactNode;
}

interface AppIntegrationCardProps {
  title?: string;
  description?: string;
  links?: AppIntegrationLink[];
  clientId?: string;
  clientSecret?: string;
  isLoading?: boolean;
}

const AppIntegrationLoadingSkeleton = () => (
  <div className="rounded-lg border border-border bg-card">
    <div className="px-3 py-2.5 sm:px-4 sm:py-3">
      <Skeleton className="h-4 w-36" />
    </div>
    <div className="grid grid-cols-1 gap-4 border-t border-border px-2 py-2 sm:grid-cols-2 sm:px-4 sm:py-3">
      {Array.from({ length: 2 }).map((_item, index) => (
        <div key={index}>
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-2 h-5 w-full" />
        </div>
      ))}
    </div>
  </div>
);

/**
 * App-specific dashboard card (Card 3). Fully generic on purpose: pass
 * different `links` / `clientId` / `clientSecret` per app (e.g. Localization
 * vs. a future module) from whatever wrapper decides which app is active.
 */
export const AppIntegrationCard = ({
  title = "Connect Extensions",
  description,
  links = [],
  clientId,
  clientSecret,
  isLoading,
}: AppIntegrationCardProps) => {
  if (isLoading) return <AppIntegrationLoadingSkeleton />;

  return (
    <DashboardSectionCard
      title={title}
      description={description}
      headerRight={
        links.length > 0 ? (
          <div className="flex items-center gap-1">
            {links.map((link) => (
              <a
                key={link.id}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                title={link.label}
                aria-label={link.label}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                {link.icon}
              </a>
            ))}
          </div>
        ) : undefined
      }>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {clientId && (
          <div className="space-y-1.5">
            <div className="text-sm font-medium text-medium-emphasis">
              Client ID
            </div>
            <CopyToClipboardButton textToCopy={clientId} isHoverable>
              <MaskedText
                text={clientId}
                showFirstN={3}
                showLastN={3}
                length={20}
              />
            </CopyToClipboardButton>
          </div>
        )}
        {clientSecret && (
          <div className="space-y-1.5">
            <div className="text-sm font-medium text-medium-emphasis">
              Client Secret
            </div>
            <CopyToClipboardButton textToCopy={clientSecret} isHoverable>
              <MaskedText
                text={clientSecret}
                showFirstN={3}
                showLastN={3}
                length={20}
              />
            </CopyToClipboardButton>
          </div>
        )}
        {!clientId && !clientSecret && links.length === 0 && (
          <p className="text-sm text-muted-foreground sm:col-span-2">
            No integration details available for this app yet.
          </p>
        )}
      </div>
    </DashboardSectionCard>
  );
};
