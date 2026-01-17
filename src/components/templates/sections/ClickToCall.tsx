import { Phone } from "lucide-react";

interface ClickToCallProps {
  phone: string;
  variant?: "classic" | "modern" | "trusted";
}

export function ClickToCall({ phone, variant = "classic" }: ClickToCallProps) {
  const cleanPhone = phone.replace(/\D/g, "");
  
  const styles = {
    classic: "bg-amber-600 hover:bg-amber-700 text-white shadow-lg",
    modern: "bg-cyan-500 hover:bg-cyan-400 text-black shadow-xl",
    trusted: "bg-green-700 hover:bg-green-800 text-white shadow-lg",
  };

  return (
    <a
      href={`tel:${cleanPhone}`}
      className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-5 py-4 rounded-full font-semibold transition-all md:hidden min-h-[56px] safe-area-inset ${styles[variant]}`}
      aria-label={`Call ${phone}`}
    >
      <Phone className="h-5 w-5" />
      <span>Call Now</span>
    </a>
  );
}
