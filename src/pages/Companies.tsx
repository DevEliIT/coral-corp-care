import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Company } from '@/types/crm';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { StatusBadge } from '@/components/ui/status-badge';
import { Plus, Search, Loader2, Building2 } from 'lucide-react';
import { format } from 'date-fns';

export default function Companies() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) fetchCompanies();
  }, [user]);

  const fetchCompanies = async () => {
    const { data } = await supabase.from('companies').select('*').order('updated_at', { ascending: false });
    setCompanies((data || []) as Company[]);
    setLoading(false);
  };

  const filtered = companies.filter((c) => 
    c.legal_name.toLowerCase().includes(search.toLowerCase()) ||
    c.cnpj.includes(search)
  );

  if (authLoading || loading) {
    return <AppLayout><div className="flex items-center justify-center h-64"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></AppLayout>;
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Empresas</h1>
            <p className="text-muted-foreground">{companies.length} empresas cadastradas</p>
          </div>
          <Button onClick={() => navigate('/empresas/nova')}><Plus className="h-4 w-4 mr-2" />Nova Empresa</Button>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar por nome ou CNPJ..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="bg-card rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Razão Social</TableHead>
                <TableHead>CNPJ</TableHead>
                <TableHead>Segmento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Atualização</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((company) => (
                <TableRow key={company.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/empresas/${company.id}`)}>
                  <TableCell className="font-medium">{company.legal_name}</TableCell>
                  <TableCell>{company.cnpj}</TableCell>
                  <TableCell>{company.segment || '-'}</TableCell>
                  <TableCell><StatusBadge status={company.status} type="company" /></TableCell>
                  <TableCell>{format(new Date(company.updated_at), 'dd/MM/yyyy')}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Nenhuma empresa encontrada</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AppLayout>
  );
}