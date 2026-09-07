import type { ReactNode } from "react";
import {
  ArrowUpRight,
  BookOpenText,
  Sparkles,
  SquareTerminal,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import docsImage from "@/assets/images/console/resource-docs-v3.png";
import cliImage from "@/assets/images/console/resource-cli-v3.png";
import skillsImage from "@/assets/images/console/resource-skills-v3.png";

type Resource = {
  eyebrow: string;
  label: string;
  image: string;
  description: string;
  url: string;
  icon: LucideIcon;
  imageClassName?: string;
};

const resources: Resource[] = [
  {
    eyebrow: "Learn",
    label: "Docs",
    description:
      "Established standards and guides that help teams minimize project risk and ship consistently.",
    image: docsImage,
    url: "https://docs.seliseblocks.com",
    icon: BookOpenText,
  },
  {
    eyebrow: "Build",
    label: "Build with CLI",
    description:
      "Public npm packages for building with Blocks — a CLI for project setup plus a framework-neutral frontend SDK.",
    image: cliImage,
    url: "https://github.com/SELISEdigitalplatforms/blocks-cli",
    icon: SquareTerminal,
  },
  {
    eyebrow: "Automate",
    label: "Code with Skills",
    description:
      "Describe what you want in plain language and an agent maps it to a focused, ready-to-run Blocks workflow.",
    image: skillsImage,
    url: "https://github.com/SELISEdigitalplatforms/blocks-skills",
    icon: Sparkles,
    // Near-square art (481×512) vs the landscape siblings (512×341): cap its
    // height so all three read at the same optical weight.
    imageClassName: "h-[82%]",
  },
];

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={cn("grid w-full grid-cols-1 gap-4 lg:grid-cols-3", className)}
  >
    {children}
  </div>
);

const BentoCard = ({
  eyebrow,
  label,
  image,
  description,
  url,
  icon: Icon,
  imageClassName,
}: Resource) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={`${label}: ${description}`}
    className={cn(
      "group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[hsl(var(--border-default))] bg-[hsl(var(--card))] p-2 outline-none transform-gpu",
      "shadow-[0_1px_2px_hsl(var(--foreground)/0.04),0_8px_24px_-20px_hsl(var(--foreground)/0.22)]",
      "transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_16px_32px_-22px_hsl(var(--primary)/0.32)]",
      "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
    )}
  >
    <div className="pointer-events-none relative flex h-36 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[hsl(var(--surface-app))]">
      <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--border-default))_1px,transparent_1px)] opacity-55 [background-size:18px_18px]" />
      <div className="absolute left-1/2 top-1/2 h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/[0.08] blur-2xl transition-transform duration-500 group-hover:scale-125 group-focus-visible:scale-125" />
      <div className="relative flex h-28 w-48 items-center justify-center">
        <img
          src={image}
          alt=""
          className={cn(
            "h-full w-auto max-w-full select-none object-contain drop-shadow-md transition-transform duration-500 ease-out group-hover:scale-[1.035] group-focus-visible:scale-[1.035]",
            imageClassName,
          )}
        />
      </div>
    </div>

    <div className="relative z-10 flex min-h-0 flex-1 flex-col px-3 pb-3 pt-4">
      <div className="flex h-11 shrink-0 items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--surface-app))] text-primary transition-colors duration-300 group-hover:bg-primary/[0.08] group-focus-visible:bg-primary/[0.08]">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center text-left">
          <span className="block text-[10px] font-bold uppercase leading-4 tracking-[0.16em] text-primary">
            {eyebrow}
          </span>
          <h3 className="truncate text-lg font-semibold leading-6 tracking-tight text-[hsl(var(--high-emphasis))]">
            {label}
          </h3>
        </div>
      </div>

      <p className="mt-3 line-clamp-3 h-[3.75rem] shrink-0 text-sm leading-5 text-muted-foreground">
        {description}
      </p>

      <div className="mt-auto pt-3">
        <span className="flex h-10 w-full items-center justify-between rounded-xl bg-[hsl(var(--surface-app))] px-3.5 text-[13px] font-semibold text-primary transition-[background-color,color,box-shadow] duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-sm group-focus-visible:bg-primary group-focus-visible:text-primary-foreground">
          <span>Explore resource</span>
          <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-focus-visible:-translate-y-0.5 group-focus-visible:translate-x-0.5" />
        </span>
      </div>
    </div>
  </a>
);

export const DefaultDoc = () => (
  <BentoGrid>
    {resources.map((resource) => (
      <BentoCard key={resource.url} {...resource} />
    ))}
  </BentoGrid>
);
