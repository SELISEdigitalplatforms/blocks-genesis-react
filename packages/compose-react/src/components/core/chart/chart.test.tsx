import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";

vi.mock("recharts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("recharts")>();
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: ReactNode }) => (
      <div style={{ width: 400, height: 300 }}>{children}</div>
    ),
  };
});

import { BarChart, Bar } from "recharts";
import {
  ChartContainer,
  ChartTooltipContent,
  ChartLegendContent,
} from "@/components/core/chart/chart";

const config = { sales: { label: "Sales", color: "#f00" } };

const withContainer = (ui: ReactNode) =>
  render(<ChartContainer config={config}>{ui}</ChartContainer>);

const tooltipPayload = [
  {
    dataKey: "sales",
    name: "sales",
    value: 1200,
    color: "#f00",
    type: "line",
    payload: { fill: "#f00", sales: 1200 },
  },
];

describe("ChartContainer", () => {
  it("renders a chart inside the styled container", () => {
    withContainer(
      <BarChart width={400} height={300} data={[{ name: "Jan", sales: 10 }]}>
        <Bar dataKey="sales" />
      </BarChart>,
    );
    expect(document.querySelector("[data-chart]")).toBeInTheDocument();
  });
});

describe("ChartTooltipContent", () => {
  it("renders the label, series label and formatted value", () => {
    withContainer(
      <ChartTooltipContent active payload={tooltipPayload} label="Jan" />,
    );
    expect(screen.getByText("Jan")).toBeInTheDocument();
    expect(screen.getByText("Sales")).toBeInTheDocument();
    expect(screen.getByText("1,200")).toBeInTheDocument();
  });

  it("uses a custom formatter and dashed indicator", () => {
    withContainer(
      <ChartTooltipContent
        active
        payload={tooltipPayload}
        indicator="dashed"
        formatter={(_value: number, name: string) => <span>fmt:{name}</span>}
      />,
    );
    expect(screen.getByText(/fmt:/)).toBeInTheDocument();
  });

  it("renders nothing when inactive", () => {
    withContainer(
      <ChartTooltipContent active={false} payload={tooltipPayload} />,
    );
    expect(screen.queryByText("Sales")).not.toBeInTheDocument();
  });
});

describe("ChartLegendContent", () => {
  it("renders a legend entry per payload item", () => {
    withContainer(
      <ChartLegendContent
        payload={[{ value: "sales", dataKey: "sales", color: "#f00", type: "line" }]}
      />,
    );
    expect(screen.getByText("Sales")).toBeInTheDocument();
  });

  it("renders nothing for an empty payload", () => {
    withContainer(<ChartLegendContent payload={[]} />);
    expect(screen.queryByText("Sales")).not.toBeInTheDocument();
  });
});
