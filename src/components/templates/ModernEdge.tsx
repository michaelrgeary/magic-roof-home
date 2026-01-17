import { Phone, Mail, MapPin, ArrowRight, ChevronDown, Star } from "lucide-react";
import type { SiteConfig } from "./types";
import { ContactForm } from "./sections/ContactForm";
import { ClickToCall } from "./sections/ClickToCall";
import { TestimonialCard } from "./sections/TestimonialCard";
import { ServiceCard } from "./sections/ServiceCard";
import { TemplateGallery } from "@/components/gallery/TemplateGallery";

interface ModernEdgeProps {
  config: SiteConfig;
  siteId?: string;
  isPreview?: boolean;
}

export default function ModernEdge({ config, siteId, isPreview }: ModernEdgeProps) {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/90 backdrop-blur-sm border-b border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-lg md:text-xl font-bold uppercase tracking-wider">
              {config.businessName}
            </h1>
            <div className="flex items-center gap-4">
              <a
                href={`tel:${config.phone.replace(/\D/g, "")}`}
                className="hidden md:flex items-center gap-2 text-cyan-400 font-semibold hover:text-cyan-300 transition-colors"
              >
                <Phone className="h-4 w-4" />
                {config.phone}
              </a>
              <a
                href="#contact"
                className="bg-cyan-500 hover:bg-cyan-400 text-black px-4 py-2 font-bold uppercase text-sm tracking-wider transition-colors"
              >
                Quote
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center pt-16">
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 via-black to-zinc-900" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[128px]" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500 rounded-full blur-[128px]" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <p className="text-cyan-400 uppercase tracking-[0.2em] text-sm mb-4 font-semibold">
              {config.tagline || "Premium Roofing Solutions"}
            </p>
            <h2 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-6 leading-[1.1] tracking-tight">
              {config.heroHeadline || "Roofing Redefined"}
            </h2>
            <p className="text-xl md:text-2xl text-zinc-400 mb-8 max-w-xl">
              {config.heroSubheadline || "Modern solutions for lasting protection"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#contact"
                className="inline-flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 text-black px-8 py-4 font-bold uppercase tracking-wider transition-all hover:translate-x-1"
              >
                {config.heroCta || "Get Started"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
              <a
                href="#services"
                className="inline-flex items-center justify-center border border-zinc-700 hover:border-zinc-500 px-8 py-4 font-semibold uppercase tracking-wider transition-colors"
              >
                Explore Services
              </a>
            </div>
          </div>
        </div>
        
        <a href="#services" className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="h-8 w-8 text-zinc-500" />
        </a>
      </section>

      {/* Stats */}
      <section className="bg-zinc-900 py-12 border-y border-zinc-800">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-bold text-cyan-400">25+</p>
              <p className="text-zinc-500 uppercase text-sm tracking-wider mt-1">Years</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-cyan-400">5000+</p>
              <p className="text-zinc-500 uppercase text-sm tracking-wider mt-1">Projects</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-cyan-400">100%</p>
              <p className="text-zinc-500 uppercase text-sm tracking-wider mt-1">Satisfaction</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-bold text-cyan-400">24/7</p>
              <p className="text-zinc-500 uppercase text-sm tracking-wider mt-1">Emergency</p>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="mb-16">
            <p className="text-cyan-400 uppercase tracking-[0.2em] text-sm mb-4 font-semibold">
              What We Do
            </p>
            <h2 className="text-3xl md:text-4xl font-bold">
              Our Services
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {config.services?.map((service, i) => (
              <ServiceCard
                key={i}
                name={service.name}
                description={service.description}
                icon={service.icon}
                variant="modern"
              />
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-20 md:py-28 bg-zinc-900">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-zinc-800 aspect-square flex items-center justify-center">
              <span className="text-zinc-600 uppercase tracking-wider">Company Image</span>
            </div>
            <div>
              <p className="text-cyan-400 uppercase tracking-[0.2em] text-sm mb-4 font-semibold">
                About Us
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Built Different
              </h2>
              {config.yearEstablished && (
                <p className="text-2xl text-zinc-400 mb-4">
                  Est. {config.yearEstablished}
                </p>
              )}
              <p className="text-zinc-400 leading-relaxed mb-8">
                {config.about || "We bring innovation and precision to every roofing project."}
              </p>
              <a
                href="#contact"
                className="inline-flex items-center text-cyan-400 font-semibold uppercase tracking-wider hover:text-cyan-300 transition-colors"
              >
                Start Your Project
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      {config.serviceAreas && config.serviceAreas.length > 0 && (
        <section className="py-20 md:py-28 border-t border-zinc-800">
          <div className="container mx-auto px-4">
            <p className="text-cyan-400 uppercase tracking-[0.2em] text-sm mb-4 font-semibold text-center">
              Coverage
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Service Areas
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {config.serviceAreas.map((area, i) => (
                <span
                  key={i}
                  className="bg-zinc-900 border border-zinc-700 px-6 py-3 text-sm uppercase tracking-wider"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Credentials */}
      {config.credentials && config.credentials.length > 0 && (
        <section className="py-16 bg-cyan-500 text-black">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {config.credentials.map((cred, i) => (
                <div key={i}>
                  <p className="font-bold uppercase tracking-wider text-sm">{cred.name}</p>
                  {cred.number && (
                    <p className="text-sm opacity-70 mt-1">{cred.number}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {config.gallery && config.gallery.length > 0 && config.gallery.some(g => g.before || g.after) && (
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <p className="text-cyan-400 uppercase tracking-[0.2em] text-sm mb-4 font-semibold text-center">
              Portfolio
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
              Recent Work
            </h2>
            <TemplateGallery items={config.gallery} variant="modern" />
          </div>
        </section>
      )}

      {/* Testimonials */}
      {config.testimonials && config.testimonials.length > 0 && (
        <section className="py-20 md:py-28 bg-zinc-900">
          <div className="container mx-auto px-4">
            <p className="text-cyan-400 uppercase tracking-[0.2em] text-sm mb-4 font-semibold text-center">
              Reviews
            </p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center">
              Client Feedback
            </h2>
            {/* Aggregate Rating */}
            {config.testimonials.length > 0 && (() => {
              const avg = config.testimonials.reduce((s, t) => s + t.rating, 0) / config.testimonials.length;
              return (
                <div className="flex items-center justify-center gap-3 mb-12">
                  <span className="text-2xl font-bold text-white">{avg.toFixed(1)}</span>
                  <div className="flex flex-col items-start">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-5 w-5 ${i < Math.round(avg) ? "text-cyan-400 fill-cyan-400" : "text-zinc-600"}`} />
                      ))}
                    </div>
                    <span className="text-sm text-zinc-400">Based on {config.testimonials.length} review{config.testimonials.length !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              );
            })()}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {config.testimonials.map((testimonial, i) => (
                <TestimonialCard
                  key={i}
                  name={testimonial.name}
                  text={testimonial.text}
                  rating={testimonial.rating}
                  location={testimonial.location}
                  variant="modern"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contact */}
      <section id="contact" className="py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-cyan-400 uppercase tracking-[0.2em] text-sm mb-4 font-semibold">
                Get In Touch
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Start Your Project
              </h2>
              <p className="text-zinc-400 mb-8">
                Ready to transform your roof? Get in touch for a free consultation.
              </p>
              
              <div className="space-y-4">
                <a
                  href={`tel:${config.phone.replace(/\D/g, "")}`}
                  className="flex items-center gap-3 text-zinc-300 hover:text-cyan-400 transition-colors"
                >
                  <Phone className="h-5 w-5 text-cyan-400" />
                  {config.phone}
                </a>
                {config.email && (
                  <a
                    href={`mailto:${config.email}`}
                    className="flex items-center gap-3 text-zinc-300 hover:text-cyan-400 transition-colors"
                  >
                    <Mail className="h-5 w-5 text-cyan-400" />
                    {config.email}
                  </a>
                )}
                {config.address && (
                  <div className="flex items-center gap-3 text-zinc-300">
                    <MapPin className="h-5 w-5 text-cyan-400" />
                    {config.address}
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-zinc-900 border border-zinc-800 p-6 md:p-8">
              <ContactForm siteId={siteId} variant="modern" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-zinc-900 border-t border-zinc-800 py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-zinc-500 text-sm">
              © {new Date().getFullYear()} {config.businessName}. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-zinc-500">
              <a href="#" className="hover:text-cyan-400 transition-colors">Privacy</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>

      {/* Sticky call button (mobile) */}
      <ClickToCall phone={config.phone} variant="modern" />
    </div>
  );
}
