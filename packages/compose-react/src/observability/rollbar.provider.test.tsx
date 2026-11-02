import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The provider builds a real Rollbar client, and the test environment's runtime-env proxy would
// otherwise hand it a token and let it attempt transmission.
const h = vi.hoisted(() => ({ runtimeEnv: {} as Record<string, string> }));

vi.mock("@/lib/runtime-env", () => ({
  getRuntimeEnv: (key: string) => h.runtimeEnv[key] ?? "",
}));

// Imported per test rather than once at the top: the client is memoised for the life of the module
// graph, so a shared import would leave the second case asserting on the first case's instance.
const renderApp = async () => {
  vi.resetModules();
  const { RollbarProvider } = await import("./rollbar.provider");

  render(
    <RollbarProvider service="blocks-os">
      <p>app</p>
    </RollbarProvider>,
  );
};

describe("RollbarProvider", () => {
  beforeEach(() => {
    h.runtimeEnv = {};
  });

  afterEach(() => vi.restoreAllMocks());

  // Reporting is optional. `@rollbar/react`'s Provider asserts on the instance's access token from
  // its own constructor -- above the error boundary -- so an unseeded token used to take the whole
  // app down with "`instance` must be a configured instance of Rollbar" rather than merely turning
  // reporting off.
  it("renders the app with no client token seeded", async () => {
    await renderApp();

    expect(screen.getByText("app")).toBeInTheDocument();
  });

  it("renders the app once a token is seeded", async () => {
    h.runtimeEnv.BLOCKS_ROLLBAR_CLIENT_TOKEN = "client-token";

    await renderApp();

    expect(screen.getByText("app")).toBeInTheDocument();
  });

  // H10: the noise rules must not reach the boundary, which reports every render crash at critical.
  it("reports a render crash at critical and shows the fallback", async () => {
    vi.resetModules();
    const { getRollbar } = await import("./rollbar.instance");
    const { RollbarProvider } = await import("./rollbar.provider");
    // Same module graph as the provider, so this is the instance it renders with.
    const critical = vi
      .spyOn(getRollbar({ service: "blocks-os" }), "critical")
      .mockReturnValue({ uuid: "test" });
    // React logs the caught render error; keep the test output clean.
    vi.spyOn(console, "error").mockImplementation(() => undefined);
    const crash = new TypeError(
      "Cannot read properties of undefined (reading 'id')",
    );
    const Crashing = () => {
      throw crash;
    };

    render(
      <RollbarProvider service="blocks-os">
        <Crashing />
      </RollbarProvider>,
    );

    expect(screen.getByRole("alert")).toHaveTextContent("Something went wrong");
    expect(critical).toHaveBeenCalledTimes(1);
    expect(critical.mock.calls[0]?.[0]).toBe(crash);
  });
});
