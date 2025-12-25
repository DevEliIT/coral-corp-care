import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Company, Plan } from '@/types/crm';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function NewProposal() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [form, setForm] = useState({ company_id: '', plan_id: '', line_quantity: '', price_per_line: '', notes: '' });

  useEffect(() => {
    supabase.from('companies').select('*').order('legal_name').then(({ data }) => setCompanies((data || []) as Company[]));
    supabase.from('plans').select('*').eq('active', true).order('name').then(({ data }) => setPlans((data || []) as Plan[]));
  }, []);

  const selectedPlan = plans.find((p) => p.id === form.plan_id);
  const total = (parseInt(form.line_quantity) || 0) * (parseFloat(form.price_per_line) || 0);
  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const handlePlanChange = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    setForm({ ...form, plan_id: planId, price_per_line: plan?.base_price.toString() || '' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('proposals').insert({
      company_id: form.company_id,
      plan_id: form.plan_id || null,
      seller_id: user?.id,
      line_quantity: parseInt(form.line_quantity),
      price_per_line: parseFloat(form.price_per_line),
      notes: form.notes || null,
      status: 'qualified',
    });
    if (error) toast({ variant: 'destructive', title: 'Erro', description: error.message });
    else { toast({ title: 'Proposta criada!' }); navigate('/propostas'); }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate('/propostas')}><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button>
        <Card>
          <CardHeader><CardTitle>Nova Proposta</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2"><Label>Empresa *</Label>
                <Select value={form.company_id} onValueChange={(v) => setForm({ ...form, company_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.legal_name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Plano</Label>
                <Select value={form.plan_id} onValueChange={handlePlanChange}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>{plans.map((p) => <SelectItem key={p.id} value={p.id}>{p.carrier} - {p.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Quantidade de Linhas *</Label><Input type="number" required min="1" value={form.line_quantity} onChange={(e) => setForm({ ...form, line_quantity: e.target.value })} /></div>
                <div className="space-y-2"><Label>Valor por Linha *</Label><Input type="number" required step="0.01" value={form.price_per_line} onChange={(e) => setForm({ ...form, price_per_line: e.target.value })} /></div>
              </div>
              <div className="p-4 bg-primary/5 rounded-lg"><p className="text-sm text-muted-foreground">Valor Mensal Total</p><p className="text-2xl font-bold text-primary">{formatCurrency(total)}</p></div>
              <div className="space-y-2"><Label>Observações</Label><Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
              <Button type="submit" disabled={loading || !form.company_id}>{loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Criar Proposta</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}