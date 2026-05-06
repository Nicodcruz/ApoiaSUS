import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Heart, Sparkles, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Institution {
  id: string;
  name: string;
  description: string;
  mission: string | null;
  impact: string | null;
  image_url: string | null;
}

const InstitutionDetail = () => {
  const { id } = useParams();
  const [inst, setInst] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    supabase
      .from("institutions")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setInst(data as Institution | null);
        setLoading(false);
        if (data) document.title = `${data.name} — ApoiaSUS`;
      });
  }, [id]);

  if (loading) return <div className="container py-12"><Skeleton className="h-96 rounded-2xl" /></div>;
  if (!inst) return <div className="container py-20 text-center">Instituição não encontrada.</div>;

  return (
    <article>
      <div className="relative h-72 w-full overflow-hidden md:h-96">
        <img src={inst.image_url ?? ""} alt={inst.name} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="container -mt-20 relative">
        <div className="rounded-3xl border bg-card p-8 shadow-elegant md:p-12">
          <h1 className="font-display text-3xl font-bold md:text-5xl">{inst.name}</h1>
          <p className="mt-4 text-lg text-muted-foreground">{inst.description}</p>

          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {inst.mission && (
              <div className="rounded-2xl border bg-secondary/30 p-6">
                <div className="mb-3 flex items-center gap-2 text-primary">
                  <Target className="h-5 w-5" />
                  <h2 className="font-display text-lg font-semibold">Missão</h2>
                </div>
                <p className="text-muted-foreground">{inst.mission}</p>
              </div>
            )}
            {inst.impact && (
              <div className="rounded-2xl border bg-secondary/30 p-6">
                <div className="mb-3 flex items-center gap-2 text-accent">
                  <Sparkles className="h-5 w-5" />
                  <h2 className="font-display text-lg font-semibold">Impacto</h2>
                </div>
                <p className="text-muted-foreground">{inst.impact}</p>
              </div>
            )}
          </div>

          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button asChild size="lg" className="rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground shadow-accent">
              <Link to={`/doar/${inst.id}`}>
                <Heart className="mr-2 h-5 w-5" fill="currentColor" /> Doar agora
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl">
              <Link to="/instituicoes">Ver outras instituições <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="h-20" />
    </article>
  );
};

export default InstitutionDetail;
