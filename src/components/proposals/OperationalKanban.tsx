import { useNavigate } from 'react-router-dom';
import { ProposalWithRelations, OPERATIONAL_STATUS_LABELS, OperationalStatus, OPERATIONAL_STATUS_ORDER } from '@/types/crm';
import { cn } from '@/lib/utils';
import { Building2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface OperationalKanbanProps {
  proposals: ProposalWithRelations[];
  onStatusChange?: (proposalId: string, newStatus: OperationalStatus) => void;
}

const statusColors: Record<OperationalStatus, string> = {
  analysis: 'border-t-blue-500',
  documentation: 'border-t-amber-500',
  activation: 'border-t-purple-500',
  completed: 'border-t-emerald-500',
  cancelled: 'border-t-red-500',
};

const columnBgColors: Record<OperationalStatus, string> = {
  analysis: 'bg-blue-50',
  documentation: 'bg-amber-50',
  activation: 'bg-purple-50',
  completed: 'bg-emerald-50',
  cancelled: 'bg-red-50',
};

export default function OperationalKanban({ proposals, onStatusChange }: OperationalKanbanProps) {
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const columns = OPERATIONAL_STATUS_ORDER.filter((status) => status !== 'cancelled');

  const getProposalsByStatus = (status: OperationalStatus) => {
    return proposals.filter((p) => (p.operational_status || 'analysis') === status);
  };

  const handleDragStart = (e: React.DragEvent, proposalId: string) => {
    e.dataTransfer.setData('proposalId', proposalId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: OperationalStatus) => {
    e.preventDefault();
    const proposalId = e.dataTransfer.getData('proposalId');
    if (onStatusChange && proposalId) {
      onStatusChange(proposalId, status);
    }
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((status) => {
        const columnProposals = getProposalsByStatus(status);
        const totalValue = columnProposals.reduce((sum, p) => sum + (p.total_monthly || 0), 0);

        return (
          <div
            key={status}
            className={cn('kanban-column min-w-[280px] flex-1', columnBgColors[status])}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-foreground">
                  {OPERATIONAL_STATUS_LABELS[status]}
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
              {columnProposals.map((proposal) => (
                <div
                  key={proposal.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, proposal.id)}
                  onClick={() => navigate(`/propostas/${proposal.id}`)}
                  className={cn(
                    'kanban-card border-t-4',
                    statusColors[status]
                  )}
                >
                  <div className="flex items-start gap-2 mb-2">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                    <span className="font-medium text-foreground text-sm line-clamp-2">
                      {proposal.companies?.legal_name || 'Empresa'}
                    </span>
                  </div>

                  <p className="text-xs text-muted-foreground mb-3">
                    {proposal.product || proposal.plans?.name || 'Plano'} · {proposal.line_quantity} linhas
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
              ))}

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
