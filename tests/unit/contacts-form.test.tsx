import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ContactsPage from "@/app/contacts/page";
import { useCRMStore } from "@/app/store/crm-store";

// Reset the zustand store to a known, empty state before each test so
// contacts created in one test don't leak into the next.
beforeEach(() => {
  useCRMStore.setState({ contacts: [] });
});

describe("Add contact form", () => {
  it("is hidden until the user opens it", () => {
    render(<ContactsPage />);
    expect(screen.queryByRole("button", { name: "Save contact" })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Add contact" }));
    expect(screen.getByRole("button", { name: "Save contact" })).toBeInTheDocument();
  });

  it("marks name, company, and email as required so the browser blocks submission when blank", () => {
    render(<ContactsPage />);
    fireEvent.click(screen.getByRole("button", { name: "Add contact" }));

    const form = screen.getByTestId("add-contact-form") as HTMLFormElement;

    expect(screen.getByTestId("input-name")).toBeRequired();
    expect(screen.getByTestId("input-company")).toBeRequired();
    expect(screen.getByTestId("input-email")).toBeRequired();
    expect(screen.getByTestId("input-phone")).not.toBeRequired();

    // All required fields are still empty at this point, so native
    // constraint validation should report the form as invalid.
    expect(form.checkValidity()).toBe(false);
  });

  it("adds a new contact and shows a success message on valid submit", () => {
    render(<ContactsPage />);
    fireEvent.click(screen.getByRole("button", { name: "Add contact" }));

    fireEvent.change(screen.getByTestId("input-name"), { target: { value: "Test User" } });
    fireEvent.change(screen.getByTestId("input-company"), { target: { value: "Test Co" } });
    fireEvent.change(screen.getByTestId("input-email"), { target: { value: "test@company.com" } });
    fireEvent.change(screen.getByTestId("input-phone"), { target: { value: "555-9999" } });
    fireEvent.change(screen.getByTestId("input-dealValue"), { target: { value: "4200" } });

    fireEvent.click(screen.getByRole("button", { name: "Save contact" }));

    expect(screen.getByRole("status")).toHaveTextContent("Contact added to the CRM.");
    expect(screen.getByText("Test User")).toBeInTheDocument();
  });
});