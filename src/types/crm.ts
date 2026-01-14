export type AppRole = 'seller' | 'manager' | 'supervisor' | 'post_sale' | 'backoffice';

export type DecisionRole = 'decision_maker' | 'influencer' | 'financial';

export type ContactType = 'legal_representative' | 'account_manager' | 'cedent';

export type CompanyStatus = 'lead' | 'proposal' | 'active' | 'lost';

export type ProposalStatus = 'qualified' | 'diagnosis' | 'sent' | 'negotiation' | 'signed' | 'lost';

export type OperationalStatus = 'analysis' | 'documentation' | 'activation' | 'completed' | 'cancelled';

export type RequestType = 'portability' | 'new_line' | 'migration';

// New Pipeline Types
export type SalesPipelineStatus = 'proposta_enviada' | 'ag_documentacao' | 'enviado_bko';

export type ProcessingPipelineStatus = 
  | 'troca_carteira'
  | 'gerar_contrato'
  | 'auditoria_assinatura'
  | 'pendente_input'
  | 'chamado_aberto'
  | 'pendente_estoque'
  | 'ativo'
  | 'instalada'
  | 'logistica'
  | 'pendente_instalacao'
  | 'ag_portabilidade'
  | 'ag_autorizacao_sms'
  | 'analise_credito'
  | 'ag_validacao'
  | 'validacao_pendente'
  | 'pendente_assinatura'
  | 'reprovado_bko'
  | 'para_correcao'
  | 'reprovado_troca_carteira'
  | 'credito_reprovado'
  | 'cancelado'
  | 'ag_faturamento';

export interface Profile {
  id: string;
  role: AppRole;
  full_name: string | null;
  created_at: string;
}

export interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_by: string | null;
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
  contact_type: ContactType | null;
  cpf: string | null;
  rg: string | null;
  mobile_phone: string | null;
  landline_phone: string | null;
  birth_date: string | null;
  created_at: string;
}

export interface CompanyDocument {
  id: string;
  company_id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface Plan {
  id: string;
  name: string;
  base_price: number;
  notes: string | null;
  active: boolean;
  request_type: RequestType | null;
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
  product: string | null;
  request_type: RequestType | null;
  donor_carrier: string | null;
  operational_status: OperationalStatus | null;
  sales_status: SalesPipelineStatus | null;
  processing_status: ProcessingPipelineStatus | null;
  sent_to_bko_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProposalCedent {
  id: string;
  proposal_id: string;
  contact_id: string | null;
  name: string | null;
  cpf: string | null;
  rg: string | null;
  email: string | null;
  mobile_phone: string | null;
  landline_phone: string | null;
  birth_date: string | null;
  role: string | null;
  is_existing_contact: boolean;
  created_at: string;
}

export interface ProposalAttachment {
  id: string;
  proposal_id: string;
  file_name: string;
  file_path: string;
  file_type: string | null;
  uploaded_by: string | null;
  created_at: string;
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

export const OPERATIONAL_STATUS_LABELS: Record<OperationalStatus, string> = {
  analysis: 'Análise',
  documentation: 'Documentação',
  activation: 'Ativação',
  completed: 'Concluído',
  cancelled: 'Cancelado',
};

export const REQUEST_TYPE_LABELS: Record<RequestType, string> = {
  portability: 'Portabilidade',
  new_line: 'Nova Linha',
  migration: 'Migração',
};

export const CONTACT_TYPE_LABELS: Record<ContactType, string> = {
  legal_representative: 'Responsável Legal',
  account_manager: 'Gestor da Conta',
  cedent: 'Cedente',
};

export const DECISION_ROLE_LABELS: Record<DecisionRole, string> = {
  decision_maker: 'Decisor',
  influencer: 'Influenciador',
  financial: 'Financeiro',
};

export const APP_ROLE_LABELS: Record<AppRole, string> = {
  seller: 'Vendedor',
  manager: 'Gestor',
  supervisor: 'Supervisor',
  post_sale: 'Pós-Venda',
  backoffice: 'Backoffice',
};

// Sales Pipeline Labels (Visão Prospecção)
export const SALES_PIPELINE_LABELS: Record<SalesPipelineStatus, string> = {
  proposta_enviada: 'Proposta Enviada',
  ag_documentacao: 'AG Documentação',
  enviado_bko: 'Enviado Bko',
};

export const SALES_PIPELINE_ORDER: SalesPipelineStatus[] = [
  'proposta_enviada',
  'ag_documentacao',
  'enviado_bko',
];

// Processing Pipeline Labels (Visão Tramitação)
export const PROCESSING_PIPELINE_LABELS: Record<ProcessingPipelineStatus, string> = {
  troca_carteira: 'Troca de Carteira',
  gerar_contrato: 'Gerar Contrato',
  auditoria_assinatura: 'Auditoria / Assinatura',
  pendente_input: 'Pendente Input',
  chamado_aberto: 'Chamado Aberto',
  pendente_estoque: 'Pendente Estoque',
  ativo: 'Ativo',
  instalada: 'Instalada',
  logistica: 'Logística',
  pendente_instalacao: 'Pendente Instalação',
  ag_portabilidade: 'AG Portabilidade',
  ag_autorizacao_sms: 'AG Autorização SMS-Cliente',
  analise_credito: 'Análise de Crédito',
  ag_validacao: 'Ag Validação',
  validacao_pendente: 'Validação Pendente',
  pendente_assinatura: 'Pendente Assinatura',
  reprovado_bko: 'Reprovado Bko',
  para_correcao: 'Para Correção',
  reprovado_troca_carteira: 'Reprovado Troca de Carteira',
  credito_reprovado: 'Crédito Reprovado',
  cancelado: 'Cancelado',
  ag_faturamento: 'AG Faturamento',
};

export const PROCESSING_PIPELINE_ORDER: ProcessingPipelineStatus[] = [
  'troca_carteira',
  'gerar_contrato',
  'auditoria_assinatura',
  'pendente_input',
  'chamado_aberto',
  'pendente_estoque',
  'ativo',
  'instalada',
  'logistica',
  'pendente_instalacao',
  'ag_portabilidade',
  'ag_autorizacao_sms',
  'analise_credito',
  'ag_validacao',
  'validacao_pendente',
  'pendente_assinatura',
  'reprovado_bko',
  'para_correcao',
  'reprovado_troca_carteira',
  'credito_reprovado',
  'cancelado',
  'ag_faturamento',
];

export const PROPOSAL_STATUS_ORDER: ProposalStatus[] = [
  'qualified',
  'diagnosis',
  'sent',
  'negotiation',
  'signed',
  'lost',
];

export const OPERATIONAL_STATUS_ORDER: OperationalStatus[] = [
  'analysis',
  'documentation',
  'activation',
  'completed',
  'cancelled',
];
