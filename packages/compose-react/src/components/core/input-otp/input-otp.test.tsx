import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/core/input-otp/input-otp";

describe("InputOTP", () => {
  // input-otp schedules an internal setTimeout that isn't cleared on unmount.
  // Under real timers it can fire after this test (and jsdom) have already
  // torn down, throwing "window is not defined" as an unhandled error that
  // fails the whole run despite every assertion passing. Fake timers let us
  // flush it deterministically while the environment is still alive.
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it("renders the OTP input, slots and a separator", () => {
    const { container, unmount } = render(
      <InputOTP maxLength={2}>
        <InputOTPGroup>
          <InputOTPSlot index={0} />
          <InputOTPSlot index={1} />
        </InputOTPGroup>
        <InputOTPSeparator />
      </InputOTP>,
    );
    expect(container.querySelector("input")).toBeInTheDocument();
    expect(container.querySelector("[role='separator']")).toBeInTheDocument();
    unmount();
  });
});
