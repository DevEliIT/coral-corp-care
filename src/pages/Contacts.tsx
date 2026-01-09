import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CompanyContact, CONTACT_TYPE_LABELS, DECISION_ROLE_LABELS, ContactType } from '@/types/crm';
import AppLayout from '@/components/layout/AppLayout';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface ContactWithCompany extends CompanyContact {
  companies?: { legal_name: string };
}

export default function Contacts() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<ContactWithCompany[]>([]);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      supabase
        .from('company_contacts')
        .select('*, companies(legal_name)')
        .order('name')
        .then(({ data }) => {
          setContacts((data || []) as ContactWithCompany[]);
          setLoading(false);
        });
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Contatos</h1>
          <p className="text-muted-foreground">{contacts.length} contatos cadastrados</p>
        </div>

        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Celular</TableHead>
                <TableHead>Papel na Decisão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contacts.map((contact) => (
                <TableRow key={contact.id}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>{contact.companies?.legal_name || '-'}</TableCell>
                  <TableCell>
                    {contact.contact_type ? (
                      <Badge variant="outline">{CONTACT_TYPE_LABELS[contact.contact_type]}</Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell>{contact.email || '-'}</TableCell>
                  <TableCell>{contact.mobile_phone || contact.phone || '-'}</TableCell>
                  <TableCell>
                    {contact.decision_role ? DECISION_ROLE_LABELS[contact.decision_role] : '-'}
                  </TableCell>
                </TableRow>
              ))}
              {contacts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum contato cadastrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}
