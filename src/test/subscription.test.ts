import { describe, it, expect } from "vitest";
import type { Subscription } from "@/hooks/useSubscription";

// Helper functions extracted from useSubscription for testing
function getIsActive(subscription: Subscription | null): boolean {
  return subscription?.status === "active";
}

function getIsPro(subscription: Subscription | null): boolean {
  return subscription?.plan === "pro" && subscription?.status === "active";
}

describe("Subscription Status Helpers", () => {
  describe("getIsActive", () => {
    it("returns true for active subscription", () => {
      const subscription: Subscription = {
        id: "sub-1",
        user_id: "user-1",
        plan: "basic",
        status: "active",
        stripe_customer_id: null,
        stripe_subscription_id: null,
        current_period_end: null,
        created_at: new Date().toISOString(),
      };
      expect(getIsActive(subscription)).toBe(true);
    });

    it("returns false for canceled subscription", () => {
      const subscription: Subscription = {
        id: "sub-1",
        user_id: "user-1",
        plan: "basic",
        status: "canceled",
        stripe_customer_id: null,
        stripe_subscription_id: null,
        current_period_end: null,
        created_at: new Date().toISOString(),
      };
      expect(getIsActive(subscription)).toBe(false);
    });

    it("returns false for past_due subscription", () => {
      const subscription: Subscription = {
        id: "sub-1",
        user_id: "user-1",
        plan: "pro",
        status: "past_due",
        stripe_customer_id: null,
        stripe_subscription_id: null,
        current_period_end: null,
        created_at: new Date().toISOString(),
      };
      expect(getIsActive(subscription)).toBe(false);
    });

    it("returns false for null subscription", () => {
      expect(getIsActive(null)).toBe(false);
    });
  });

  describe("getIsPro", () => {
    it("returns true for active pro subscription", () => {
      const subscription: Subscription = {
        id: "sub-1",
        user_id: "user-1",
        plan: "pro",
        status: "active",
        stripe_customer_id: "cus_123",
        stripe_subscription_id: "sub_123",
        current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        created_at: new Date().toISOString(),
      };
      expect(getIsPro(subscription)).toBe(true);
    });

    it("returns false for active basic subscription", () => {
      const subscription: Subscription = {
        id: "sub-1",
        user_id: "user-1",
        plan: "basic",
        status: "active",
        stripe_customer_id: null,
        stripe_subscription_id: null,
        current_period_end: null,
        created_at: new Date().toISOString(),
      };
      expect(getIsPro(subscription)).toBe(false);
    });

    it("returns false for canceled pro subscription", () => {
      const subscription: Subscription = {
        id: "sub-1",
        user_id: "user-1",
        plan: "pro",
        status: "canceled",
        stripe_customer_id: "cus_123",
        stripe_subscription_id: "sub_123",
        current_period_end: null,
        created_at: new Date().toISOString(),
      };
      expect(getIsPro(subscription)).toBe(false);
    });

    it("returns false for past_due pro subscription", () => {
      const subscription: Subscription = {
        id: "sub-1",
        user_id: "user-1",
        plan: "pro",
        status: "past_due",
        stripe_customer_id: "cus_123",
        stripe_subscription_id: "sub_123",
        current_period_end: null,
        created_at: new Date().toISOString(),
      };
      expect(getIsPro(subscription)).toBe(false);
    });

    it("returns false for null subscription", () => {
      expect(getIsPro(null)).toBe(false);
    });
  });
});

describe("Subscription Edge Cases", () => {
  it("handles subscription with all nullable fields as null", () => {
    const subscription: Subscription = {
      id: "sub-1",
      user_id: "user-1",
      plan: "basic",
      status: "active",
      stripe_customer_id: null,
      stripe_subscription_id: null,
      current_period_end: null,
      created_at: new Date().toISOString(),
    };
    expect(getIsActive(subscription)).toBe(true);
    expect(getIsPro(subscription)).toBe(false);
  });

  it("handles subscription with Stripe fields populated", () => {
    const subscription: Subscription = {
      id: "sub-1",
      user_id: "user-1",
      plan: "pro",
      status: "active",
      stripe_customer_id: "cus_abc123",
      stripe_subscription_id: "sub_xyz789",
      current_period_end: "2026-02-17T00:00:00Z",
      created_at: new Date().toISOString(),
    };
    expect(getIsActive(subscription)).toBe(true);
    expect(getIsPro(subscription)).toBe(true);
  });
});
