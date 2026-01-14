import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ContactForm, { ContactFormData, emptyContactForm } from '@/components/contacts/ContactForm';
import FileUpload from '@/components/uploads/FileUpload';
import { ContactType } from '@/types/crm';

export default function NewCompany() {
  const { user, isManager } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ legal_name: '', cnpj: '', segment: '', estimated_lines: '' });
  const [documents, setDocuments] = useState<{ name: string; path: string; type: string }[]>([]);
  
  // Contatos obrigatórios
  const [legalRepresentative, setLegalRepresentative] = useState<ContactFormData>(emptyContactForm('legal_representative'));
  const [accountManager, setAccountManager] = useState<ContactFormData>(emptyContactForm('account_manager'));
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validar contatos obrigatórios
      if (!legalRepresentative.name || !legalRepresentative.cpf || !legalRepresentative.email || !legalRepresentative.mobile_phone) {
        throw new Error('Preencha todos os campos obrigatórios do Responsável Legal');
      }
      if (!accountManager.name || !accountManager.cpf || !accountManager.email || !accountManager.mobile_phone) {
        throw new Error('Preencha todos os campos obrigatórios do Gestor da Conta');
      }

      // Criar empresa
      const { data: company, error: companyError } = await supabase.from('companies').insert({
        legal_name: form.legal_name,
        cnpj: form.cnpj,
        segment: form.segment || null,
        estimated_lines: form.estimated_lines ? parseInt(form.estimated_lines) : null,
        owner_id: user?.id,
        status: 'lead',
      }).select().single();

      if (companyError) {
        if (companyError.message.includes('duplicate')) throw new Error('CNPJ já cadastrado');
        throw companyError;
      }

      // Criar contatos
      const contactsToInsert = [
        {
          company_id: company.id,
          name: legalRepresentative.name,
          cpf: legalRepresentative.cpf,
          rg: legalRepresentative.rg || null,
          email: legalRepresentative.email,
          mobile_phone: legalRepresentative.mobile_phone,
          landline_phone: legalRepresentative.landline_phone || null,
          birth_date: legalRepresentative.birth_date || null,
          role: legalRepresentative.role || null,
          contact_type: 'legal_representative' as ContactType,
          decision_role: legalRepresentative.decision_role || null,
        },
        {
          company_id: company.id,
          name: accountManager.name,
          cpf: accountManager.cpf,
          rg: accountManager.rg || null,
          email: accountManager.email,
          mobile_phone: accountManager.mobile_phone,
          landline_phone: accountManager.landline_phone || null,
          birth_date: accountManager.birth_date || null,
          role: accountManager.role || null,
          contact_type: 'account_manager' as ContactType,
          decision_role: accountManager.decision_role || null,
        },
      ];

      const { error: contactsError } = await supabase.from('company_contacts').insert(contactsToInsert);
      if (contactsError) throw contactsError;

      // Criar documentos
      if (documents.length > 0) {
        const { error: docsError } = await supabase.from('company_documents').insert(
          documents.map((doc) => ({
            company_id: company.id,
            file_name: doc.name,
            file_path: doc.path,
            file_type: doc.type,
            uploaded_by: user?.id,
          }))
        );
        if (docsError) throw docsError;
      }

      toast({ title: 'Empresa criada com sucesso!' });
      navigate('/empresas');
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate('/empresas')}><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados da Empresa */}
          <Card>
            <CardHeader><CardTitle>Dados da Empresa</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Razão Social *</Label>
                  <Input required value={form.legal_name} onChange={(e) => setForm({ ...form, legal_name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>CNPJ *</Label>
                  <Input required value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0000-00" />
                </div>
                <div className="space-y-2">
                  <Label>Segmento</Label>
                  <Input value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Linhas Estimadas</Label>
                  <Input type="number" value={form.estimated_lines} onChange={(e) => setForm({ ...form, estimated_lines: e.target.value })} />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Documentos</Label>
                <FileUpload
                  bucket="documents"
                  folder={`companies/${form.cnpj || 'temp'}`}
                  onUpload={(files) => setDocuments([...documents, ...files])}
                  existingFiles={documents}
                  onRemove={(path) => setDocuments(documents.filter((d) => d.path !== path))}
                  canRemove={isManager}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
              </div>
            </CardContent>
          </Card>

          {/* Responsável Legal */}
          <ContactForm
            contact={legalRepresentative}
            onChange={setLegalRepresentative}
            title="Responsável Legal *"
          />

          {/* Gestor da Conta */}
          <ContactForm
            contact={accountManager}
            onChange={setAccountManager}
            title="Gestor da Conta *"
          />

          <Button type="submit" disabled={loading} className="w-full">
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Criar Empresa
          </Button>
        </form>
      </div>
    </AppLayout>
  );
}
