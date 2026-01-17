import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useSubmitLead } from "@/hooks/useLeads";
import { z } from "zod";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  phone: z.string().trim().min(1, "Phone is required").max(20, "Phone too long"),
  email: z.string().trim().email("Invalid email").max(255, "Email too long").optional().or(z.literal("")),
  message: z.string().trim().max(1000, "Message too long").optional(),
});

interface ContactFormProps {
  siteId?: string;
  variant?: "classic" | "modern" | "trusted";
  source?: "quote_form" | "contact_form" | "chat";
}

export function ContactForm({ siteId, variant = "classic", source = "quote_form" }: ContactFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const submitLead = useSubmitLead();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = formSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    if (!siteId) {
      toast.success("Form submitted successfully! (Demo mode)");
      setFormData({ name: "", phone: "", email: "", message: "" });
      return;
    }

    submitLead.mutate(
      {
        site_id: siteId,
        name: formData.name,
        phone: formData.phone,
        email: formData.email || null,
        message: formData.message || null,
        source,
      },
      {
        onSuccess: () => {
          setFormData({ name: "", phone: "", email: "", message: "" });
        },
      }
    );
  };

  const inputClasses = {
    classic: "border-2 border-slate-200 focus:border-amber-500 rounded-sm",
    modern: "border-0 bg-zinc-800 text-white placeholder:text-zinc-400 rounded-none",
    trusted: "border-2 border-stone-300 focus:border-green-600 rounded-lg",
  };

  const buttonClasses = {
    classic: "bg-amber-600 hover:bg-amber-700 text-white rounded-sm font-semibold",
    modern: "bg-cyan-500 hover:bg-cyan-400 text-black rounded-none font-bold uppercase tracking-wider",
    trusted: "bg-green-700 hover:bg-green-800 text-white rounded-lg font-medium",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium">
          Name *
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Your name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={inputClasses[variant]}
          disabled={submitLead.isPending}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-sm font-medium">
          Phone *
        </Label>
        <Input
          id="phone"
          type="tel"
          placeholder="(555) 123-4567"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          className={inputClasses[variant]}
          disabled={submitLead.isPending}
        />
        {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={inputClasses[variant]}
          disabled={submitLead.isPending}
        />
        {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="message" className="text-sm font-medium">
          How can we help?
        </Label>
        <Textarea
          id="message"
          placeholder="Tell us about your roofing needs..."
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          className={`min-h-[100px] ${inputClasses[variant]}`}
          disabled={submitLead.isPending}
        />
        {errors.message && <p className="text-sm text-red-500">{errors.message}</p>}
      </div>

      <Button
        type="submit"
        className={`w-full ${buttonClasses[variant]}`}
        disabled={submitLead.isPending}
      >
        {submitLead.isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Get Free Quote"
        )}
      </Button>
    </form>
  );
}
