import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Plan, Company, CompanyContact, REQUEST_TYPE_LABELS, RequestType } from '@/types/crm';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import FileUpload from '@/components/uploads/FileUpload';

interface CedentForm {
  name: string;
  cpf: string;
  rg: string;
  email: string;
  mobile_phone: string;
  landline_phone: string;
  birth_date: string;
  role: string;
}

const emptyCedent: CedentForm = {
  name: '',
  cpf: '',
  rg: '',
  email: '',
  mobile_phone: '',
  landline_phone: '',
  birth_date: '',
  role: '',
};

export default function NewProposal() {
  const { user, isManager } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [contacts, setContacts] = useState<CompanyContact[]>([]);
  const [attachments, setAttachments] = useState<{ name: string; path: string; type: string }[]>([]);
  
  const [form, setForm] = useState({
    company_id: '',
    plan_id: '',
    line_quantity: '',
    price_per_line: '',
    notes: '',
    product: '',
    request_type: '' as RequestType | '',
    donor_carrier: '',
  });

  const [useExistingCedent, setUseExistingCedent] = useState(false);
  const [selectedCedentId, setSelectedCedentId] = useState('');
  const [cedentForm, setCedentForm] = useState<CedentForm>(emptyCedent);

  useEffect(() => {
    supabase.from('companies').select('*').order('legal_name').then(({ data }) => setCompanies((data || []) as Company[]));
    supabase.from('plans').select('*').eq('active', true).order('name').then(({ data }) => setPlans((data || []) as Plan[]));
  }, []);

  useEffect(() => {
    if (form.company_id) {
      supabase.from('company_contacts').select('*').eq('company_id', form.company_id).then(({ data }) => {
        setContacts((data || []) as CompanyContact[]);
      });
    } else {
      setContacts([]);
    }
  }, [form.company_id]);

  const selectedPlan = plans.find((p) => p.id === form.plan_id);
  const total = (parseInt(form.line_quantity) || 0) * (parseFloat(form.price_per_line) || 0);
  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const handlePlanChange = (planId: string) => {
    const plan = plans.find((p) => p.id === planId);
    setForm({
      ...form,
      plan_id: planId,
      price_per_line: plan?.base_price.toString() || '',
      request_type: plan?.request_type || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create proposal
      const { data: proposal, error: proposalError } = await supabase.from('proposals').insert({
        company_id: form.company_id,
        plan_id: form.plan_id || null,
        seller_id: user?.id,
        line_quantity: parseInt(form.line_quantity),
        price_per_line: parseFloat(form.price_per_line),
        notes: form.notes || null,
        status: 'qualified',
        sales_status: 'proposta_enviada',
        product: form.product || null,
        request_type: form.request_type || null,
        donor_carrier: form.donor_carrier || null,
      }).select().single();

      if (proposalError) throw proposalError;

      // Create cedent record
      if (useExistingCedent && selectedCedentId) {
        await supabase.from('proposal_cedents').insert({
          proposal_id: proposal.id,
          contact_id: selectedCedentId,
          is_existing_contact: true,
        });
      } else if (cedentForm.name) {
        await supabase.from('proposal_cedents').insert({
          proposal_id: proposal.id,
          is_existing_contact: false,
          name: cedentForm.name,
          cpf: cedentForm.cpf || null,
          rg: cedentForm.rg || null,
          email: cedentForm.email || null,
          mobile_phone: cedentForm.mobile_phone || null,
          landline_phone: cedentForm.landline_phone || null,
          birth_date: cedentForm.birth_date || null,
          role: cedentForm.role || null,
        });
      }

      // Create attachments records
      if (attachments.length > 0) {
        await supabase.from('proposal_attachments').insert(
          attachments.map((att) => ({
            proposal_id: proposal.id,
            file_name: att.name,
            file_path: att.path,
            file_type: att.type,
            uploaded_by: user?.id,
          }))
        );
      }

      toast({ title: 'Proposta criada!' });
      navigate('/propostas');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate('/propostas')}><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button>
        
        <Card>
          <CardHeader><CardTitle>Nova Proposta</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Empresa e Produto */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Empresa *</Label>
                  <Select value={form.company_id} onValueChange={(v) => setForm({ ...form, company_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>{companies.map((c) => <SelectItem key={c.id} value={c.id}>{c.legal_name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Produto *</Label>
                  <Input required value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value })} placeholder="Ex: Móvel Corporativo" />
                </div>
              </div>

              {/* Tipo de Solicitação e Operadora Doadora */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tipo de Solicitação *</Label>
                  <Select value={form.request_type} onValueChange={(v) => setForm({ ...form, request_type: v as RequestType })}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {(Object.keys(REQUEST_TYPE_LABELS) as RequestType[]).map((type) => (
                        <SelectItem key={type} value={type}>{REQUEST_TYPE_LABELS[type]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {form.request_type === 'portability' && (
                  <div className="space-y-2">
                    <Label>Operadora Doadora *</Label>
                    <Input required value={form.donor_carrier} onChange={(e) => setForm({ ...form, donor_carrier: e.target.value })} placeholder="Ex: Vivo, Claro, Tim" />
                  </div>
                )}
              </div>

              {/* Plano, Quantidade, Valor */}
              <div className="space-y-2">
                <Label>Plano</Label>
                <Select value={form.plan_id} onValueChange={handlePlanChange}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {plans.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name} {p.request_type && `(${REQUEST_TYPE_LABELS[p.request_type]})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Quantidade de Linhas *</Label>
                  <Input type="number" required min="1" value={form.line_quantity} onChange={(e) => setForm({ ...form, line_quantity: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Valor por Linha *</Label>
                  <Input type="number" required step="0.01" value={form.price_per_line} onChange={(e) => setForm({ ...form, price_per_line: e.target.value })} />
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-lg">
                <p className="text-sm text-muted-foreground">Valor Mensal Total</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(total)}</p>
              </div>

              {/* Dados do Cedente */}
              <Card className="border-dashed">
                <CardHeader><CardTitle className="text-lg">Dados do Cedente</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {contacts.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="useExisting"
                        checked={useExistingCedent}
                        onCheckedChange={(checked) => setUseExistingCedent(checked === true)}
                      />
                      <Label htmlFor="useExisting">Usar contato existente</Label>
                    </div>
                  )}

                  {useExistingCedent && contacts.length > 0 ? (
                    <Select value={selectedCedentId} onValueChange={setSelectedCedentId}>
                      <SelectTrigger><SelectValue placeholder="Selecione um contato..." /></SelectTrigger>
                      <SelectContent>
                        {contacts.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name} - {c.email}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Nome</Label>
                        <Input value={cedentForm.name} onChange={(e) => setCedentForm({ ...cedentForm, name: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>CPF</Label>
                        <Input value={cedentForm.cpf} onChange={(e) => setCedentForm({ ...cedentForm, cpf: e.target.value })} placeholder="000.000.000-00" />
                      </div>
                      <div className="space-y-2">
                        <Label>RG</Label>
                        <Input value={cedentForm.rg} onChange={(e) => setCedentForm({ ...cedentForm, rg: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>E-mail</Label>
                        <Input type="email" value={cedentForm.email} onChange={(e) => setCedentForm({ ...cedentForm, email: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Celular</Label>
                        <Input value={cedentForm.mobile_phone} onChange={(e) => setCedentForm({ ...cedentForm, mobile_phone: e.target.value })} placeholder="(00) 00000-0000" />
                      </div>
                      <div className="space-y-2">
                        <Label>Telefone Fixo</Label>
                        <Input value={cedentForm.landline_phone} onChange={(e) => setCedentForm({ ...cedentForm, landline_phone: e.target.value })} placeholder="(00) 0000-0000" />
                      </div>
                      <div className="space-y-2">
                        <Label>Data de Nascimento</Label>
                        <Input type="date" value={cedentForm.birth_date} onChange={(e) => setCedentForm({ ...cedentForm, birth_date: e.target.value })} />
                      </div>
                      <div className="space-y-2">
                        <Label>Cargo/Papel</Label>
                        <Input value={cedentForm.role} onChange={(e) => setCedentForm({ ...cedentForm, role: e.target.value })} />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Anexos */}
              <div className="space-y-2">
                <Label>Anexos</Label>
                <FileUpload
                  bucket="documents"
                  folder={`proposals/${form.company_id || 'temp'}`}
                  onUpload={(files) => setAttachments([...attachments, ...files])}
                  existingFiles={attachments}
                  onRemove={(path) => setAttachments(attachments.filter((a) => a.path !== path))}
                  canRemove={isManager}
                />
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label>Observações</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>

              <Button type="submit" disabled={loading || !form.company_id || !form.product || !form.request_type}>
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Criar Proposta
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
