import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Heart, Sparkles, Target, Award, ChevronDown } from "lucide-react";
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
  certification_url: string | null;
}

/** Desktop: 2 linhas com "Ver mais..." */
const ExpandableCard = ({
  icon,
  iconClass,
  title,
  content,
}: {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  content: string;
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-2xl border bg-secondary/30 p-6">
      <div className={`mb-3 flex items-center gap-2 ${iconClass}`}>
        {icon}
        <h2 className="font-display text-lg font-semibold">{title}</h2>
      </div>
      <p
        className="text-muted-foreground transition-all duration-300"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: expanded ? "unset" : 2,
          WebkitBoxOrient: "vertical",
          overflow: expanded ? "visible" : "hidden",
        }}
      >
        {content}
      </p>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="mt-2 text-sm font-medium text-primary hover:underline focus:outline-none"
      >
        {expanded ? "Ver menos" : "Ver mais..."}
      </button>
    </div>
  );
};

/** Mobile: accordion suspense */
const AccordionCard = ({
  icon,
  iconClass,
  title,
  content,
}: {
  icon: React.ReactNode;
  iconClass: string;
  title: string;
  content: string;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border bg-secondary/30 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 p-6 text-left cursor-pointer"
      >
        <div className={`flex items-center gap-2 ${iconClass}`}>
          {icon}
          <h2 className="font-display text-lg font-semibold">{title}</h2>
        </div>
        <ChevronDown
          className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-300"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: open ? "500px" : "0px", opacity: open ? 1 : 0 }}
      >
        <p className="px-6 pb-6 text-muted-foreground">{content}</p>
      </div>
    </div>
  );
};

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

  if (loading)
    return (
      <div className="container py-12">
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  if (!inst)
    return (
      <div className="container py-20 text-center">
        Instituição não encontrada.
      </div>
    );

  return (
    <article>
      <div className="relative h-72 w-full overflow-hidden md:h-96">
        <img
          src={inst.image_url ?? ""}
          alt={inst.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
      </div>

      <div className="container -mt-20 relative">
        <div className="rounded-3xl border bg-card p-8 shadow-elegant md:p-12">

          {/* Título centralizado, descrição alinhada à esquerda */}
          <div>
            <h1 className="font-display text-3xl font-bold md:text-5xl text-center">
              {inst.name}
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {inst.description}
            </p>
          </div>

          {/* Desktop: 2 linhas + "Ver mais..." */}
          {(inst.mission || inst.impact) && (
            <div className="hidden md:grid mt-10 gap-6 md:grid-cols-2">
              {inst.mission && (
                <ExpandableCard
                  icon={<Target className="h-5 w-5" />}
                  iconClass="text-primary"
                  title="Missão"
                  content={inst.mission}
                />
              )}
              {inst.impact && (
                <ExpandableCard
                  icon={<Sparkles className="h-5 w-5" />}
                  iconClass="text-accent"
                  title="Impacto"
                  content={inst.impact}
                />
              )}
            </div>
          )}

          {/* Mobile: accordion */}
          {(inst.mission || inst.impact) && (
            <div className="flex md:hidden mt-10 flex-col gap-4">
              {inst.mission && (
                <AccordionCard
                  icon={<Target className="h-5 w-5 shrink-0" />}
                  iconClass="text-primary"
                  title="Missão"
                  content={inst.mission}
                />
              )}
              {inst.impact && (
                <AccordionCard
                  icon={<Sparkles className="h-5 w-5 shrink-0" />}
                  iconClass="text-accent"
                  title="Impacto"
                  content={inst.impact}
                />
              )}
            </div>
          )}

          {/* Certificação — sempre visível */}
          {inst.certification_url && (
            <div className="mt-8 rounded-2xl border bg-secondary/30 p-6">
              <div className="mb-4 flex items-center gap-2 text-primary">
                <Award className="h-5 w-5" />
                <h2 className="font-display text-lg font-semibold">Certificação</h2>
              </div>
              <div className="flex justify-center">
                <img
                  src={inst.certification_url}
                  alt={`Certificação de ${inst.name}`}
                  className="max-h-64 w-auto rounded-xl object-contain shadow-md"
                />
              </div>
            </div>
          )}

          {/* Botões de ação centralizados */}
          <div className="mt-10 flex flex-col gap-4 sm:flex-row justify-center">
            <Button
              asChild
              size="lg"
              className="rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground shadow-accent"
            >
              <Link to={`/doar/${inst.id}`}>
                <Heart className="mr-2 h-5 w-5" fill="currentColor" /> Doar agora
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-xl">
              <Link to="/instituicoes">
                Ver outras instituições <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="h-20" />
    </article>
  );
};

export default InstitutionDetail;