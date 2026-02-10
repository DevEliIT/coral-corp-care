import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ProposalWithRelations, SalesPipelineStatus, ProcessingPipelineStatus } from '@/types/crm';
import AppLayout from '@/components/layout/AppLayout';
import MetricCard from '@/components/dashboard/MetricCard';
import SalesPipelineKanban from '@/components/proposals/SalesPipelineKanban';
import ProcessingPipelineKanban from '@/components/proposals/ProcessingPipelineKanban';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Building2, FileText, FileSignature, TrendingUp, Plus, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Dashboard() {
  const { user, loading: authLoading, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<ProposalWithRelations[]>([]);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [metrics, setMetrics] = useState({
    totalNegotiating: 0,
    contractsThisMonth: 0,
    avgTicket: 0,
    totalCompanies: 0,
  });

  // Check user roles for view visibility and edit permissions
  const isManager = profile?.role === 'manager';
  const isBackoffice = userRoles.includes('backoffice');
  const isSeller = userRoles.includes('seller') || profile?.role === 'seller';

  // Visibility: Sellers see only Prospecção, Backoffice sees only Tramitação, Manager sees both
  const canViewSalesPipeline = isSeller || isManager;
  const canViewProcessingPipeline = isBackoffice || isManager;

  // Edit permissions
  const canEditSalesPipeline = isSeller || isManager;
  const canEditProcessingPipeline = isBackoffice || isManager;

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
      fetchUserRoles();
    }
  }, [user]);

  const fetchUserRoles = async () => {
    if (!user) return;
    const { data } = await supabase.from('user_roles').select('role').eq('user_id', user.id);
    setUserRoles((data || []).map((r) => r.role));
  };

  const fetchData = async () => {
    try {
      const { data: proposalsData, error: proposalsError } = await supabase
        .from('proposals')
        .select('*, companies(*), plans(*)')
        .order('created_at', { ascending: false });

      if (proposalsError) throw proposalsError;
      setProposals((proposalsData || []) as ProposalWithRelations[]);

      const negotiating = (proposalsData || [])
        .filter((p: any) => p.sales_status && !p.processing_status)
        .reduce((sum: number, p: any) => sum + (p.total_monthly || 0), 0);

      const active = (proposalsData || []).filter((p: any) => p.processing_status === 'ativo');
      const contractsThisMonth = active.length;
      const avgTicket = active.length > 0
        ? active.reduce((sum: number, p: any) => sum + (p.total_monthly || 0), 0) / active.length
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

  const handleSalesStatusChange = async (proposalId: string, newStatus: SalesPipelineStatus) => {
    if (!canEditSalesPipeline) {
      toast({ variant: 'destructive', title: 'Sem permissão para alterar' });
      return;
    }

    try {
      const updateData: any = { sales_status: newStatus };
      
      // When moving to "enviado_bko", mark the timestamp and move to processing
      if (newStatus === 'enviado_bko') {
        updateData.sent_to_bko_at = new Date().toISOString();
        updateData.processing_status = 'troca_carteira';
      }

      const { error } = await supabase
        .from('proposals')
        .update(updateData)
        .eq('id', proposalId);

      if (error) throw error;

      toast({ title: 'Status atualizado!' });
      fetchData();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar status' });
    }
  };

  const handleProcessingStatusChange = async (proposalId: string, newStatus: ProcessingPipelineStatus) => {
    if (!canEditProcessingPipeline) {
      toast({ variant: 'destructive', title: 'Vendedor não pode movimentar nessa etapa' });
      return;
    }

    try {
      const { error } = await supabase
        .from('proposals')
        .update({ processing_status: newStatus })
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

  // Filter proposals for each view
  const salesProposals = proposals.filter((p) => p.sales_status && (!p.processing_status || p.sales_status === 'enviado_bko'));
  const processingProposals = proposals.filter((p) => p.processing_status);

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
            title="Em Prospecção"
            value={formatCurrency(metrics.totalNegotiating)}
            subtitle="Propostas em vendas"
            icon={<TrendingUp className="h-6 w-6 text-primary" />}
          />
          <MetricCard
            title="Ativos no Mês"
            value={metrics.contractsThisMonth}
            subtitle="Contratos ativos"
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

        <Card>
          <CardHeader>
            <CardTitle>Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={canViewSalesPipeline ? "prospeccao" : "tramitacao"} className="w-full">
              <TabsList className="mb-4">
                {canViewSalesPipeline && (
                  <TabsTrigger value="prospeccao">
                    Visão Prospecção
                    <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {salesProposals.length}
                    </span>
                  </TabsTrigger>
                )}
                {canViewProcessingPipeline && (
                  <TabsTrigger value="tramitacao">
                    Visão Tramitação
                    <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                      {processingProposals.length}
                    </span>
                  </TabsTrigger>
                )}
              </TabsList>
              {canViewSalesPipeline && (
                <TabsContent value="prospeccao">
                  <SalesPipelineKanban 
                    proposals={salesProposals} 
                    onStatusChange={handleSalesStatusChange}
                    canEdit={canEditSalesPipeline}
                  />
                </TabsContent>
              )}
              {canViewProcessingPipeline && (
                <TabsContent value="tramitacao">
                  <ProcessingPipelineKanban 
                    proposals={processingProposals} 
                    onStatusChange={handleProcessingStatusChange}
                    canEdit={canEditProcessingPipeline}
                  />
                </TabsContent>
              )}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
