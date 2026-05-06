import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Institution {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
}

const Institutions = () => {
  const [items, setItems] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Instituições — ApoiaSUS";
    supabase
      .from("institutions")
      .select("id, name, description, image_url")
      .order("created_at")
      .then(({ data }) => {
        setItems(data ?? []);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container py-12 md:py-20">
      <header className="mb-12 max-w-2xl">
        <h1 className="font-display text-4xl font-bold md:text-5xl">Instituições</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Conheça as organizações que estão transformando vidas e escolha como contribuir.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {loading
          ? [1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-96 rounded-2xl" />)
          : items.map((inst) => (
              <article key={inst.id} className="group overflow-hidden rounded-2xl border bg-card shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-elegant">
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={inst.image_url ?? ""} alt={inst.name} className="h-full w-full object-cover transition-smooth group-hover:scale-105" />
                </div>
                <div className="p-6">
                  <h2 className="font-display text-xl font-semibold">{inst.name}</h2>
                  <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{inst.description}</p>
                  <div className="mt-5 flex gap-2">
                    <Button asChild variant="outline" className="flex-1 rounded-xl">
                      <Link to={`/instituicoes/${inst.id}`}>Saiba mais</Link>
                    </Button>
                    <Button asChild className="flex-1 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground">
                      <Link to={`/doar/${inst.id}`}>Doar <ArrowRight className="ml-1 h-4 w-4" /></Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
      </div>
    </div>
  );
};

export default Institutions;
