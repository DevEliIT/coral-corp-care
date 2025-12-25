export type AppRole = 'seller' | 'manager';

export type DecisionRole = 'decision_maker' | 'influencer' | 'financial';

export type CompanyStatus = 'lead' | 'proposal' | 'active' | 'lost';

export type ProposalStatus = 'qualified' | 'diagnosis' | 'sent' | 'negotiation' | 'signed' | 'lost';

export interface Profile {
  id: string;
  role: AppRole;
  full_name: string | null;
  created_at: string;
}

export interface Company {
  id: string;
  legal_name: string;
  cnpj: string;
  segment: string | null;
  estimated_lines: number | null;
  status: CompanyStatus;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanyContact {
  id: string;
  company_id: string;
  name: string;
  role: string | null;
  email: string | null;
  phone: string | null;
  decision_role: DecisionRole | null;
  created_at: string;
}

export interface Plan {
  id: string;
  carrier: string;
  name: string;
  base_price: number;
  notes: string | null;
  active: boolean;
  created_at: string;
}

export interface Proposal {
  id: string;
  company_id: string;
  plan_id: string | null;
  seller_id: string | null;
  line_quantity: number;
  price_per_line: number;
  total_monthly: number;
  status: ProposalStatus;
  notes: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProposalWithRelations extends Proposal {
  companies?: Company;
  plans?: Plan;
  profiles?: Profile;
}

export interface ProposalStatusHistory {
  id: string;
  proposal_id: string;
  old_status: ProposalStatus | null;
  new_status: ProposalStatus;
  changed_by: string | null;
  changed_at: string;
}

export interface Contract {
  id: string;
  proposal_id: string;
  start_date: string;
  end_date: string | null;
  notes: string | null;
  created_at: string;
}

export interface ContractWithRelations extends Contract {
  proposals?: ProposalWithRelations;
}

export const COMPANY_STATUS_LABELS: Record<CompanyStatus, string> = {
  lead: 'Lead',
  proposal: 'Em Proposta',
  active: 'Cliente Ativo',
  lost: 'Perdido',
};

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  qualified: 'Lead Qualificado',
  diagnosis: 'Diagnóstico',
  sent: 'Proposta Enviada',
  negotiation: 'Negociação',
  signed: 'Contrato Assinado',
  lost: 'Perdido',
};

export const DECISION_ROLE_LABELS: Record<DecisionRole, string> = {
  decision_maker: 'Decisor',
  influencer: 'Influenciador',
  financial: 'Financeiro',
};

export const PROPOSAL_STATUS_ORDER: ProposalStatus[] = [
  'qualified',
  'diagnosis',
  'sent',
  'negotiation',
  'signed',
  'lost',
];