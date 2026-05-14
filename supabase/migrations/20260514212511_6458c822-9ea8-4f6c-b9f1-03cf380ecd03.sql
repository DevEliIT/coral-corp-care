
-- Restrict company_contacts policies to authenticated users only (block anon)
DROP POLICY IF EXISTS "Contacts - select" ON public.company_contacts;
DROP POLICY IF EXISTS "Contacts - insert" ON public.company_contacts;
DROP POLICY IF EXISTS "Contacts - update" ON public.company_contacts;
DROP POLICY IF EXISTS "Contacts - delete" ON public.company_contacts;

CREATE POLICY "Contacts - select" ON public.company_contacts
  FOR SELECT TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid() OR is_manager()));
CREATE POLICY "Contacts - insert" ON public.company_contacts
  FOR INSERT TO authenticated
  WITH CHECK (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid() OR is_manager()));
CREATE POLICY "Contacts - update" ON public.company_contacts
  FOR UPDATE TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid() OR is_manager()));
CREATE POLICY "Contacts - delete" ON public.company_contacts
  FOR DELETE TO authenticated
  USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid() OR is_manager()));

-- Restrict profiles policies to authenticated users only
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile or managers can view all" ON public.profiles;

CREATE POLICY "Profiles - select" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR is_manager());
CREATE POLICY "Profiles - update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id);

-- Restrict other public-role policies on sensitive tables to authenticated
DROP POLICY IF EXISTS "Companies - select" ON public.companies;
DROP POLICY IF EXISTS "Companies - insert" ON public.companies;
DROP POLICY IF EXISTS "Companies - update" ON public.companies;
DROP POLICY IF EXISTS "Companies - delete" ON public.companies;
CREATE POLICY "Companies - select" ON public.companies FOR SELECT TO authenticated USING (owner_id = auth.uid() OR is_manager());
CREATE POLICY "Companies - insert" ON public.companies FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Companies - update" ON public.companies FOR UPDATE TO authenticated USING (owner_id = auth.uid() OR is_manager());
CREATE POLICY "Companies - delete" ON public.companies FOR DELETE TO authenticated USING (owner_id = auth.uid() OR is_manager());

DROP POLICY IF EXISTS "Proposals - select" ON public.proposals;
DROP POLICY IF EXISTS "Proposals - insert" ON public.proposals;
DROP POLICY IF EXISTS "Proposals - update" ON public.proposals;
DROP POLICY IF EXISTS "Proposals - delete" ON public.proposals;
CREATE POLICY "Proposals - select" ON public.proposals FOR SELECT TO authenticated USING (seller_id = auth.uid() OR is_manager());
CREATE POLICY "Proposals - insert" ON public.proposals FOR INSERT TO authenticated WITH CHECK (seller_id = auth.uid());
CREATE POLICY "Proposals - update" ON public.proposals FOR UPDATE TO authenticated USING (seller_id = auth.uid() OR is_manager());
CREATE POLICY "Proposals - delete" ON public.proposals FOR DELETE TO authenticated USING (seller_id = auth.uid() OR is_manager());

DROP POLICY IF EXISTS "Company docs - select" ON public.company_documents;
DROP POLICY IF EXISTS "Company docs - insert" ON public.company_documents;
DROP POLICY IF EXISTS "Company docs - delete" ON public.company_documents;
CREATE POLICY "Company docs - select" ON public.company_documents FOR SELECT TO authenticated USING (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid() OR is_manager()));
CREATE POLICY "Company docs - insert" ON public.company_documents FOR INSERT TO authenticated WITH CHECK (company_id IN (SELECT id FROM companies WHERE owner_id = auth.uid() OR is_manager()));
CREATE POLICY "Company docs - delete" ON public.company_documents FOR DELETE TO authenticated USING (is_manager());

DROP POLICY IF EXISTS "Contracts - select" ON public.contracts;
DROP POLICY IF EXISTS "Contracts - insert" ON public.contracts;
DROP POLICY IF EXISTS "Contracts - update" ON public.contracts;
CREATE POLICY "Contracts - select" ON public.contracts FOR SELECT TO authenticated USING (proposal_id IN (SELECT id FROM proposals WHERE seller_id = auth.uid() OR is_manager()));
CREATE POLICY "Contracts - insert" ON public.contracts FOR INSERT TO authenticated WITH CHECK (proposal_id IN (SELECT id FROM proposals WHERE seller_id = auth.uid() OR is_manager()));
CREATE POLICY "Contracts - update" ON public.contracts FOR UPDATE TO authenticated USING (proposal_id IN (SELECT id FROM proposals WHERE seller_id = auth.uid() OR is_manager()));

DROP POLICY IF EXISTS "Proposal attachments - select" ON public.proposal_attachments;
DROP POLICY IF EXISTS "Proposal attachments - insert" ON public.proposal_attachments;
DROP POLICY IF EXISTS "Proposal attachments - delete" ON public.proposal_attachments;
CREATE POLICY "Proposal attachments - select" ON public.proposal_attachments FOR SELECT TO authenticated USING (proposal_id IN (SELECT id FROM proposals WHERE seller_id = auth.uid() OR is_manager()));
CREATE POLICY "Proposal attachments - insert" ON public.proposal_attachments FOR INSERT TO authenticated WITH CHECK (proposal_id IN (SELECT id FROM proposals WHERE seller_id = auth.uid() OR is_manager()));
CREATE POLICY "Proposal attachments - delete" ON public.proposal_attachments FOR DELETE TO authenticated USING (is_manager());

DROP POLICY IF EXISTS "Proposal cedents - select" ON public.proposal_cedents;
DROP POLICY IF EXISTS "Proposal cedents - insert" ON public.proposal_cedents;
DROP POLICY IF EXISTS "Proposal cedents - update" ON public.proposal_cedents;
CREATE POLICY "Proposal cedents - select" ON public.proposal_cedents FOR SELECT TO authenticated USING (proposal_id IN (SELECT id FROM proposals WHERE seller_id = auth.uid() OR is_manager()));
CREATE POLICY "Proposal cedents - insert" ON public.proposal_cedents FOR INSERT TO authenticated WITH CHECK (proposal_id IN (SELECT id FROM proposals WHERE seller_id = auth.uid() OR is_manager()));
CREATE POLICY "Proposal cedents - update" ON public.proposal_cedents FOR UPDATE TO authenticated USING (proposal_id IN (SELECT id FROM proposals WHERE seller_id = auth.uid() OR is_manager()));

DROP POLICY IF EXISTS "Status history - select" ON public.proposal_status_history;
DROP POLICY IF EXISTS "Status history - insert" ON public.proposal_status_history;
CREATE POLICY "Status history - select" ON public.proposal_status_history FOR SELECT TO authenticated USING (proposal_id IN (SELECT id FROM proposals WHERE seller_id = auth.uid() OR is_manager()));
CREATE POLICY "Status history - insert" ON public.proposal_status_history FOR INSERT TO authenticated WITH CHECK (proposal_id IN (SELECT id FROM proposals WHERE seller_id = auth.uid() OR is_manager()));

DROP POLICY IF EXISTS "User roles - select" ON public.user_roles;
DROP POLICY IF EXISTS "User roles - insert" ON public.user_roles;
DROP POLICY IF EXISTS "User roles - delete" ON public.user_roles;
CREATE POLICY "User roles - select" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR is_manager());
CREATE POLICY "User roles - insert" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (is_manager());
CREATE POLICY "User roles - delete" ON public.user_roles FOR DELETE TO authenticated USING (is_manager());
