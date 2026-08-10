import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import docsImage from "@/assets/images/console/console_timeline.png";
import codeImage from "@/assets/images/console/console_coding.png";
import cloudImage from "@/assets/images/console/console_data-center.png";

type DocCardProps = {
  label: string;
  image: string;
  description: string;
  url: string;
};

const DocCard = ({ label, image, description, url }: DocCardProps) => {
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="hover:border-primary/40 hover:shadow-primary/5 group flex flex-col overflow-hidden rounded-2xl border border-[hsl(var(--border-default))] bg-[hsl(var(--card))] shadow-sm transition-all duration-300 hover:shadow-xl"
    >
      <div className="relative flex items-center justify-center overflow-hidden bg-[hsl(var(--surface-app))] px-8 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(hsl(var(--border-default))_1px,transparent_1px)] opacity-60 [background-size:18px_18px]" />
        <img
          src={image}
          width={148}
          height={148}
          alt={label}
          className="relative object-contain drop-shadow-sm transition-transform duration-500 group-hover:scale-105"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <div className="flex items-start justify-between gap-2">
          <h4 className="text-base font-semibold text-[hsl(var(--high-emphasis))]">
            {label}
          </h4>
          <ArrowUpRight className="text-muted-foreground group-hover:text-primary mt-0.5 h-4 w-4 shrink-0 transition-all duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {description}
        </p>
        <span className="text-primary mt-auto pt-3 text-xs font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          Explore →
        </span>
      </div>
    </motion.a>
  );
};

const data = [
  {
    label: "Docs",
    description:
      "Established standards that help project managers and technical leaders minimize project risks.",
    image: docsImage,
    url: "https://docs.seliseblocks.com",
  },
  {
    label: "Code",
    description:
      "A repository of well-documented, reusable, tried and tested core components for developers.",
    image: codeImage,
    url: "https://github.com/SELISEdigitalplatforms",
  },
  {
    label: "Cloud",
    description:
      "High-performing, optimized, and 24/7 monitored enterprise cloud deployment.",
    image: cloudImage,
    url: "https://selisegroup.com/blocks/",
  },
];

export const DefaultDoc = () => {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
      {data.map((item) => (
        <DocCard key={item.url} {...item} />
      ))}
    </div>
  );
};
