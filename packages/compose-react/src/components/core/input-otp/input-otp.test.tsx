import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from "@/components/core/input-otp/input-otp";

describe("InputOTP", () => {
  it("renders the OTP input, slots and a separator", () => {
    const { container } = render(
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
  });
});
