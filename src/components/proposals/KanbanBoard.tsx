import { useNavigate } from 'react-router-dom';
import { ProposalWithRelations, PROPOSAL_STATUS_LABELS, ProposalStatus, PROPOSAL_STATUS_ORDER } from '@/types/crm';
import { cn } from '@/lib/utils';
import { Building2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface KanbanBoardProps {
  proposals: ProposalWithRelations[];
  onStatusChange?: (proposalId: string, newStatus: ProposalStatus) => void;
}

const statusColors: Record<ProposalStatus, string> = {
  qualified: 'border-t-blue-500',
  diagnosis: 'border-t-purple-500',
  sent: 'border-t-amber-500',
  negotiation: 'border-t-orange-500',
  signed: 'border-t-emerald-500',
  lost: 'border-t-red-500',
};

const columnBgColors: Record<ProposalStatus, string> = {
  qualified: 'bg-blue-50',
  diagnosis: 'bg-purple-50',
  sent: 'bg-amber-50',
  negotiation: 'bg-orange-50',
  signed: 'bg-emerald-50',
  lost: 'bg-red-50',
};

export default function KanbanBoard({ proposals, onStatusChange }: KanbanBoardProps) {
  const navigate = useNavigate();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const columns = PROPOSAL_STATUS_ORDER.filter((status) => status !== 'lost');

  const getProposalsByStatus = (status: ProposalStatus) => {
    return proposals.filter((p) => p.status === status);
  };

  const handleDragStart = (e: React.DragEvent, proposalId: string) => {
    e.dataTransfer.setData('proposalId', proposalId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: ProposalStatus) => {
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
                  {PROPOSAL_STATUS_LABELS[status]}
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