import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
  isAuthenticated?: boolean;
  onSignOut?: () => void;
  hideFooter?: boolean;
}

export function Layout({ children, isAuthenticated, onSignOut, hideFooter }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header isAuthenticated={isAuthenticated} onSignOut={onSignOut} />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
    </div>
  );
}
