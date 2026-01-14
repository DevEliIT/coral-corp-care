-- Drop existing enums if they have no dependencies (will recreate)
-- First, create new enums for the pipeline stages

-- Sales Pipeline Status (Visão Prospecção)
CREATE TYPE public.sales_pipeline_status AS ENUM (
  'proposta_enviada',
  'ag_documentacao',
  'enviado_bko'
);

-- Processing Pipeline Status (Visão Tramitação)
CREATE TYPE public.processing_pipeline_status AS ENUM (
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
  'ag_faturamento'
);

-- Add new columns to proposals table
ALTER TABLE public.proposals 
ADD COLUMN IF NOT EXISTS sales_status public.sales_pipeline_status DEFAULT 'proposta_enviada',
ADD COLUMN IF NOT EXISTS processing_status public.processing_pipeline_status DEFAULT NULL;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_proposals_sales_status ON public.proposals(sales_status);
CREATE INDEX IF NOT EXISTS idx_proposals_processing_status ON public.proposals(processing_status);

-- Add column to track when proposal moved to processing
ALTER TABLE public.proposals 
ADD COLUMN IF NOT EXISTS sent_to_bko_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;
