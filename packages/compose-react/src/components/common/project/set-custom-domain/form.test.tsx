import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SetCustomDomainForm } from "./form";

const renderForm = (
  overrides: Partial<Parameters<typeof SetCustomDomainForm>[0]> = {},
) => {
  const onSubmit = vi.fn().mockResolvedValue(undefined);
  const onCancel = vi.fn();
  render(
    <SetCustomDomainForm
      defaultDomain="a.com"
      verifiedDomains={["a.com", "b.com"]}
      isPending={false}
      onSubmit={onSubmit}
      onCancel={onCancel}
      {...overrides}
    />,
  );
  return { onSubmit, onCancel };
};

describe("SetCustomDomainForm", () => {
  beforeEach(() => vi.clearAllMocks());

  it("submits the preselected default domain", async () => {
    const { onSubmit } = renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Set" }));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith("a.com"));
  });

  it("blocks submission and shows a validation message when nothing is selected", async () => {
    const { onSubmit } = renderForm({ defaultDomain: "" });

    fireEvent.click(screen.getByRole("button", { name: "Set" }));

    await waitFor(() =>
      expect(screen.getByText("Please select a domain")).toBeInTheDocument(),
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("disables the select and shows the empty placeholder without verified domains", () => {
    renderForm({ verifiedDomains: [], defaultDomain: "" });

    expect(
      screen.getByText("No verified domains available"),
    ).toBeInTheDocument();
  });

  it("disables the submit button while a request is pending", () => {
    renderForm({ isPending: true });

    expect(screen.getByRole("button", { name: "Set" })).toBeDisabled();
  });

  it("invokes onCancel when the cancel button is pressed", () => {
    const { onCancel } = renderForm();

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onCancel).toHaveBeenCalled();
  });
});
