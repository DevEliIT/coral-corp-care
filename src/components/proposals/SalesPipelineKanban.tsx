import { useNavigate } from 'react-router-dom';
import { ProposalWithRelations, SALES_PIPELINE_LABELS, SalesPipelineStatus, SALES_PIPELINE_ORDER } from '@/types/crm';
import { cn } from '@/lib/utils';
import { Building2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SalesPipelineKanbanProps {
  proposals: ProposalWithRelations[];
  onStatusChange?: (proposalId: string, newStatus: SalesPipelineStatus) => void;
  canEdit: boolean;
}

const statusColors: Record<SalesPipelineStatus, string> = {
  proposta_enviada: 'border-t-blue-500',
  ag_documentacao: 'border-t-amber-500',
  enviado_bko: 'border-t-green-500',
};

const columnBgColors: Record<SalesPipelineStatus, string> = {
  proposta_enviada: 'bg-blue-50 dark:bg-blue-950/30',
  ag_documentacao: 'bg-amber-50 dark:bg-amber-950/30',
  enviado_bko: 'bg-green-50 dark:bg-green-950/30',
};

export default function SalesPipelineKanban({ proposals, onStatusChange, canEdit }: SalesPipelineKanbanProps) {
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getProposalsByStatus = (status: SalesPipelineStatus) => {
    return proposals.filter((p) => p.sales_status === status);
  };

  const handleDragStart = (e: React.DragEvent, proposal: ProposalWithRelations) => {
    const isLocked = proposal.sales_status === 'enviado_bko' && !!proposal.processing_status;
    if (!canEdit || isLocked) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData('proposalId', proposal.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!canEdit) return;
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: SalesPipelineStatus) => {
    if (!canEdit) return;
    e.preventDefault();
    const proposalId = e.dataTransfer.getData('proposalId');
    if (onStatusChange && proposalId) {
      onStatusChange(proposalId, status);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {SALES_PIPELINE_ORDER.map((status) => {
        const columnProposals = getProposalsByStatus(status);
        const totalValue = columnProposals.reduce((sum, p) => sum + (p.total_monthly || 0), 0);

        return (
          <div
            key={status}
            className={cn('kanban-column min-w-[280px] flex-1 rounded-lg p-4', columnBgColors[status])}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">
                  {SALES_PIPELINE_LABELS[status]}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {columnProposals.length} propostas
                </p>
              </div>
              <span className="text-sm font-medium text-foreground">
                {formatCurrency(totalValue)}
              </span>
            </div>

            <div className="space-y-3">
              {columnProposals.map((proposal) => {
                const isLocked = proposal.sales_status === 'enviado_bko' && !!proposal.processing_status;
                return (
                <div
                  key={proposal.id}
                  draggable={canEdit && !isLocked}
                  onDragStart={(e) => handleDragStart(e, proposal)}
                  onClick={() => navigate(`/propostas/${proposal.id}`)}
                  className={cn(
                    'bg-card rounded-lg p-4 shadow-sm border border-border cursor-pointer hover:shadow-md transition-shadow border-t-4',
                    statusColors[status],
                    (!canEdit || isLocked) && 'cursor-default opacity-70'
                  )}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="font-medium text-foreground text-sm line-clamp-2">
                      {proposal.companies?.legal_name || 'Empresa'}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3">
                    {proposal.plans?.name || 'Plano'} · {proposal.line_quantity} linhas
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(proposal.total_monthly || 0)}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(proposal.created_at), 'dd MMM', { locale: ptBR })}
                    </div>
                  </div>
                </div>
                );
              })}

              {columnProposals.length === 0 && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Nenhuma proposta
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
