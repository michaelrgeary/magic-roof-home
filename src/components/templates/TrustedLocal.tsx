import { Phone, Mail, MapPin, Heart, Users, Award, Shield, Leaf, Star } from "lucide-react";
import type { SiteConfig } from "./types";
import { ContactForm } from "./sections/ContactForm";
import { ClickToCall } from "./sections/ClickToCall";
import { TestimonialCard } from "./sections/TestimonialCard";
import { ServiceCard } from "./sections/ServiceCard";
import { BlogSection } from "./sections/BlogSection";
import { TemplateGallery } from "@/components/gallery/TemplateGallery";
import { getLocalizedText, type Language } from "@/lib/i18n";
import { getUITranslation } from "@/lib/translations";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  meta_description: string | null;
  published_at: string | null;
  created_at: string;
}

interface TrustedLocalProps {
  config: SiteConfig;
  siteId?: string;
  siteSlug?: string;
  isPreview?: boolean;
  blogs?: BlogPost[];
  language?: Language;
}

export default function TrustedLocal({ config, siteId, siteSlug, isPreview, blogs, language = 'en' }: TrustedLocalProps) {
  const t = (section: Parameters<typeof getUITranslation>[1], key: Parameters<typeof getUITranslation>[2]) => 
    getUITranslation(language, section, key);

  return (
    <div className="min-h-screen bg-stone-50 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-700 rounded-full flex items-center justify-center">
                <Leaf className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-stone-800">{config.businessName}</h1>
                {config.tagline && (
                  <p className="text-xs text-stone-500 hidden sm:block">{getLocalizedText(config.tagline, language)}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <a
                href={`tel:${config.phone.replace(/\D/g, "")}`}
                className="hidden md:flex items-center gap-2 text-green-700 font-semibold hover:text-green-800 transition-colors"
              >
                <Phone className="h-4 w-4" />
                {config.phone}
              </a>
              <a
                href="#contact"
                className="bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-full font-medium transition-colors"
              >
                {t('nav', 'freeQuote')}
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-b from-green-50 to-stone-50 py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Heart className="h-4 w-4" />
              {t('hero', 'locallyOwned')}
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-stone-800 mb-6 leading-tight">
              {getLocalizedText(config.heroHeadline, language) || t('sections', 'familyBusinessTitle')}
            </h2>
            <p className="text-lg text-stone-600 mb-8">
              {getLocalizedText(config.heroSubheadline, language) || t('footer', 'familyPromise')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#contact"
                className="inline-flex items-center justify-center bg-green-700 hover:bg-green-800 text-white px-8 py-4 rounded-full font-semibold transition-colors"
              >
                {getLocalizedText(config.heroCta, language) || t('contact', 'getYourFreeQuote')}
              </a>
              <a
                href={`tel:${config.phone.replace(/\D/g, "")}`}
                className="inline-flex items-center justify-center border-2 border-stone-300 hover:border-green-700 text-stone-700 px-8 py-4 rounded-full font-semibold transition-colors"
              >
                <Phone className="mr-2 h-5 w-5" />
                {t('nav', 'callUsNow')}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Trust indicators */}
      <section className="bg-white py-8 border-y border-stone-200">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center gap-2">
              <Users className="h-8 w-8 text-green-600" />
              <p className="text-sm text-stone-600">{t('badges', 'familyOwned')}</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Shield className="h-8 w-8 text-green-600" />
              <p className="text-sm text-stone-600">{t('badges', 'fullyInsured')}</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Award className="h-8 w-8 text-green-600" />
              <p className="text-sm text-stone-600">{t('badges', 'licensedPro')}</p>
            </div>
            <div className="flex flex-col items-center gap-2">
              <Heart className="h-8 w-8 text-green-600" />
              <p className="text-sm text-stone-600">{t('badges', 'communityFirst')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials (featured first for trust) */}
      {config.testimonials && config.testimonials.length > 0 && (
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-4">
                {t('sections', 'whatNeighborsSay')}
              </h2>
              <p className="text-stone-600 mb-4">
                {t('sections', 'neighborsSayDescription')}
              </p>
              {/* Aggregate Rating */}
              {config.testimonials.length > 0 && (() => {
                const avg = config.testimonials.reduce((s, t) => s + t.rating, 0) / config.testimonials.length;
                return (
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-2xl font-bold text-stone-800">{avg.toFixed(1)}</span>
                    <div className="flex flex-col items-start">
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-5 w-5 ${i < Math.round(avg) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
                        ))}
                      </div>
                      <span className="text-sm text-stone-600">
                        {t('sections', 'basedOnReviews')} {config.testimonials.length} {config.testimonials.length !== 1 ? t('sections', 'reviews_plural') : t('sections', 'review')}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {config.testimonials.map((testimonial, i) => (
                <TestimonialCard
                  key={i}
                  name={testimonial.name}
                  text={testimonial.text}
                  rating={testimonial.rating}
                  location={testimonial.location}
                  variant="trusted"
                  language={language}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Services */}
      <section className="py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-4">
              {t('sections', 'howWeCanHelp')}
            </h2>
            <p className="text-stone-600 max-w-xl mx-auto">
              {t('sections', 'howWeCanHelpDescription')}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {config.services?.map((service, i) => (
              <ServiceCard
                key={i}
                name={service.name}
                description={service.description}
                icon={service.icon}
                variant="trusted"
                language={language}
              />
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-16 md:py-20 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1">
              <p className="text-green-700 font-semibold mb-2">{t('sections', 'ourStory')}</p>
              <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-4">
                {t('sections', 'familyBusinessTitle')}
              </h2>
              {config.yearEstablished && (
                <p className="text-stone-500 mb-4">
                  {t('sections', 'servingFamilies')} {config.yearEstablished}
                </p>
              )}
              <p className="text-stone-600 leading-relaxed mb-6">
                {getLocalizedText(config.about, language) || t('footer', 'familyPromise')}
              </p>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-stone-200 rounded-full" />
                <div>
                  <p className="font-semibold text-stone-800">The Smith Family</p>
                  <p className="text-sm text-stone-500">Owners & Operators</p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 bg-stone-200 aspect-video rounded-2xl flex items-center justify-center">
              <span className="text-stone-400">Family Photo</span>
            </div>
          </div>
        </div>
      </section>

      {/* Service Areas */}
      {config.serviceAreas && config.serviceAreas.length > 0 && (
        <section className="py-16 md:py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-4">
                {t('sections', 'proudlyServing')}
              </h2>
              <p className="text-stone-600">
                {t('sections', 'proudlyServingDescription')}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              {config.serviceAreas.map((area, i) => (
                <span
                  key={i}
                  className="bg-green-50 text-green-800 px-5 py-2 rounded-full text-sm font-medium border border-green-200"
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
        <section className="py-12 bg-stone-800 text-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {config.credentials.map((cred, i) => (
                <div key={i} className="p-4">
                  <Shield className="h-8 w-8 text-green-400 mx-auto mb-3" />
                  <p className="font-medium text-sm">{cred.name}</p>
                  {cred.number && (
                    <p className="text-xs text-stone-400 mt-1">{cred.number}</p>
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
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-4">
                {t('sections', 'ourRecentProjects')}
              </h2>
              <p className="text-stone-600">
                {t('sections', 'recentProjectsDescription')}
              </p>
            </div>
            <TemplateGallery items={config.gallery} variant="trusted" />
          </div>
        </section>
      )}

      {/* Blog Section */}
      {siteSlug && blogs && blogs.length > 0 && (
        <BlogSection blogs={blogs} siteSlug={siteSlug} variant="trusted" />
      )}

      {/* Contact */}
      <section id="contact" className="py-16 md:py-20 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-stone-800 mb-4">
                {t('contact', 'letsChat')}
              </h2>
              <p className="text-stone-600">
                {t('contact', 'letsChatDescription')}
              </p>
            </div>
            
            <div className="grid md:grid-cols-5 gap-8">
              <div className="md:col-span-2 space-y-6">
                <a
                  href={`tel:${config.phone.replace(/\D/g, "")}`}
                  className="flex items-center gap-3 bg-white p-4 rounded-xl border border-stone-200 hover:border-green-500 transition-colors"
                >
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Phone className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-500">{t('contact', 'callUs')}</p>
                    <p className="font-semibold text-stone-800">{config.phone}</p>
                  </div>
                </a>
                
                {config.email && (
                  <a
                    href={`mailto:${config.email}`}
                    className="flex items-center gap-3 bg-white p-4 rounded-xl border border-stone-200 hover:border-green-500 transition-colors"
                  >
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <Mail className="h-5 w-5 text-green-700" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">{t('contact', 'emailUs')}</p>
                      <p className="font-semibold text-stone-800">{config.email}</p>
                    </div>
                  </a>
                )}
                
                {config.address && (
                  <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-stone-200">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-green-700" />
                    </div>
                    <div>
                      <p className="text-xs text-stone-500">{t('contact', 'visitUs')}</p>
                      <p className="font-semibold text-stone-800 text-sm">{config.address}</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="md:col-span-3 bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-stone-200">
                <ContactForm siteId={siteId} variant="trusted" language={language} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                  <Leaf className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold">{config.businessName}</span>
              </div>
              <p className="text-stone-400 text-sm">
                {t('footer', 'familyPromise')}
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('footer', 'contact')}</h4>
              <div className="space-y-2 text-sm text-stone-400">
                <p>{config.phone}</p>
                {config.email && <p>{config.email}</p>}
                {config.address && <p>{config.address}</p>}
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-4">{t('footer', 'servingAreas')}</h4>
              <p className="text-sm text-stone-400">
                {config.serviceAreas?.slice(0, 4).join(", ")}
                {(config.serviceAreas?.length || 0) > 4 && " & more"}
              </p>
            </div>
          </div>
          <div className="border-t border-stone-700 mt-8 pt-8 text-center text-sm text-stone-500">
            © {new Date().getFullYear()} {config.businessName}. {t('footer', 'allRightsReserved')} {t('footer', 'madeWithLove')}
          </div>
        </div>
      </footer>

      {/* Sticky call button (mobile) */}
      <ClickToCall phone={config.phone} variant="trusted" />
    </div>
  );
}
