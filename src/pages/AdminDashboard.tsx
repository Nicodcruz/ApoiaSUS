import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, TrendingUp, Users, Wallet } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Donation {
  id: string;
  donor_name: string;
  amount: number;
  payment_method: string;
  is_anonymous: boolean;
  created_at: string;
  institution_id: string;
  institutions: { name: string } | null;
}

interface Institution { id: string; name: string; }

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    document.title = "Dashboard Admin — ApoiaSUS";

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/admin/login"); return; }
      setUserEmail(session.user.email ?? "");

      // Check role
      const { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);

      const isAdmin = roles?.some(r => r.role === "admin");
      if (!isAdmin) {
        toast.error("Acesso restrito. Você não tem permissão de admin.");
        await supabase.auth.signOut();
        navigate("/admin/login");
        return;
      }
      setAuthorized(true);

      const [donRes, instRes] = await Promise.all([
        supabase.from("donations").select("*, institutions(name)").order("created_at", { ascending: false }),
        supabase.from("institutions").select("id, name").order("name"),
      ]);
      setDonations((donRes.data ?? []) as Donation[]);
      setInstitutions(instRes.data ?? []);
      setLoading(false);
    };
    init();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  const filtered = filter === "all" ? donations : donations.filter(d => d.institution_id === filter);
  const total = filtered.reduce((acc, d) => acc + Number(d.amount), 0);

  if (!authorized && loading) {
    return <div className="container py-12"><Skeleton className="h-96 rounded-2xl" /></div>;
  }
  if (!authorized) return null;

  return (
    <div className="container py-12">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold md:text-4xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Logado como {userEmail}</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="rounded-xl">
          <LogOut className="mr-2 h-4 w-4" /> Sair
        </Button>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <StatCard icon={Wallet} label="Total arrecadado" value={`R$ ${total.toFixed(2).replace(".", ",")}`} />
        <StatCard icon={Users} label="Doações" value={String(filtered.length)} />
        <StatCard icon={TrendingUp} label="Ticket médio" value={`R$ ${(filtered.length ? total / filtered.length : 0).toFixed(2).replace(".", ",")}`} />
      </div>

      <div className="mb-4 flex items-center gap-4">
        <span className="text-sm font-medium">Filtrar por instituição:</span>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[280px] rounded-xl"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {institutions.map(i => (
              <SelectItem key={i.id} value={i.id}>{i.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Doador</TableHead>
              <TableHead>Instituição</TableHead>
              <TableHead>Método</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={5}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
            ) : filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground py-8">Nenhuma doação encontrada</TableCell></TableRow>
            ) : filtered.map(d => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">
                  {d.is_anonymous ? <Badge variant="secondary">Anônimo</Badge> : d.donor_name}
                </TableCell>
                <TableCell>{d.institutions?.name ?? "-"}</TableCell>
                <TableCell className="capitalize">{d.payment_method}</TableCell>
                <TableCell className="text-right font-semibold text-primary">R$ {Number(d.amount).toFixed(2).replace(".", ",")}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{new Date(d.created_at).toLocaleString("pt-BR")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) => (
  <div className="rounded-2xl border bg-card p-6 shadow-soft">
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
        <Icon className="h-5 w-5 text-primary-foreground" />
      </div>
    </div>
    <div className="mt-3 font-display text-2xl font-bold">{value}</div>
  </div>
);

export default AdminDashboard;
