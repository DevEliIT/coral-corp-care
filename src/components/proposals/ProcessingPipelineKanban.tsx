import { useNavigate } from 'react-router-dom';
import { ProposalWithRelations, PROCESSING_PIPELINE_LABELS, ProcessingPipelineStatus } from '@/types/crm';
import { cn } from '@/lib/utils';
import { Building2, Calendar, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface ProcessingPipelineKanbanProps {
  proposals: ProposalWithRelations[];
  onStatusChange?: (proposalId: string, newStatus: ProcessingPipelineStatus) => void;
  canEdit: boolean;
}

const getStatusColor = (status: ProcessingPipelineStatus): string => {
  const colors: Record<string, string> = {
    troca_carteira: 'border-t-blue-500',
    gerar_contrato: 'border-t-indigo-500',
    auditoria_assinatura: 'border-t-purple-500',
    pendente_input: 'border-t-amber-500',
    chamado_aberto: 'border-t-orange-500',
    pendente_estoque: 'border-t-yellow-500',
    ativo: 'border-t-emerald-500',
    instalada: 'border-t-green-500',
    logistica: 'border-t-teal-500',
    pendente_instalacao: 'border-t-cyan-500',
    ag_portabilidade: 'border-t-sky-500',
    ag_autorizacao_sms: 'border-t-blue-400',
    analise_credito: 'border-t-violet-500',
    ag_validacao: 'border-t-fuchsia-500',
    validacao_pendente: 'border-t-pink-500',
    pendente_assinatura: 'border-t-rose-500',
    reprovado_bko: 'border-t-red-500',
    para_correcao: 'border-t-red-400',
    reprovado_troca_carteira: 'border-t-red-600',
    credito_reprovado: 'border-t-red-700',
    cancelado: 'border-t-gray-500',
    ag_faturamento: 'border-t-lime-500',
  };
  return colors[status] || 'border-t-gray-400';
};

const getColumnBgColor = (status: ProcessingPipelineStatus): string => {
  if (status.includes('reprovado') || status === 'cancelado' || status === 'credito_reprovado') {
    return 'bg-red-50 dark:bg-red-950/30';
  }
  if (status === 'ativo' || status === 'instalada') {
    return 'bg-green-50 dark:bg-green-950/30';
  }
  if (status.includes('pendente')) {
    return 'bg-amber-50 dark:bg-amber-950/30';
  }
  return 'bg-muted/50';
};

export default function ProcessingPipelineKanban({ proposals, onStatusChange, canEdit }: ProcessingPipelineKanbanProps) {
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getProposalsByStatus = (status: ProcessingPipelineStatus) => {
    return proposals.filter((p) => p.processing_status === status);
  };

  const handleDragStart = (e: React.DragEvent, proposalId: string) => {
    if (!canEdit) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('proposalId', proposalId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!canEdit) return;
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: ProcessingPipelineStatus) => {
    if (!canEdit) return;
    e.preventDefault();
    const proposalId = e.dataTransfer.getData('proposalId');
    if (onStatusChange && proposalId) {
      onStatusChange(proposalId, status);
    }
  };

  // Group statuses for better organization
  const statusGroups = [
    { name: 'Documentação', statuses: ['troca_carteira', 'gerar_contrato', 'auditoria_assinatura'] as ProcessingPipelineStatus[] },
    { name: 'Análise', statuses: ['analise_credito', 'ag_validacao', 'validacao_pendente'] as ProcessingPipelineStatus[] },
    { name: 'Pendências', statuses: ['pendente_input', 'pendente_estoque', 'pendente_assinatura', 'pendente_instalacao'] as ProcessingPipelineStatus[] },
    { name: 'Operacional', statuses: ['ag_portabilidade', 'ag_autorizacao_sms', 'logistica', 'chamado_aberto'] as ProcessingPipelineStatus[] },
    { name: 'Conclusão', statuses: ['ativo', 'instalada', 'ag_faturamento'] as ProcessingPipelineStatus[] },
    { name: 'Correções', statuses: ['reprovado_bko', 'para_correcao', 'reprovado_troca_carteira', 'credito_reprovado', 'cancelado'] as ProcessingPipelineStatus[] },
  ];

  return (
    <div className="space-y-6">
      {!canEdit && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-amber-800 dark:text-amber-200">
          <Lock className="h-4 w-4" />
          <span className="text-sm">Você não pode movimentar nem alterar nada nessa etapa</span>
        </div>
      )}

      {statusGroups.map((group) => {
        const groupProposals = proposals.filter((p) => 
          p.processing_status && group.statuses.includes(p.processing_status)
        );
        if (groupProposals.length === 0) return null;

        return (
          <div key={group.name} className="space-y-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              {group.name}
            </h3>
            <ScrollArea className="w-full">
              <div className="flex gap-4 pb-4">
                {group.statuses.map((status) => {
                  const columnProposals = getProposalsByStatus(status);
                  if (columnProposals.length === 0) return null;
                  
                  const totalValue = columnProposals.reduce((sum, p) => sum + (p.total_monthly || 0), 0);

                  return (
                    <div
                      key={status}
                      className={cn('min-w-[250px] rounded-lg p-4', getColumnBgColor(status))}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, status)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium text-foreground text-sm">
                            {PROCESSING_PIPELINE_LABELS[status]}
                          </h4>
                          <p className="text-xs text-muted-foreground">
                            {columnProposals.length} · {formatCurrency(totalValue)}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {columnProposals.map((proposal) => (
                          <div
                            key={proposal.id}
                            draggable={canEdit}
                            onDragStart={(e) => handleDragStart(e, proposal.id)}
                            onClick={() => navigate(`/propostas/${proposal.id}`)}
                            className={cn(
                              'bg-card rounded-lg p-3 shadow-sm border border-border cursor-pointer hover:shadow-md transition-shadow border-t-4',
                              getStatusColor(status),
                              !canEdit && 'cursor-default'
                            )}
                          >
                            <div className="flex items-start gap-2 mb-2">
                              <Building2 className="h-3 w-3 text-muted-foreground shrink-0 mt-0.5" />
                              <span className="font-medium text-foreground text-xs line-clamp-1">
                                {proposal.companies?.legal_name || 'Empresa'}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-sm font-bold text-primary">
                                {formatCurrency(proposal.total_monthly || 0)}
                              </span>
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                {format(new Date(proposal.created_at), 'dd/MM', { locale: ptBR })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>
        );
      })}

      {proposals.filter(p => p.processing_status).length === 0 && (
        <p className="text-center text-muted-foreground py-12">
          Nenhuma proposta em tramitação
        </p>
      )}
    </div>
  );
}
