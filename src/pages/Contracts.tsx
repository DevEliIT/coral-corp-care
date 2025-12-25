import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ContractWithRelations } from '@/types/crm';
import AppLayout from '@/components/layout/AppLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Contracts() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contracts, setContracts] = useState<ContractWithRelations[]>([]);

  useEffect(() => { if (!authLoading && !user) navigate('/auth'); }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      supabase.from('contracts').select('*, proposals(*, companies(*), plans(*))').order('created_at', { ascending: false })
        .then(({ data }) => { setContracts((data || []) as ContractWithRelations[]); setLoading(false); });
    }
  }, [user]);

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  if (authLoading || loading) return <AppLayout><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold">Contratos</h1><p className="text-muted-foreground">{contracts.length} contratos ativos</p></div>
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader><TableRow><TableHead>Empresa</TableHead><TableHead>Plano</TableHead><TableHead>Linhas</TableHead><TableHead>Valor Mensal</TableHead><TableHead>Ativação</TableHead><TableHead>Vigência</TableHead></TableRow></TableHeader>
            <TableBody>
              {contracts.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.proposals?.companies?.legal_name}</TableCell>
                  <TableCell>{c.proposals?.plans?.name || '-'}</TableCell>
                  <TableCell>{c.proposals?.line_quantity}</TableCell>
                  <TableCell className="font-medium text-emerald-600">{formatCurrency(c.proposals?.total_monthly || 0)}</TableCell>
                  <TableCell>{format(new Date(c.start_date), 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{c.end_date ? format(new Date(c.end_date), 'dd/MM/yyyy') : 'Indeterminado'}</TableCell>
                </TableRow>
              ))}
              {contracts.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum contrato</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}