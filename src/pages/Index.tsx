import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  ArrowRight, 
  Globe, 
  Zap, 
  Shield, 
  BarChart3, 
  Smartphone, 
  Palette,
  CheckCircle
} from "lucide-react";

export default function Index() {
  const { isAuthenticated, signOut, loading } = useAuth();

  const features = [
    {
      icon: Globe,
      title: "Professional Templates",
      description: "Industry-specific designs built for roofing contractors that convert visitors to leads.",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized for speed so you never lose a potential customer to slow loading times.",
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with 99.9% uptime guarantee for peace of mind.",
    },
    {
      icon: BarChart3,
      title: "Lead Tracking",
      description: "Built-in analytics and lead management to help you grow your business.",
    },
    {
      icon: Smartphone,
      title: "Mobile First",
      description: "Responsive designs that look great on phones, tablets, and desktops.",
    },
    {
      icon: Palette,
      title: "Easy Customization",
      description: "No coding required. Customize colors, content, and layout with simple tools.",
    },
  ];

  const benefits = [
    "No technical skills required",
    "Launch in under 30 minutes",
    "SEO optimized for local search",
    "Free SSL certificate included",
    "24/7 customer support",
    "Money-back guarantee",
  ];

  if (loading) {
    return null;
  }

  return (
    <Layout isAuthenticated={isAuthenticated} onSignOut={signOut}>
      {/* Hero Section */}
      <section className="hero-section text-primary-foreground py-20 md:py-32">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-balance">
              Build a Website That Gets You More Roofing Jobs
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Professional websites designed specifically for roofing contractors. 
              No coding required. Get online and start generating leads today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to={isAuthenticated ? "/dashboard" : "/auth"}>
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8">
                  {isAuthenticated ? "Go to Dashboard" : "Get Started"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <a href="/#features">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-lg px-8">
                  View Templates
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28">
        <div className="container">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything You Need to Succeed Online
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built specifically for roofing professionals, with features that help you win more jobs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card 
                key={feature.title} 
                className="card-elevated border-0"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-28 bg-muted/50">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Roofing Contractors Choose RoofSites
              </h2>
              <p className="text-muted-foreground text-lg mb-8">
                We understand the roofing industry. Our platform is built to help you establish 
                credibility, showcase your work, and convert visitors into paying customers.
              </p>
              <ul className="space-y-4">
                {benefits.map((benefit) => (
                  <li key={benefit} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 md:p-12">
              <div className="text-center space-y-4">
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  Get Started Today
                </p>
                <p className="text-4xl md:text-5xl font-bold">
                  Plans from $29/mo
                </p>
                <p className="text-muted-foreground">
                  Cancel anytime
                </p>
                <Link to={isAuthenticated ? "/dashboard" : "/auth"}>
                  <Button size="lg" className="w-full">
                    {isAuthenticated ? "Go to Dashboard" : "Get Started"}
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-28">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Grow Your Roofing Business?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
            Join hundreds of roofing contractors who use RoofSites to get more leads and close more deals.
          </p>
          <Link to={isAuthenticated ? "/dashboard" : "/auth"}>
            <Button size="lg" className="text-lg px-8">
              {isAuthenticated ? "Go to Dashboard" : "Get Started"}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
