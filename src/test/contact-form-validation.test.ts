import { describe, it, expect } from "vitest";
import { z } from "zod";

// Contact form validation schema (matching the one in ContactForm.tsx)
const contactFormSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  phone: z.string().trim().min(1, "Phone is required").max(20, "Phone too long"),
  email: z.string().trim().email("Invalid email").max(255, "Email too long").optional().or(z.literal("")),
  message: z.string().trim().max(1000, "Message too long").optional(),
});

describe("Contact Form Validation", () => {
  describe("name field", () => {
    it("accepts valid name", () => {
      const result = contactFormSchema.safeParse({
        name: "John Smith",
        phone: "555-1234",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty name", () => {
      const result = contactFormSchema.safeParse({
        name: "",
        phone: "555-1234",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Name is required");
      }
    });

    it("rejects whitespace-only name", () => {
      const result = contactFormSchema.safeParse({
        name: "   ",
        phone: "555-1234",
      });
      expect(result.success).toBe(false);
    });

    it("rejects name over 100 characters", () => {
      const result = contactFormSchema.safeParse({
        name: "A".repeat(101),
        phone: "555-1234",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Name too long");
      }
    });
  });

  describe("phone field", () => {
    it("accepts valid phone", () => {
      const result = contactFormSchema.safeParse({
        name: "John",
        phone: "(555) 123-4567",
      });
      expect(result.success).toBe(true);
    });

    it("rejects empty phone", () => {
      const result = contactFormSchema.safeParse({
        name: "John",
        phone: "",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Phone is required");
      }
    });

    it("rejects phone over 20 characters", () => {
      const result = contactFormSchema.safeParse({
        name: "John",
        phone: "1".repeat(21),
      });
      expect(result.success).toBe(false);
    });
  });

  describe("email field", () => {
    it("accepts valid email", () => {
      const result = contactFormSchema.safeParse({
        name: "John",
        phone: "555-1234",
        email: "john@example.com",
      });
      expect(result.success).toBe(true);
    });

    it("accepts empty email (optional)", () => {
      const result = contactFormSchema.safeParse({
        name: "John",
        phone: "555-1234",
        email: "",
      });
      expect(result.success).toBe(true);
    });

    it("accepts undefined email (optional)", () => {
      const result = contactFormSchema.safeParse({
        name: "John",
        phone: "555-1234",
      });
      expect(result.success).toBe(true);
    });

    it("rejects invalid email format", () => {
      const result = contactFormSchema.safeParse({
        name: "John",
        phone: "555-1234",
        email: "not-an-email",
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Invalid email");
      }
    });

    it("rejects email over 255 characters", () => {
      const result = contactFormSchema.safeParse({
        name: "John",
        phone: "555-1234",
        email: "a".repeat(250) + "@test.com",
      });
      expect(result.success).toBe(false);
    });
  });

  describe("message field", () => {
    it("accepts valid message", () => {
      const result = contactFormSchema.safeParse({
        name: "John",
        phone: "555-1234",
        message: "I need a roof repair.",
      });
      expect(result.success).toBe(true);
    });

    it("accepts empty message (optional)", () => {
      const result = contactFormSchema.safeParse({
        name: "John",
        phone: "555-1234",
        message: "",
      });
      expect(result.success).toBe(true);
    });

    it("rejects message over 1000 characters", () => {
      const result = contactFormSchema.safeParse({
        name: "John",
        phone: "555-1234",
        message: "A".repeat(1001),
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors[0].message).toBe("Message too long");
      }
    });
  });

  describe("complete form", () => {
    it("accepts full valid form", () => {
      const result = contactFormSchema.safeParse({
        name: "John Smith",
        phone: "(555) 123-4567",
        email: "john@example.com",
        message: "I need help with my roof.",
      });
      expect(result.success).toBe(true);
    });

    it("accepts minimal valid form", () => {
      const result = contactFormSchema.safeParse({
        name: "John",
        phone: "555",
      });
      expect(result.success).toBe(true);
    });
  });
});
