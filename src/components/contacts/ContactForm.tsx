import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ContactType, CONTACT_TYPE_LABELS, DecisionRole, DECISION_ROLE_LABELS } from '@/types/crm';
import { Trash2 } from 'lucide-react';

export interface ContactFormData {
  name: string;
  cpf: string;
  rg: string;
  email: string;
  mobile_phone: string;
  landline_phone: string;
  birth_date: string;
  role: string;
  contact_type: ContactType;
  decision_role: DecisionRole | '';
}

interface ContactFormProps {
  contact: ContactFormData;
  onChange: (data: ContactFormData) => void;
  onRemove?: () => void;
  showRemove?: boolean;
  title?: string;
}

export default function ContactForm({ contact, onChange, onRemove, showRemove = false, title }: ContactFormProps) {
  const handleChange = (field: keyof ContactFormData, value: string) => {
    onChange({ ...contact, [field]: value });
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{title || CONTACT_TYPE_LABELS[contact.contact_type]}</CardTitle>
        {showRemove && onRemove && (
          <Button variant="ghost" size="sm" onClick={onRemove}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Nome *</Label>
            <Input required value={contact.name} onChange={(e) => handleChange('name', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>CPF *</Label>
            <Input required value={contact.cpf} onChange={(e) => handleChange('cpf', e.target.value)} placeholder="000.000.000-00" />
          </div>
          <div className="space-y-2">
            <Label>RG</Label>
            <Input value={contact.rg} onChange={(e) => handleChange('rg', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>E-mail *</Label>
            <Input type="email" required value={contact.email} onChange={(e) => handleChange('email', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Celular *</Label>
            <Input required value={contact.mobile_phone} onChange={(e) => handleChange('mobile_phone', e.target.value)} placeholder="(00) 00000-0000" />
          </div>
          <div className="space-y-2">
            <Label>Telefone Fixo</Label>
            <Input value={contact.landline_phone} onChange={(e) => handleChange('landline_phone', e.target.value)} placeholder="(00) 0000-0000" />
          </div>
          <div className="space-y-2">
            <Label>Data de Nascimento</Label>
            <Input type="date" value={contact.birth_date} onChange={(e) => handleChange('birth_date', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Cargo</Label>
            <Input value={contact.role} onChange={(e) => handleChange('role', e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Papel na Decisão</Label>
            <Select value={contact.decision_role} onValueChange={(v) => handleChange('decision_role', v)}>
              <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
              <SelectContent>
                {(Object.keys(DECISION_ROLE_LABELS) as DecisionRole[]).map((role) => (
                  <SelectItem key={role} value={role}>{DECISION_ROLE_LABELS[role]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const emptyContactForm = (contactType: ContactType): ContactFormData => ({
  name: '',
  cpf: '',
  rg: '',
  email: '',
  mobile_phone: '',
  landline_phone: '',
  birth_date: '',
  role: '',
  contact_type: contactType,
  decision_role: '',
});
