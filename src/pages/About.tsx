import { Heart, Shield, Users } from "lucide-react";

const About = () => {
  return (
    <div className="container py-12 md:py-20">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-display text-4xl font-bold md:text-5xl">Sobre o ApoiaSUS</h1>
        <p className="mt-6 text-lg text-muted-foreground">
          O ApoiaSUS é uma plataforma criada para conectar pessoas generosas a instituições de saúde que dependem da solidariedade para continuar suas missões. Acreditamos que a saúde é um direito de todos e que pequenos gestos podem gerar grandes transformações.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {[
            { icon: Heart, title: "Propósito", text: "Apoiar instituições brasileiras que cuidam de quem mais precisa." },
            { icon: Shield, title: "Transparência", text: "Cada centavo é rastreado e enviado integralmente à causa escolhida." },
            { icon: Users, title: "Comunidade", text: "Uma rede ativa de doadores, voluntários e instituições parceiras." },
          ].map((v) => (
            <div key={v.title} className="rounded-2xl border bg-card p-6 shadow-soft">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
                <v.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <h3 className="font-display text-lg font-semibold">{v.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{v.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl gradient-soft border p-8">
          <h2 className="font-display text-2xl font-bold">Como funciona</h2>
          <ol className="mt-4 space-y-3 text-muted-foreground">
            <li><strong className="text-foreground">1.</strong> Escolha uma instituição parceira.</li>
            <li><strong className="text-foreground">2.</strong> Defina o valor e a forma de pagamento.</li>
            <li><strong className="text-foreground">3.</strong> Acompanhe o impacto da sua contribuição.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default About;
