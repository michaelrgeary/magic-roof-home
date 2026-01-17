// Site configuration interface for template rendering
export interface SiteConfig {
  // Business info
  businessName: string;
  tagline?: string;
  phone: string;
  email?: string;
  address?: string;
  
  // Hero section
  heroHeadline?: string;
  heroSubheadline?: string;
  heroCta?: string;
  heroImage?: string;
  
  // Services
  services?: Array<{
    name: string;
    description: string;
    icon?: string;
  }>;
  
  // About
  about?: string;
  aboutImage?: string;
  yearEstablished?: string;
  
  // Service areas
  serviceAreas?: string[];
  
  // Credentials
  credentials?: Array<{
    name: string;
    number?: string;
  }>;
  
  // Gallery
  gallery?: Array<{
    before?: string;
    after?: string;
    caption?: string;
  }>;
  
  // Testimonials
  testimonials?: Array<{
    name: string;
    text: string;
    rating: number;
    location?: string;
  }>;
  
  // Branding
  logo?: string;
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
  
  // Social
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    google?: string;
  };
}

// Sample config for preview/testing
export const sampleConfig: SiteConfig = {
  businessName: "Premier Roofing Co.",
  tagline: "Quality Roofing You Can Trust",
  phone: "(555) 123-4567",
  email: "info@premierroofing.com",
  address: "123 Main Street, Springfield, IL 62701",
  
  heroHeadline: "Protect Your Home With Expert Roofing",
  heroSubheadline: "Licensed & insured professionals serving the Springfield area for over 25 years",
  heroCta: "Get Your Free Quote",
  
  services: [
    { name: "Roof Repairs", description: "Fast, reliable repairs for leaks, storm damage, and wear", icon: "wrench" },
    { name: "New Installation", description: "Complete roof installation with premium materials", icon: "home" },
    { name: "Inspections", description: "Thorough inspections to catch problems early", icon: "search" },
    { name: "Storm Damage", description: "24/7 emergency response for storm damage", icon: "cloud-lightning" },
  ],
  
  about: "Founded in 1998, Premier Roofing Co. has been the trusted choice for homeowners and businesses in the Springfield area. Our team of certified professionals takes pride in delivering exceptional craftsmanship and outstanding customer service on every project.",
  yearEstablished: "1998",
  
  serviceAreas: ["Springfield", "Chatham", "Rochester", "Sherman", "Williamsville", "Auburn", "Riverton"],
  
  credentials: [
    { name: "Licensed Roofing Contractor", number: "IL-12345" },
    { name: "GAF Master Elite Certified" },
    { name: "BBB A+ Rating" },
    { name: "Fully Insured & Bonded" },
  ],
  
  gallery: [
    { before: "", after: "", caption: "Complete shingle replacement - Oak Park residence" },
    { before: "", after: "", caption: "Storm damage repair - Commercial building" },
    { before: "", after: "", caption: "New construction installation" },
  ],
  
  testimonials: [
    { name: "John M.", text: "Excellent work! They replaced our entire roof in just two days. Very professional team.", rating: 5, location: "Springfield" },
    { name: "Sarah K.", text: "Quick response to our emergency call after the storm. Highly recommend!", rating: 5, location: "Chatham" },
    { name: "Mike R.", text: "Fair pricing and quality workmanship. Our roof looks amazing.", rating: 5, location: "Rochester" },
  ],
};
