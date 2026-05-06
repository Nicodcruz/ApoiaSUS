import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { CheckCircle2, CreditCard, FileText, Heart, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface Institution {
  id: string;
  name: string;
  image_url: string | null;
}

const PRESETS = [30, 50, 150, 300, 500];

const PAYMENT_METHODS = [
  { id: "pix", label: "Pix", icon: Wallet },
  { id: "credit_card", label: "Cartão de Crédito", icon: CreditCard },
  { id: "paypal", label: "PayPal", icon: Wallet },
  { id: "boleto", label: "Boleto", icon: FileText },
] as const;

const schema = z.object({
  email: z.string().trim().email("E-mail inválido").max(255),
  donor_name: z.string().trim().min(2, "Informe seu nome").max(120),
  cpf_cnpj: z.string().trim().min(11, "CPF/CNPJ inválido").max(20),
  country: z.string().trim().min(2).max(60),
  phone: z.string().trim().min(8).max(30),
  amount: z.number().positive("Selecione um valor"),
});

const Donate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inst, setInst] = useState<Institution | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [coverFee, setCoverFee] = useState(false);
  const [isMonthly, setIsMonthly] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [form, setForm] = useState({
    email: "",
    donor_name: "",
    cpf_cnpj: "",
    country: "Brasil",
    phone: "",
  });

  useEffect(() => {
    if (!id) return;
    supabase
      .from("institutions")
      .select("id, name, image_url")
      .eq("id", id)
      .maybeSingle()
      .then(({ data }) => {
        setInst(data as Institution | null);
        setLoading(false);
        if (data) document.title = `Doar para ${data.name} — ApoiaSUS`;
      });
  }, [id]);

  const finalAmount = (() => {
    const base = customAmount ? parseFloat(customAmount.replace(",", ".")) : amount;
    if (!base || isNaN(base)) return 0;
    return coverFee ? +(base * 1.05).toFixed(2) : base;
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    const parsed = schema.safeParse({ ...form, amount: finalAmount });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from("donations").insert({
      donor_name: parsed.data.donor_name,
      email: parsed.data.email,
      cpf_cnpj: parsed.data.cpf_cnpj,
      country: parsed.data.country,
      phone: parsed.data.phone,
      amount: parsed.data.amount,
      institution_id: id,
      payment_method: paymentMethod,
      is_anonymous: isAnonymous,
      is_monthly: isMonthly,
      cover_fee: coverFee,
    });
    setSubmitting(false);

    if (error) {
      toast.error("Não foi possível processar sua doação. Tente novamente.");
      return;
    }
    setSuccess(true);
    toast.success("Doação realizada com sucesso!");
  };

  if (loading) return <div className="container py-12"><Skeleton className="h-96 rounded-2xl" /></div>;
  if (!inst) return <div className="container py-20 text-center">Instituição não encontrada.</div>;

  if (success) {
    return (
      <div className="container py-20">
        <div className="mx-auto max-w-xl rounded-3xl border bg-card p-10 text-center shadow-elegant">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full gradient-accent">
            <CheckCircle2 className="h-9 w-9 text-accent-foreground" />
          </div>
          <h1 className="font-display text-3xl font-bold">Obrigado pela sua doação!</h1>
          <p className="mt-4 text-muted-foreground">
            Sua contribuição de <strong className="text-foreground">R$ {finalAmount.toFixed(2).replace(".", ",")}</strong> para <strong className="text-foreground">{inst.name}</strong> foi registrada. Você está fazendo a diferença na vida de muitas pessoas. 💚
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild className="rounded-xl">
              <Link to="/">Voltar ao início</Link>
            </Button>
            <Button asChild variant="outline" className="rounded-xl" onClick={() => navigate(0)}>
              <Link to="/instituicoes">Apoiar outra causa</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12 md:py-16">
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Form */}
        <div className="space-y-8">
          <div>
            <Link to={`/instituicoes/${inst.id}`} className="text-sm text-muted-foreground hover:text-primary">← Voltar</Link>
            <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">
              Doar para <span className="text-gradient">{inst.name}</span>
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Valor */}
            <section className="rounded-2xl border bg-card p-6 shadow-soft md:p-8">
              <h2 className="font-display text-xl font-semibold">1. Escolha o valor</h2>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
                {PRESETS.map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => { setAmount(v); setCustomAmount(""); }}
                    className={`rounded-xl border-2 px-4 py-4 font-display font-semibold transition-smooth ${
                      !customAmount && amount === v
                        ? "border-primary bg-primary text-primary-foreground shadow-soft"
                        : "border-border bg-background hover:border-primary/50"
                    }`}
                  >
                    R$ {v}
                  </button>
                ))}
              </div>
              <div className="mt-4">
                <Label htmlFor="custom">Outro valor (R$)</Label>
                <Input
                  id="custom"
                  type="number"
                  inputMode="decimal"
                  min={1}
                  placeholder="Digite um valor personalizado"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  className="mt-2 rounded-xl"
                />
              </div>
            </section>

            {/* Dados */}
            <section className="rounded-2xl border bg-card p-6 shadow-soft md:p-8">
              <h2 className="font-display text-xl font-semibold">2. Seus dados</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" required value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-2 rounded-xl" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <Input id="name" required value={form.donor_name}
                    onChange={(e) => setForm({ ...form, donor_name: e.target.value })}
                    className="mt-2 rounded-xl" />
                </div>
                <div>
                  <Label htmlFor="doc">CPF / CNPJ</Label>
                  <Input id="doc" required value={form.cpf_cnpj}
                    onChange={(e) => setForm({ ...form, cpf_cnpj: e.target.value })}
                    className="mt-2 rounded-xl" />
                </div>
                <div>
                  <Label htmlFor="country">País</Label>
                  <Input id="country" required value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="mt-2 rounded-xl" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="phone">Telefone</Label>
                  <Input id="phone" required value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="mt-2 rounded-xl" />
                </div>
              </div>
            </section>

            {/* Pagamento */}
            <section className="rounded-2xl border bg-card p-6 shadow-soft md:p-8">
              <h2 className="font-display text-xl font-semibold">3. Forma de pagamento</h2>
              <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
                {PAYMENT_METHODS.map((m) => {
                  const Icon = m.icon;
                  const active = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setPaymentMethod(m.id)}
                      className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-smooth ${
                        active ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                      }`}
                    >
                      <Icon className={`h-6 w-6 ${active ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="text-sm font-medium">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Opções */}
            <section className="rounded-2xl border bg-card p-6 shadow-soft md:p-8">
              <h2 className="font-display text-xl font-semibold">4. Opções</h2>
              <div className="mt-5 space-y-4">
                {[
                  { id: "fee", label: "Cobrir taxa de processamento (5%)", value: coverFee, set: setCoverFee },
                  { id: "monthly", label: "Quero fazer uma doação mensal", value: isMonthly, set: setIsMonthly },
                  { id: "anon", label: "Doação anônima", value: isAnonymous, set: setIsAnonymous },
                ].map((o) => (
                  <label key={o.id} htmlFor={o.id} className="flex cursor-pointer items-center gap-3 rounded-xl border bg-background p-4 transition-smooth hover:bg-secondary/50">
                    <Checkbox id={o.id} checked={o.value} onCheckedChange={(c) => o.set(!!c)} />
                    <span className="text-sm font-medium">{o.label}</span>
                  </label>
                ))}
              </div>
            </section>
          </form>
        </div>

        {/* Resumo */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="overflow-hidden rounded-2xl border bg-card shadow-elegant">
            {inst.image_url && (
              <img src={inst.image_url} alt={inst.name} className="h-32 w-full object-cover" />
            )}
            <div className="p-6">
              <p className="text-sm text-muted-foreground">Você está doando para</p>
              <h3 className="font-display text-lg font-semibold">{inst.name}</h3>

              <div className="my-6 space-y-3 border-t border-b py-6 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Valor</span><span>R$ {(customAmount ? parseFloat(customAmount.replace(",", ".")) || 0 : amount).toFixed(2).replace(".", ",")}</span></div>
                {coverFee && <div className="flex justify-between"><span className="text-muted-foreground">Taxa (5%)</span><span>incluída</span></div>}
                {isMonthly && <div className="flex justify-between"><span className="text-muted-foreground">Frequência</span><span>Mensal</span></div>}
                <div className="flex justify-between"><span className="text-muted-foreground">Pagamento</span><span className="capitalize">{PAYMENT_METHODS.find(p => p.id === paymentMethod)?.label}</span></div>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="font-display text-3xl font-bold text-primary">
                  R$ {finalAmount.toFixed(2).replace(".", ",")}
                </span>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitting || finalAmount <= 0}
                size="lg"
                className="mt-6 w-full rounded-xl bg-accent hover:bg-accent/90 text-accent-foreground shadow-accent text-base"
              >
                <Heart className="mr-2 h-5 w-5" fill="currentColor" />
                {submitting ? "Processando..." : `Doar R$ ${finalAmount.toFixed(2).replace(".", ",")}`}
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Pagamento 100% seguro e criptografado
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Donate;
