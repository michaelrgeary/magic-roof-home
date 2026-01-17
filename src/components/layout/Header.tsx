import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Home, Menu, X, Users, FileText } from "lucide-react";
import { useState } from "react";
import { useAllLeads } from "@/hooks/useLeads";
import { useAllBlogs } from "@/hooks/useBlogs";

interface HeaderProps {
  isAuthenticated?: boolean;
  onSignOut?: () => void;
}

export function Header({ isAuthenticated, onSignOut }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: allLeads } = useAllLeads();
  const { blogs } = useAllBlogs();
  const newLeadsCount = allLeads?.filter(l => l.status === "new").length ?? 0;
  const draftBlogsCount = blogs?.filter(b => !b.published).length ?? 0;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <Home className="h-6 w-6 text-primary" />
          <span>RoofSites</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <a href="/#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Features
          </a>
          <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          
          {isAuthenticated ? (
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="sm">Dashboard</Button>
              </Link>
              <Link to="/leads" className="relative">
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  Leads
                  {newLeadsCount > 0 && (
                    <Badge variant="default" className="ml-1 h-5 min-w-[20px] px-1.5 text-xs">
                      {newLeadsCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Link to="/blogs" className="relative">
                <Button variant="ghost" size="sm" className="flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Blogs
                  {draftBlogsCount > 0 && (
                    <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-xs">
                      {draftBlogsCount}
                    </Badge>
                  )}
                </Button>
              </Link>
              <Button variant="outline" size="sm" onClick={onSignOut}>
                Sign Out
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button size="sm">Get Started</Button>
            </Link>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container py-4 flex flex-col gap-4">
            <Link 
              to="/" 
              className="text-sm font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <a 
              href="/#features" 
              className="text-sm font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <Link 
              to="/pricing" 
              className="text-sm font-medium py-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
                </Link>
                <Link to="/leads" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Leads
                    {newLeadsCount > 0 && (
                      <Badge variant="default" className="ml-1 h-5 min-w-[20px] px-1.5 text-xs">
                        {newLeadsCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <Link to="/blogs" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Blogs
                    {draftBlogsCount > 0 && (
                      <Badge variant="secondary" className="ml-1 h-5 min-w-[20px] px-1.5 text-xs">
                        {draftBlogsCount}
                      </Badge>
                    )}
                  </Button>
                </Link>
                <Button variant="outline" onClick={onSignOut} className="w-full">
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full">Get Started</Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
