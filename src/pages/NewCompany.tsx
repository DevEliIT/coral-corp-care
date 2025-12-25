import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function NewCompany() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ legal_name: '', cnpj: '', segment: '', estimated_lines: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.from('companies').insert({
      legal_name: form.legal_name,
      cnpj: form.cnpj,
      segment: form.segment || null,
      estimated_lines: form.estimated_lines ? parseInt(form.estimated_lines) : null,
      owner_id: user?.id,
      status: 'lead',
    });
    if (error) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message.includes('duplicate') ? 'CNPJ já cadastrado' : error.message });
    } else {
      toast({ title: 'Empresa criada!' });
      navigate('/empresas');
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate('/empresas')}><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button>
        <Card>
          <CardHeader><CardTitle>Nova Empresa</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2"><Label>Razão Social *</Label><Input required value={form.legal_name} onChange={(e) => setForm({ ...form, legal_name: e.target.value })} /></div>
                <div className="space-y-2"><Label>CNPJ *</Label><Input required value={form.cnpj} onChange={(e) => setForm({ ...form, cnpj: e.target.value })} placeholder="00.000.000/0000-00" /></div>
                <div className="space-y-2"><Label>Segmento</Label><Input value={form.segment} onChange={(e) => setForm({ ...form, segment: e.target.value })} /></div>
                <div className="space-y-2"><Label>Linhas Estimadas</Label><Input type="number" value={form.estimated_lines} onChange={(e) => setForm({ ...form, estimated_lines: e.target.value })} /></div>
              </div>
              <Button type="submit" disabled={loading}>{loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Criar Empresa</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}