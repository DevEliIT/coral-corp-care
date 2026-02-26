import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Users, ShieldCheck, User, Headphones, Briefcase } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

interface TeamMember {
  id: string;
  full_name: string | null;
  role: string;
  created_at: string | null;
  roles: string[];
}

const ROLE_OPTIONS = [
  { value: 'manager', label: 'Gestor', icon: ShieldCheck, color: 'bg-purple-100 text-purple-800' },
  { value: 'seller', label: 'Vendedor', icon: User, color: 'bg-blue-100 text-blue-800' },
  { value: 'supervisor', label: 'Supervisor', icon: Users, color: 'bg-amber-100 text-amber-800' },
  { value: 'post_sale', label: 'Pós-venda', icon: Headphones, color: 'bg-green-100 text-green-800' },
  { value: 'backoffice', label: 'Backoffice', icon: Briefcase, color: 'bg-gray-100 text-gray-800' },
];

const getRoleInfo = (role: string) => ROLE_OPTIONS.find((r) => r.value === role) || { label: role, color: 'bg-muted text-muted-foreground' };

export default function Team() {
  const { isManager } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [members, setMembers] = useState<TeamMember[]>([]);

  const [form, setForm] = useState({
    email: '',
    password: '',
    full_name: '',
    roles: [] as string[],
  });

  useEffect(() => {
    if (!isManager) {
      navigate('/');
      return;
    }
    fetchMembers();
  }, [isManager, navigate]);

  const fetchMembers = async () => {
    setLoading(true);
    const { data: profiles } = await supabase.from('profiles').select('*');
    const { data: userRoles } = await supabase.from('user_roles').select('*');

    const membersWithRoles: TeamMember[] = (profiles || []).map((p) => ({
      id: p.id,
      full_name: p.full_name,
      role: p.role,
      created_at: p.created_at,
      roles: (userRoles || []).filter((r) => r.user_id === p.id).map((r) => r.role),
    }));

    setMembers(membersWithRoles);
    setLoading(false);
  };

  const toggleRole = (role: string) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.roles.length === 0) {
      toast({ variant: 'destructive', title: 'Selecione ao menos um papel' });
      return;
    }

    setCreating(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const response = await supabase.functions.invoke('create-user', {
        body: {
          email: form.email,
          password: form.password,
          full_name: form.full_name,
          roles: form.roles,
        },
      });

      if (response.error) throw new Error(response.error.message);
      if (response.data?.error) throw new Error(response.data.error);

      toast({ title: 'Usuário criado com sucesso!' });
      setForm({ email: '', password: '', full_name: '', roles: [] });
      setDialogOpen(false);
      fetchMembers();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Erro', description: error.message });
    } finally {
      setCreating(false);
    }
  };

  if (!isManager) return null;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Equipe</h1>
            <p className="text-muted-foreground">Gerencie os membros da sua equipe</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Novo Usuário</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Criar Novo Usuário</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreate} className="space-y-4">
                <div className="space-y-2">
                  <Label>Nome Completo *</Label>
                  <Input
                    required
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>E-mail *</Label>
                  <Input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Senha *</Label>
                  <Input
                    type="password"
                    required
                    minLength={6}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Papéis *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROLE_OPTIONS.map((role) => (
                      <div
                        key={role.value}
                        className={`flex items-center space-x-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                          form.roles.includes(role.value) ? 'border-primary bg-primary/5' : 'border-border'
                        }`}
                        onClick={() => toggleRole(role.value)}
                      >
                        <Checkbox 
                          checked={form.roles.includes(role.value)} 
                          onCheckedChange={() => toggleRole(role.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <role.icon className="h-4 w-4" />
                        <span className="text-sm">{role.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Button type="submit" disabled={creating} className="w-full">
                  {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Criar Usuário
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <Card key={member.id}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{member.full_name || 'Sem nome'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {member.roles.length > 0 ? (
                      member.roles.map((role) => {
                        const info = getRoleInfo(role);
                        return (
                          <Badge key={role} variant="secondary" className={info.color}>
                            {info.label}
                          </Badge>
                        );
                      })
                    ) : (
                      <Badge variant="secondary" className={getRoleInfo(member.role).color}>
                        {getRoleInfo(member.role).label}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
