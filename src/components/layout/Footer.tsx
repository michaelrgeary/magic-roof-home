import { Link } from "react-router-dom";
import { Home } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold mb-4">
              <Home className="h-6 w-6 text-primary" />
              <span>RoofSites</span>
            </Link>
            <p className="text-muted-foreground max-w-xs">
              Professional websites for roofing contractors. Build trust, get leads, grow your business.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#features" className="hover:text-foreground transition-colors">Features</Link></li>
              <li><Link to="#pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">Templates</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="#" className="hover:text-foreground transition-colors">About</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">Contact</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">Privacy</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} RoofSites. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
