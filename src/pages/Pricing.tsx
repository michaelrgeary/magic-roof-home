import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { PricingCards } from "@/components/billing/PricingCards";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { ArrowRight } from "lucide-react";

const faqs = [
  {
    question: "Can I switch plans anytime?",
    answer: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any charges.",
  },
  {
    question: "What happens if I cancel?",
    answer: "Your sites will remain accessible until the end of your billing period. After that, they'll be unpublished but not deleted—you can resubscribe anytime to restore them.",
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 14-day money-back guarantee. If you're not satisfied within the first 14 days, contact us for a full refund.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express) through our secure payment processor, Stripe.",
  },
  {
    question: "Can I use my own domain?",
    answer: "Custom domains are included with the Pro plan. With Basic, your site will be hosted on our subdomain (yourcompany.roofsites.com).",
  },
  {
    question: "How many leads can I capture?",
    answer: "Both plans include unlimited lead capture—there's no limit on the number of quote requests or contact form submissions you can receive.",
  },
];

export default function Pricing() {
  const { isAuthenticated, signOut } = useAuth();
  const { subscription } = useSubscription();
  const currentPlan = subscription?.status === "active" ? subscription.plan : null;

  return (
    <Layout isAuthenticated={isAuthenticated} onSignOut={signOut}>
      <div className="container py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get a professional roofing website that converts visitors into leads.
            No hidden fees, cancel anytime.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mb-16">
          <PricingCards currentPlan={currentPlan} />
        </div>

        {/* CTA for non-authenticated users */}
        {!isAuthenticated && (
          <div className="text-center mb-16">
            <p className="text-muted-foreground mb-4">
              Ready to grow your roofing business?
            </p>
            <Button asChild size="lg" className="glow-primary">
              <Link to="/auth">
                Get Started Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">
            Frequently Asked Questions
          </h2>
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 p-8 bg-muted/50 rounded-2xl">
          <h3 className="text-2xl font-bold mb-2">Still have questions?</h3>
          <p className="text-muted-foreground mb-4">
            We're here to help. Reach out and we'll get back to you within 24 hours.
          </p>
          <Button variant="outline">Contact Support</Button>
        </div>
      </div>
    </Layout>
  );
}
