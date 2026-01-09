import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ProposalWithRelations, ProposalStatus, OperationalStatus } from '@/types/crm';
import AppLayout from '@/components/layout/AppLayout';
import MetricCard from '@/components/dashboard/MetricCard';
import PipelineChart from '@/components/dashboard/PipelineChart';
import KanbanBoard from '@/components/proposals/KanbanBoard';
import OperationalKanban from '@/components/proposals/OperationalKanban';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, FileText, FileSignature, TrendingUp, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<ProposalWithRelations[]>([]);
  const [metrics, setMetrics] = useState({
    totalNegotiating: 0,
    contractsThisMonth: 0,
    avgTicket: 0,
    totalCompanies: 0,
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: proposalsData, error: proposalsError } = await supabase
        .from('proposals')
        .select('*, companies(*), plans(*)')
        .order('created_at', { ascending: false });

      if (proposalsError) throw proposalsError;
      setProposals((proposalsData || []) as ProposalWithRelations[]);

      const negotiating = (proposalsData || [])
        .filter((p: any) => ['sent', 'negotiation'].includes(p.status))
        .reduce((sum: number, p: any) => sum + (p.total_monthly || 0), 0);

      const signed = (proposalsData || []).filter((p: any) => p.status === 'signed');
      const contractsThisMonth = signed.length;
      const avgTicket = signed.length > 0
        ? signed.reduce((sum: number, p: any) => sum + (p.total_monthly || 0), 0) / signed.length
        : 0;

      const { count: companiesCount } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });

      setMetrics({
        totalNegotiating: negotiating,
        contractsThisMonth,
        avgTicket,
        totalCompanies: companiesCount || 0,
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (proposalId: string, newStatus: ProposalStatus) => {
    const proposal = proposals.find((p) => p.id === proposalId);
    if (!proposal) return;

    try {
      const { error } = await supabase
        .from('proposals')
        .update({ status: newStatus })
        .eq('id', proposalId);

      if (error) throw error;

      await supabase.from('proposal_status_history').insert({
        proposal_id: proposalId,
        old_status: proposal.status,
        new_status: newStatus,
        changed_by: user?.id,
      });

      if (newStatus === 'signed') {
        await supabase.from('contracts').insert({
          proposal_id: proposalId,
          start_date: new Date().toISOString().split('T')[0],
        });
        
        if (proposal.company_id) {
          await supabase
            .from('companies')
            .update({ status: 'active' })
            .eq('id', proposal.company_id);
        }
      }

      toast({ title: 'Status atualizado!' });
      fetchData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar status' });
    }
  };

  const handleOperationalStatusChange = async (proposalId: string, newStatus: OperationalStatus) => {
    try {
      const { error } = await supabase
        .from('proposals')
        .update({ operational_status: newStatus })
        .eq('id', proposalId);

      if (error) throw error;

      toast({ title: 'Status operacional atualizado!' });
      fetchData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar status' });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const pipelineData = proposals.reduce((acc, p) => {
    const existing = acc.find((item) => item.status === p.status);
    if (existing) {
      existing.count++;
      existing.value += p.total_monthly || 0;
    } else {
      acc.push({ status: p.status, count: 1, value: p.total_monthly || 0 });
    }
    return acc;
  }, [] as { status: ProposalStatus; count: number; value: number }[]);

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground">Visão geral do pipeline de vendas</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/empresas/nova')}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Empresa
            </Button>
            <Button onClick={() => navigate('/propostas/nova')}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Proposta
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Em Negociação"
            value={formatCurrency(metrics.totalNegotiating)}
            subtitle="Propostas ativas"
            icon={<TrendingUp className="h-6 w-6 text-primary" />}
          />
          <MetricCard
            title="Contratos no Mês"
            value={metrics.contractsThisMonth}
            subtitle="Fechados este mês"
            icon={<FileSignature className="h-6 w-6 text-primary" />}
          />
          <MetricCard
            title="Ticket Médio"
            value={formatCurrency(metrics.avgTicket)}
            subtitle="Por contrato"
            icon={<FileText className="h-6 w-6 text-primary" />}
          />
          <MetricCard
            title="Total de Empresas"
            value={metrics.totalCompanies}
            subtitle="No seu pipeline"
            icon={<Building2 className="h-6 w-6 text-primary" />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="sales" className="w-full">
                <TabsList className="mb-4">
                  <TabsTrigger value="sales">Vendas</TabsTrigger>
                  <TabsTrigger value="operational">Operacional</TabsTrigger>
                </TabsList>
                <TabsContent value="sales">
                  <KanbanBoard proposals={proposals} onStatusChange={handleStatusChange} />
                </TabsContent>
                <TabsContent value="operational">
                  <OperationalKanban 
                    proposals={proposals.filter(p => p.status === 'signed')} 
                    onStatusChange={handleOperationalStatusChange} 
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Resumo do Funil</CardTitle>
            </CardHeader>
            <CardContent>
              <PipelineChart data={pipelineData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
