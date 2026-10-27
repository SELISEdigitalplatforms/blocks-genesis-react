import { afterEach, describe, expect, it, vi } from "vitest";
import { withSessionLock } from "./session-lock";

const deferred = () => {
  let resolve: () => void = () => undefined;
  const promise = new Promise<void>((r) => {
    resolve = r;
  });
  return { promise, resolve };
};

const stubLocks = (request: (...args: unknown[]) => Promise<unknown>) => {
  Object.defineProperty(navigator, "locks", {
    configurable: true,
    value: { request },
  });
};

afterEach(() => {
  Reflect.deleteProperty(navigator, "locks");
  vi.restoreAllMocks();
});

describe("withSessionLock without the Web Locks API", () => {
  it("runs calls for the same session one at a time", async () => {
    const order: string[] = [];
    const first = deferred();

    const a = withSessionLock("s", async () => {
      order.push("a:start");
      await first.promise;
      order.push("a:end");
    });
    const b = withSessionLock("s", async () => {
      order.push("b");
    });

    await new Promise((resolve) => setTimeout(resolve, 10));
    expect(order).toEqual(["a:start"]);

    first.resolve();
    await Promise.all([a, b]);
    expect(order).toEqual(["a:start", "a:end", "b"]);
  });

  it("does not hold up a different session", async () => {
    const first = deferred();
    const a = withSessionLock("s1", () => first.promise);

    await expect(withSessionLock("s2", async () => "done")).resolves.toBe(
      "done",
    );

    first.resolve();
    await a;
  });

  it("lets the next call run after one fails", async () => {
    const failed = withSessionLock("s", async () => {
      throw new Error("boom");
    });

    await expect(failed).rejects.toThrow("boom");
    await expect(withSessionLock("s", async () => 1)).resolves.toBe(1);
  });
});

describe("withSessionLock with the Web Locks API", () => {
  it("holds the shared lock for the session while the call runs", async () => {
    const request = vi.fn(
      (_name: unknown, _options: unknown, callback: unknown) =>
        (callback as () => Promise<unknown>)(),
    );
    stubLocks(request);

    await expect(withSessionLock("s", async () => "ok")).resolves.toBe("ok");
    expect(request).toHaveBeenCalledWith(
      "blocks-session:s",
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
      expect.any(Function),
    );
  });

  it("passes on what the call throws", async () => {
    stubLocks((_name, _options, callback) =>
      (callback as () => Promise<unknown>)(),
    );

    await expect(
      withSessionLock("s", async () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");
  });

  it("goes ahead without the lock when another tab never lets go", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    // The wait limit has run out, and the browser rejects with its reason, as it does for a
    // timed-out AbortSignal.timeout(): a TimeoutError, not an AbortError.
    vi.spyOn(AbortSignal, "timeout").mockReturnValue(
      AbortSignal.abort(new DOMException("signal timed out", "TimeoutError")),
    );
    stubLocks(async (_name, options) => {
      throw (options as { signal: AbortSignal }).signal.reason;
    });
    const fn = vi.fn().mockResolvedValue("ran");

    await expect(withSessionLock("s", fn)).resolves.toBe("ran");
    expect(fn).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledTimes(1);
  });

  it("passes on a lock failure that is not the wait running out", async () => {
    stubLocks(async () => {
      throw new Error("locks unavailable");
    });
    const fn = vi.fn();

    await expect(withSessionLock("s", fn)).rejects.toThrow("locks unavailable");
    expect(fn).not.toHaveBeenCalled();
  });
});
