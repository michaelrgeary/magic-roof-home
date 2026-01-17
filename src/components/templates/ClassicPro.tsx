import { Phone, Mail, MapPin, Shield, Award, Clock, Star } from "lucide-react";
import type { SiteConfig } from "./types";
import { ContactForm } from "./sections/ContactForm";
import { ClickToCall } from "./sections/ClickToCall";
import { TestimonialCard } from "./sections/TestimonialCard";
import { ServiceCard } from "./sections/ServiceCard";
import { BlogSection } from "./sections/BlogSection";
import { TemplateGallery } from "@/components/gallery/TemplateGallery";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  meta_description: string | null;
  published_at: string | null;
  created_at: string;
}

interface ClassicProProps {
  config: SiteConfig;
  siteId?: string;
  siteSlug?: string;
  isPreview?: boolean;
  blogs?: BlogPost[];
}

export default function ClassicPro({ config, siteId, siteSlug, isPreview, blogs }: ClassicProProps) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header */}
      <header className="bg-slate-900 text-white">
        <div className="container mx-auto px-4">
          {/* Top bar */}
          <div className="hidden md:flex items-center justify-between py-2 text-sm border-b border-slate-700">
            <div className="flex items-center gap-6">
              {config.email && (
                <a href={`mailto:${config.email}`} className="flex items-center gap-2 hover:text-amber-400 transition-colors">
                  <Mail className="h-4 w-4" />
                  {config.email}
                </a>
              )}
              {config.address && (
                <span className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  {config.address}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-500" />
              <span>Licensed & Insured</span>
            </div>
          </div>
          
          {/* Main header */}
          <div className="flex items-center justify-between py-4">
            <div>
              <h1 className="text-xl md:text-2xl font-serif font-bold">{config.businessName}</h1>
              {config.tagline && (
                <p className="text-sm text-slate-300">{config.tagline}</p>
              )}
            </div>
            <a
              href={`tel:${config.phone.replace(/\D/g, "")}`}
              className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-sm font-bold transition-colors"
            >
              <Phone className="h-5 w-5" />
              <span className="hidden sm:inline">{config.phone}</span>
              <span className="sm:hidden">Call</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-800 to-slate-900 text-white py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 leading-tight">
              {config.heroHeadline || "Professional Roofing Services"}
            </h2>
            <p className="text-lg md:text-xl text-slate-300 mb-8">
              {config.heroSubheadline || "Quality workmanship you can trust"}
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="#contact"
                className="inline-flex items-center justify-center bg-amber-600 hover:bg-amber-500 text-white px-8 py-4 font-bold rounded-sm transition-colors"
              >
                {config.heroCta || "Get Free Estimate"}
              </a>
              <a
                href={`tel:${config.phone.replace(/\D/g, "")}`}
                className="inline-flex items-center justify-center border-2 border-white hover:bg-white hover:text-slate-900 px-8 py-4 font-bold rounded-sm transition-colors"
              >
                <Phone className="mr-2 h-5 w-5" />
                {config.phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust indicators */}
      <section className="bg-amber-600 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12 text-sm md:text-base">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              <span>25+ Years Experience</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span>Fully Licensed & Insured</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span>24/7 Emergency Service</span>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-4">
              Our Roofing Services
            </h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              From minor repairs to complete installations, we handle all your roofing needs with expertise and care.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {config.services?.map((service, i) => (
              <ServiceCard
                key={i}
                name={service.name}
                description={service.description}
                icon={service.icon}
                variant="classic"
              />
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="bg-slate-100 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-4">
                About {config.businessName}
              </h2>
              {config.yearEstablished && (
                <p className="text-amber-600 font-semibold mb-4">
                  Serving the community since {config.yearEstablished}
                </p>
              )}
              <p className="text-slate-600 leading-relaxed mb-6">
                {config.about || "We are a professional roofing company dedicated to providing quality services."}
              </p>
              <a
                href="#contact"
                className="inline-flex items-center text-amber-600 font-semibold hover:text-amber-700 transition-colors"
              >
                Contact us today →
              </a>
            </div>
            <div className="bg-slate-200 aspect-video rounded-sm flex items-center justify-center">
              <span className="text-slate-400">Company Photo</span>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      {config.serviceAreas && config.serviceAreas.length > 0 && (
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-8 text-center">
              Areas We Serve
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              {config.serviceAreas.map((area, i) => (
                <span
                  key={i}
                  className="bg-slate-100 border border-slate-200 px-4 py-2 rounded-sm text-slate-700"
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
        <section className="bg-slate-900 text-white py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {config.credentials.map((cred, i) => (
                <div key={i} className="p-4">
                  <Shield className="h-8 w-8 text-amber-500 mx-auto mb-3" />
                  <p className="font-semibold">{cred.name}</p>
                  {cred.number && (
                    <p className="text-sm text-slate-400">{cred.number}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {config.gallery && config.gallery.length > 0 && config.gallery.some(g => g.before || g.after) && (
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-8 text-center">
              Our Work
            </h2>
            <TemplateGallery items={config.gallery} variant="classic" />
          </div>
        </section>
      )}

      {/* Testimonials */}
      {config.testimonials && config.testimonials.length > 0 && (
        <section className="bg-slate-100 py-16 md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-4 text-center">
              What Our Customers Say
            </h2>
            {/* Aggregate Rating */}
            {config.testimonials.length > 0 && (() => {
              const avg = config.testimonials.reduce((s, t) => s + t.rating, 0) / config.testimonials.length;
              return (
                <div className="flex items-center justify-center gap-3 mb-8">
                  <span className="text-2xl font-bold text-slate-900">{avg.toFixed(1)}</span>
                  <div className="flex flex-col items-start">
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-5 w-5 ${i < Math.round(avg) ? "text-amber-500 fill-amber-500" : "text-gray-300"}`} />
                      ))}
                    </div>
                    <span className="text-sm text-slate-600">Based on {config.testimonials.length} review{config.testimonials.length !== 1 ? "s" : ""}</span>
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
                  variant="classic"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Blog Section */}
      {siteSlug && blogs && blogs.length > 0 && (
        <BlogSection blogs={blogs} siteSlug={siteSlug} variant="classic" />
      )}

      {/* Contact */}
      <section id="contact" className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-900 mb-4">
                Get Your Free Quote
              </h2>
              <p className="text-slate-600 mb-8">
                Ready to get started? Fill out the form and we'll get back to you within 24 hours.
              </p>
              
              <div className="space-y-4">
                <a
                  href={`tel:${config.phone.replace(/\D/g, "")}`}
                  className="flex items-center gap-3 text-slate-700 hover:text-amber-600 transition-colors"
                >
                  <Phone className="h-5 w-5 text-amber-600" />
                  {config.phone}
                </a>
                {config.email && (
                  <a
                    href={`mailto:${config.email}`}
                    className="flex items-center gap-3 text-slate-700 hover:text-amber-600 transition-colors"
                  >
                    <Mail className="h-5 w-5 text-amber-600" />
                    {config.email}
                  </a>
                )}
                {config.address && (
                  <div className="flex items-center gap-3 text-slate-700">
                    <MapPin className="h-5 w-5 text-amber-600" />
                    {config.address}
                  </div>
                )}
              </div>
            </div>
            
            <div className="bg-white border-2 border-slate-200 p-6 md:p-8 rounded-sm">
              <ContactForm siteId={siteId} variant="classic" />
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="font-serif font-bold text-xl mb-4">{config.businessName}</h3>
              <p className="text-slate-400 text-sm">
                {config.tagline || "Quality roofing services you can trust."}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <div className="space-y-2 text-sm text-slate-400">
                <p>{config.phone}</p>
                {config.email && <p>{config.email}</p>}
                {config.address && <p>{config.address}</p>}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Service Areas</h4>
              <p className="text-sm text-slate-400">
                {config.serviceAreas?.join(", ") || "Contact us for service availability"}
              </p>
            </div>
          </div>
          <div className="border-t border-slate-700 mt-8 pt-8 text-center text-sm text-slate-500">
            © {new Date().getFullYear()} {config.businessName}. All rights reserved.
          </div>
        </div>
      </footer>

      {/* Sticky call button (mobile) */}
      <ClickToCall phone={config.phone} variant="classic" />
    </div>
  );
}
