import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  claimTenant,
  clearTenantClaims,
  holdTenant,
  isSameClaim,
  isTenantHeldElsewhere,
  readCurrentOwner,
  subscribeToTenantClaims,
  TAB_ID,
} from "@/lib/tenant-ownership";

// A second channel object on the same name stands in for another tab: BroadcastChannel delivers
// between distinct objects, never back to the one that posted.
let otherTab: BroadcastChannel;

beforeEach(() => {
  window.localStorage.clear();
  otherTab = new BroadcastChannel("blocks:tenant");
});

afterEach(() => {
  otherTab.close();
});

const answerProbesFor = (tenantId: string) => {
  otherTab.onmessage = (event: MessageEvent) => {
    const data = event.data as {
      kind?: string;
      probeId?: string;
      probedTenantId?: string;
    };
    if (data.kind === "owner-probe" && data.probedTenantId === tenantId) {
      otherTab.postMessage({ kind: "owner-present", probeId: data.probeId });
    }
  };
};

describe("isTenantHeldElsewhere", () => {
  it("is true when a live tab answers for the tenant", async () => {
    answerProbesFor("t1");
    await expect(isTenantHeldElsewhere("t1", 200)).resolves.toBe(true);
  });

  it("is false when no tab answers -- a reloaded or closed owner", async () => {
    await expect(isTenantHeldElsewhere("t1", 50)).resolves.toBe(false);
  });

  it("is false when the live tab is in a different tenant", async () => {
    answerProbesFor("t2");
    await expect(isTenantHeldElsewhere("t1", 50)).resolves.toBe(false);
  });

  it("is never answered by this tab's own hold", async () => {
    const release = holdTenant("t1");
    await expect(isTenantHeldElsewhere("t1", 50)).resolves.toBe(false);
    release();
  });
});

describe("holdTenant", () => {
  const probeFromOtherTab = (tenantId: string) =>
    new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => resolve(false), 100);
      otherTab.onmessage = (event: MessageEvent) => {
        if ((event.data as { kind?: string }).kind === "owner-present") {
          clearTimeout(timer);
          resolve(true);
        }
      };
      otherTab.postMessage({
        kind: "owner-probe",
        probeId: "p",
        probedTenantId: tenantId,
      });
    });

  it("answers another tab's probe while held, and stops once released", async () => {
    const release = holdTenant("t1");
    await expect(probeFromOtherTab("t1")).resolves.toBe(true);
    release();
    await expect(probeFromOtherTab("t1")).resolves.toBe(false);
  });

  it("is not undone by the release of an earlier hold", async () => {
    const releaseFirst = holdTenant("t1");
    const releaseSecond = holdTenant("t2");
    releaseFirst();
    await expect(probeFromOtherTab("t2")).resolves.toBe(true);
    releaseSecond();
  });
});

describe("claims", () => {
  it("records this tab as the owner", () => {
    claimTenant("t1");
    expect(readCurrentOwner()).toMatchObject({ tenantId: "t1", tabId: TAB_ID });
  });

  it("never delivers a probe to a claim subscriber", async () => {
    const onClaim = vi.fn();
    const unsubscribe = subscribeToTenantClaims(onClaim);
    otherTab.postMessage({
      kind: "owner-probe",
      probeId: "p",
      probedTenantId: "t1",
    });
    otherTab.postMessage({ tenantId: "t2", tabId: "another-tab", ts: 1 });
    await vi.waitFor(() => expect(onClaim).toHaveBeenCalledTimes(1));
    expect(onClaim).toHaveBeenCalledWith(
      expect.objectContaining({ tenantId: "t2" }),
    );
    unsubscribe();
  });

  it("are forgotten on logout, along with this tab's hold", async () => {
    claimTenant("t1");
    holdTenant("t1");

    clearTenantClaims();

    expect(readCurrentOwner()).toBeNull();
    const answered = new Promise<boolean>((resolve) => {
      const timer = setTimeout(() => resolve(false), 100);
      otherTab.onmessage = (event: MessageEvent) => {
        if ((event.data as { kind?: string }).kind === "owner-present") {
          clearTimeout(timer);
          resolve(true);
        }
      };
      otherTab.postMessage({
        kind: "owner-probe",
        probeId: "p",
        probedTenantId: "t1",
      });
    });
    await expect(answered).resolves.toBe(false);
  });

  it("tells a replaced claim from the same one read twice", () => {
    const a = { tenantId: "t1", tabId: "x", ts: 1 };
    expect(isSameClaim(a, { ...a })).toBe(true);
    expect(isSameClaim(a, { ...a, ts: 2 })).toBe(false);
    expect(isSameClaim(a, null)).toBe(false);
  });
});
