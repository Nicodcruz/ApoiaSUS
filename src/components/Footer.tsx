import { Heart } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border/40 bg-secondary/30">
    <div className="container flex flex-col items-center justify-between gap-4 py-8 md:flex-row">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>© {new Date().getFullYear()} ApoiaSUS - Plataforma de doações para instituições de saúde do Brasil.</span>
      </div>
      <div className="text-sm text-muted-foreground">
        
      </div>
    </div>
  </footer>
);

export default Footer;
