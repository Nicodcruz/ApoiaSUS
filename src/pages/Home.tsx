import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, HandHeart, Shield, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

interface Institution {
  id: string;
  name: string;
  description: string;
  image_url: string | null;
}

const FALLBACK_HERO = "public/img/Zé_gotinha.png";

const Home = () => {
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroImageUrl, setHeroImageUrl] = useState<string>(FALLBACK_HERO);
  const [heroLoading, setHeroLoading] = useState(true);

  useEffect(() => {
    document.title = "ApoiaSUS — Faça a diferença com sua doação";

    // Busca instituições
    supabase
      .from("institutions")
      .select("id, name, description, image_url")
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        setInstitutions(data ?? []);
        setLoading(false);
      });

    // Busca imagem hero — cast para any para contornar tipagem enquanto a tabela
    // ainda não está sincronizada pelo CLI do Supabase
    (supabase as any)
      .from("site_config")
      .select("hero_image_url")
      .eq("id", "default")
      .maybeSingle()
      .then(({ data, error }: { data: { hero_image_url: string | null } | null; error: unknown }) => {
        if (!error && data?.hero_image_url) {
          setHeroImageUrl(data.hero_image_url);
        }
        setHeroLoading(false);
      });
  }, []);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero text-primary-foreground">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="container relative grid gap-12 py-20 md:grid-cols-2 md:py-32">
          <div className="flex flex-col justify-center animate-fade-in-up">
            <span className="mb-6 inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
              <Sparkles className="h-4 w-4" /> Plataforma oficial de apoio
            </span>
            <h1 className="font-display text-4xl font-bold leading-tight md:text-6xl">
              Faça a diferença <br /> com sua{" "}
              <span className="text-accent-glow">doação</span>
            </h1>
            <p className="mt-6 max-w-lg text-lg text-primary-foreground/80">
              Conectamos doadores a instituições de saúde que transformam a vida
              de milhares de brasileiros todos os dias.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                asChild
                size="lg"
                className="bg-accent hover:bg-accent/90 text-accent-foreground shadow-accent rounded-xl text-base"
              >
                <Link to="/instituicoes">
                  Doar agora <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-xl border-white/30 bg-white/10 text-primary-foreground hover:bg-white/20 hover:text-primary-foreground"
              >
                <Link to="/sobre">Conheça o ApoiaSUS</Link>
              </Button>
            </div>
            <div className="mt-12 grid grid-cols-3 gap-6" />
          </div>

          {/* Imagem hero */}
          <div className="hidden md:flex items-center justify-center animate-float">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-accent/30 blur-3xl" />
              {heroLoading ? (
                <Skeleton className="relative w-full max-w-md h-80 rounded-3xl" />
              ) : (
                <img
                  src={heroImageUrl}
                  alt="Imagem principal da campanha"
                  className="relative w-full max-w-md rounded-3xl object-cover shadow-elegant"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = FALLBACK_HERO;
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Sobre a campanha */}
      <section className="container py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Pequenas Atitudes, Grandes Mudanças
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            O ApoiaSUS reúne instituições que dependem da generosidade de
            pessoas como você para continuar oferecendo saúde, acolhimento e
            dignidade. Cada real doado se transforma em cuidado real.
          </p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Shield,
              title: "100% Seguro",
              desc: "Pagamentos criptografados e dados protegidos.",
            },
            {
              icon: HandHeart,
              title: "Impacto Real",
              desc: "Acompanhe o destino de cada contribuição.",
            },
            {
              icon: Users,
              title: "Comunidade",
              desc: "Junte-se a milhares de apoiadores.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-2xl border bg-card p-8 shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-elegant"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
                <f.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="font-display text-xl font-semibold">{f.title}</h3>
              <p className="mt-2 text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Instituições */}
      <section id="instituicoes" className="bg-secondary/30 py-20">
        <div className="container">
          <div className="mb-12 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h2 className="font-display text-3xl font-bold md:text-4xl">
                Instituições parceiras
              </h2>
              <p className="mt-2 text-muted-foreground">
                Escolha uma causa para apoiar agora mesmo.
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-xl">
              <Link to="/instituicoes">
                Ver todas <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading
              ? [1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-96 rounded-2xl" />
                ))
              : institutions.map((inst) => (
                  <article
                    key={inst.id}
                    className="group overflow-hidden rounded-2xl border bg-card shadow-soft transition-smooth hover:-translate-y-1 hover:shadow-elegant"
                  >
                    <div className="aspect-[16/10] overflow-hidden">
                      <img
                        src={inst.image_url ?? ""}
                        alt={inst.name}
                        className="h-full w-full object-cover transition-smooth group-hover:scale-105"
                      />
                    </div>
                    <div className="p-6">
                      <h3 className="font-display text-xl font-semibold">
                        {inst.name}
                      </h3>
                      <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                        {inst.description}
                      </p>
                      <Button
                        asChild
                        variant="ghost"
                        className="mt-4 px-0 text-primary hover:bg-transparent"
                      >
                        <Link to={`/instituicoes/${inst.id}`}>
                          Saiba mais <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </article>
                ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container py-20">
        <div className="relative overflow-hidden rounded-3xl gradient-primary p-12 text-center text-primary-foreground md:p-16">
          <h2 className="font-display text-3xl font-bold md:text-4xl">
            Sua doação salva vidas
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-primary-foreground/80">
            Em poucos cliques, você pode mudar a história de uma família.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground shadow-accent"
          >
            <Link to="/instituicoes">Quero doar agora</Link>
          </Button>
        </div>
      </section>
    </>
  );
};

export default Home;