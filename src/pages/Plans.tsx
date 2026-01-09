import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Plan, REQUEST_TYPE_LABELS, RequestType } from '@/types/crm';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Loader2 } from 'lucide-react';

export default function Plans() {
  const { user, loading: authLoading, isManager } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', base_price: '', notes: '', request_type: '' as RequestType | '' });

  useEffect(() => { if (!authLoading && !user) navigate('/auth'); }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchPlans();
  }, [user]);

  const fetchPlans = async () => {
    const { data } = await supabase.from('plans').select('*').order('name');
    setPlans((data || []) as Plan[]);
    setLoading(false);
  };

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from('plans').insert({
      name: form.name,
      base_price: parseFloat(form.base_price),
      notes: form.notes || null,
      request_type: form.request_type || null,
    });
    if (error) toast({ variant: 'destructive', title: 'Erro', description: error.message });
    else {
      toast({ title: 'Plano criado!' });
      setOpen(false);
      setForm({ name: '', base_price: '', notes: '', request_type: '' });
      fetchPlans();
    }
    setSaving(false);
  };

  if (authLoading || loading) return <AppLayout><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold">Planos Corporativos</h1><p className="text-muted-foreground">{plans.length} planos cadastrados</p></div>
          {isManager && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Novo Plano</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Novo Plano</DialogTitle></DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nome do Plano *</Label>
                    <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tipo de Solicitação *</Label>
                    <Select value={form.request_type} onValueChange={(v) => setForm({ ...form, request_type: v as RequestType })}>
                      <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(REQUEST_TYPE_LABELS) as RequestType[]).map((type) => (
                          <SelectItem key={type} value={type}>{REQUEST_TYPE_LABELS[type]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Valor Base por Linha *</Label>
                    <Input type="number" step="0.01" required value={form.base_price} onChange={(e) => setForm({ ...form, base_price: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label>Observações</Label>
                    <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
                  </div>
                  <Button type="submit" disabled={saving}>{saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Criar Plano</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome do Plano</TableHead>
                <TableHead>Tipo de Solicitação</TableHead>
                <TableHead>Valor Base/Linha</TableHead>
                <TableHead>Observações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.request_type ? REQUEST_TYPE_LABELS[p.request_type] : '-'}</TableCell>
                  <TableCell className="text-primary font-medium">{formatCurrency(p.base_price)}</TableCell>
                  <TableCell className="text-muted-foreground">{p.notes || '-'}</TableCell>
                </TableRow>
              ))}
              {plans.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">Nenhum plano cadastrado</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
