import { PROPOSAL_STATUS_LABELS, ProposalStatus, PROPOSAL_STATUS_ORDER } from '@/types/crm';
import { cn } from '@/lib/utils';

interface PipelineData {
  status: ProposalStatus;
  count: number;
  value: number;
}

interface PipelineChartProps {
  data: PipelineData[];
}

const statusColors: Record<ProposalStatus, string> = {
  qualified: 'bg-blue-500',
  diagnosis: 'bg-purple-500',
  sent: 'bg-amber-500',
  negotiation: 'bg-orange-500',
  signed: 'bg-emerald-500',
  lost: 'bg-red-500',
};

export default function PipelineChart({ data }: PipelineChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const sortedData = PROPOSAL_STATUS_ORDER
    .filter((status) => status !== 'lost')
    .map((status) => {
      const found = data.find((d) => d.status === status);
      return {
        status,
        count: found?.count || 0,
        value: found?.value || 0,
      };
    });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="space-y-4">
      {sortedData.map((item) => (
        <div key={item.status} className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-foreground">
              {PROPOSAL_STATUS_LABELS[item.status]}
            </span>
            <span className="text-muted-foreground">
              {item.count} propostas · {formatCurrency(item.value)}
            </span>
          </div>
          <div className="h-3 bg-muted rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', statusColors[item.status])}
              style={{ width: `${(item.count / maxCount) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}