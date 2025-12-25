import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ProposalWithRelations } from '@/types/crm';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Plus, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Proposals() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<ProposalWithRelations[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      supabase.from('proposals').select('*, companies(*), plans(*)').order('created_at', { ascending: false })
        .then(({ data }) => { setProposals((data || []) as ProposalWithRelations[]); setLoading(false); });
    }
  }, [user]);

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  if (authLoading || loading) return <AppLayout><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div><h1 className="text-2xl font-bold">Propostas</h1><p className="text-muted-foreground">{proposals.length} propostas</p></div>
          <Button onClick={() => navigate('/propostas/nova')}><Plus className="h-4 w-4 mr-2" />Nova Proposta</Button>
        </div>
        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader><TableRow><TableHead>Empresa</TableHead><TableHead>Plano</TableHead><TableHead>Linhas</TableHead><TableHead>Valor Mensal</TableHead><TableHead>Status</TableHead><TableHead>Data</TableHead></TableRow></TableHeader>
            <TableBody>
              {proposals.map((p) => (
                <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/propostas/${p.id}`)}>
                  <TableCell className="font-medium">{p.companies?.legal_name}</TableCell>
                  <TableCell>{p.plans?.name || '-'}</TableCell>
                  <TableCell>{p.line_quantity}</TableCell>
                  <TableCell className="font-medium text-primary">{formatCurrency(p.total_monthly)}</TableCell>
                  <TableCell><StatusBadge status={p.status} /></TableCell>
                  <TableCell>{format(new Date(p.created_at), 'dd/MM/yyyy')}</TableCell>
                </TableRow>
              ))}
              {proposals.length === 0 && <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhuma proposta</TableCell></TableRow>}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}