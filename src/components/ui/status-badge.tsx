import { CompanyStatus, ProposalStatus, COMPANY_STATUS_LABELS, PROPOSAL_STATUS_LABELS } from '@/types/crm';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: CompanyStatus | ProposalStatus;
  type?: 'company' | 'proposal';
  className?: string;
}

export function StatusBadge({ status, type = 'proposal', className }: StatusBadgeProps) {
  const label = type === 'company' 
    ? COMPANY_STATUS_LABELS[status as CompanyStatus] 
    : PROPOSAL_STATUS_LABELS[status as ProposalStatus];

  return (
    <span className={cn(`status-badge status-${status}`, className)}>
      {label}
    </span>
  );
}