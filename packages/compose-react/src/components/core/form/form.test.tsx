import { describe, it, expect } from "vitest";
import * as React from "react";
import { render, screen } from "@testing-library/react";
import { useForm } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from "@/components/core/form/form";

function FieldForm({ withError }: { withError?: boolean }) {
  const form = useForm({ defaultValues: { name: "" } });
  React.useEffect(() => {
    if (withError) form.setError("name", { message: "Required" });
  }, [withError, form]);

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <input aria-label="name-input" {...field} />
            </FormControl>
            <FormDescription>Your name</FormDescription>
            <FormMessage>{withError ? undefined : "Hint"}</FormMessage>
          </FormItem>
        )}
      />
    </Form>
  );
}

describe("Form primitives", () => {
  it("wires label, control, description and a static message", () => {
    render(<FieldForm />);
    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("name-input")).toBeInTheDocument();
    expect(screen.getByText("Your name")).toBeInTheDocument();
    expect(screen.getByText("Hint")).toBeInTheDocument();
  });

  it("renders the field error message when the field is invalid", async () => {
    render(<FieldForm withError />);
    expect(await screen.findByText("Required")).toBeInTheDocument();
  });
});
