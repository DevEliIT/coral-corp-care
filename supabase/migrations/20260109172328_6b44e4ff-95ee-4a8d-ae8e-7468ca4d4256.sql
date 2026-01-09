-- Create new enum types
CREATE TYPE public.request_type AS ENUM ('portability', 'new_line', 'migration');
CREATE TYPE public.contact_type AS ENUM ('legal_representative', 'account_manager', 'cedent');
CREATE TYPE public.operational_status AS ENUM ('analysis', 'documentation', 'activation', 'completed', 'cancelled');

-- Create user_roles table for expanded role management
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role text NOT NULL CHECK (role IN ('seller', 'manager', 'supervisor', 'post_sale', 'backoffice')),
  created_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Update plans table - remove carrier, add request_type
ALTER TABLE public.plans DROP COLUMN IF EXISTS carrier;
ALTER TABLE public.plans ADD COLUMN IF NOT EXISTS request_type request_type;

-- Expand company_contacts table with new fields
ALTER TABLE public.company_contacts ADD COLUMN IF NOT EXISTS cpf text;
ALTER TABLE public.company_contacts ADD COLUMN IF NOT EXISTS rg text;
ALTER TABLE public.company_contacts ADD COLUMN IF NOT EXISTS mobile_phone text;
ALTER TABLE public.company_contacts ADD COLUMN IF NOT EXISTS landline_phone text;
ALTER TABLE public.company_contacts ADD COLUMN IF NOT EXISTS birth_date date;
ALTER TABLE public.company_contacts ADD COLUMN IF NOT EXISTS contact_type contact_type;

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Create company_documents table
CREATE TABLE public.company_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Update proposals table with new fields
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS product text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS request_type request_type;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS donor_carrier text;
ALTER TABLE public.proposals ADD COLUMN IF NOT EXISTS operational_status operational_status DEFAULT 'analysis';

-- Create proposal_cedents table for cedent data
CREATE TABLE public.proposal_cedents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid REFERENCES proposals(id) ON DELETE CASCADE NOT NULL UNIQUE,
  contact_id uuid REFERENCES company_contacts(id),
  name text,
  cpf text,
  rg text,
  email text,
  mobile_phone text,
  landline_phone text,
  birth_date date,
  role text,
  is_existing_contact boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Create proposal_attachments table
CREATE TABLE public.proposal_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id uuid REFERENCES proposals(id) ON DELETE CASCADE NOT NULL,
  file_name text NOT NULL,
  file_path text NOT NULL,
  file_type text,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_cedents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposal_attachments ENABLE ROW LEVEL SECURITY;

-- Update is_manager to also check user_roles
CREATE OR REPLACE FUNCTION public.is_manager()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
    AND role = 'manager'
  ) OR EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid()
    AND role = 'manager'
  )
$$;

-- Create has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- RLS Policies for user_roles
CREATE POLICY "User roles - select" ON public.user_roles
FOR SELECT USING (user_id = auth.uid() OR is_manager());

CREATE POLICY "User roles - insert" ON public.user_roles
FOR INSERT WITH CHECK (is_manager());

CREATE POLICY "User roles - delete" ON public.user_roles
FOR DELETE USING (is_manager());

-- RLS Policies for company_documents
CREATE POLICY "Company docs - select" ON public.company_documents
FOR SELECT USING (
  company_id IN (
    SELECT id FROM companies
    WHERE owner_id = auth.uid() OR is_manager()
  )
);

CREATE POLICY "Company docs - insert" ON public.company_documents
FOR INSERT WITH CHECK (
  company_id IN (
    SELECT id FROM companies
    WHERE owner_id = auth.uid() OR is_manager()
  )
);

CREATE POLICY "Company docs - delete" ON public.company_documents
FOR DELETE USING (is_manager());

-- RLS Policies for proposal_cedents
CREATE POLICY "Proposal cedents - select" ON public.proposal_cedents
FOR SELECT USING (
  proposal_id IN (
    SELECT id FROM proposals
    WHERE seller_id = auth.uid() OR is_manager()
  )
);

CREATE POLICY "Proposal cedents - insert" ON public.proposal_cedents
FOR INSERT WITH CHECK (
  proposal_id IN (
    SELECT id FROM proposals
    WHERE seller_id = auth.uid() OR is_manager()
  )
);

CREATE POLICY "Proposal cedents - update" ON public.proposal_cedents
FOR UPDATE USING (
  proposal_id IN (
    SELECT id FROM proposals
    WHERE seller_id = auth.uid() OR is_manager()
  )
);

-- RLS Policies for proposal_attachments
CREATE POLICY "Proposal attachments - select" ON public.proposal_attachments
FOR SELECT USING (
  proposal_id IN (
    SELECT id FROM proposals
    WHERE seller_id = auth.uid() OR is_manager()
  )
);

CREATE POLICY "Proposal attachments - insert" ON public.proposal_attachments
FOR INSERT WITH CHECK (
  proposal_id IN (
    SELECT id FROM proposals
    WHERE seller_id = auth.uid() OR is_manager()
  )
);

CREATE POLICY "Proposal attachments - delete" ON public.proposal_attachments
FOR DELETE USING (is_manager());

-- Storage policies for documents bucket
CREATE POLICY "Documents bucket - select" ON storage.objects
FOR SELECT USING (bucket_id = 'documents');

CREATE POLICY "Documents bucket - insert" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Documents bucket - delete" ON storage.objects
FOR DELETE USING (bucket_id = 'documents' AND is_manager());