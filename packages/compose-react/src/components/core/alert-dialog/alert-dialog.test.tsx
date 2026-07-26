import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/core/alert-dialog/alert-dialog";

const body = (
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Confirm</AlertDialogTitle>
      <AlertDialogDescription>Are you sure?</AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancel</AlertDialogCancel>
      <AlertDialogAction>Continue</AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
);

describe("AlertDialog", () => {
  it("renders the alert content when controlled open", () => {
    render(<AlertDialog open>{body}</AlertDialog>);
    expect(screen.getByText("Confirm")).toBeInTheDocument();
    expect(screen.getByText("Are you sure?")).toBeInTheDocument();
    expect(screen.getByText("Cancel")).toBeInTheDocument();
    expect(screen.getByText("Continue")).toBeInTheDocument();
  });

  it("supports the uncontrolled defaultOpen path", () => {
    render(<AlertDialog defaultOpen>{body}</AlertDialog>);
    expect(screen.getByText("Confirm")).toBeInTheDocument();
  });
});
