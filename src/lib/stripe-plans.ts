// Stripe plan configuration
export const STRIPE_PLANS = {
  basic: {
    id: "basic",
    name: "Basic",
    price: 39,
    priceId: "price_1SqQN5LbKfucSq3yzacs4xW5",
    productId: "prod_To2R4ld1pyoSQd",
    siteLimit: 1,
    features: [
      "1 roofing website",
      "Lead capture forms",
      "Mobile-friendly design",
      "Quote request forms",
      "Basic analytics",
      "Email support",
    ],
    notIncluded: [
      "Custom domain",
      "Priority support",
      "Advanced analytics",
      "Unlimited sites",
    ],
  },
  pro: {
    id: "pro",
    name: "Pro",
    price: 99,
    priceId: "price_1SqQNPLbKfucSq3yCHOGcj6n",
    productId: "prod_To2SFQaADgkcgl",
    siteLimit: Infinity,
    features: [
      "Unlimited roofing websites",
      "Lead capture forms",
      "Mobile-friendly design",
      "Quote request forms",
      "Advanced analytics",
      "Custom domain support",
      "Priority support",
      "SMS lead notifications",
      "White-label branding",
    ],
    notIncluded: [],
  },
} as const;

export type PlanId = keyof typeof STRIPE_PLANS;
