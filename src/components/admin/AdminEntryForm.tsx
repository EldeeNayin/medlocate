import { useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import '@uiw/react-markdown-preview/markdown.css';
import '@uiw/react-md-editor/markdown-editor.css';

import { Input }   from '@/components/ui/Input';
import { Button }  from '@/components/ui/Button';
import { Badge }   from '@/components/ui/Badge';
import { hospitalSchema, type HospitalFormData } from '@/lib/validation';
import type { Hospital, Specialty } from '@/types';

/**
 * react-md-editor is imported dynamically to keep the initial bundle small.
 * Swap the <textarea> below with the real MDEditor once the dep is installed:
 *
 *   import MDEditor from '@uiw/react-md-editor';
 *   <MDEditor value={form.description} onChange={(v) => setField('description', v ?? '')} />
 */

const SPECIALTIES: Specialty[] = [
  'maternity', 'emergency', 'dental', 'pediatric',
  'cardiology', 'orthopedics', 'oncology', 'general',
];

interface AdminEntryFormProps {
  initial?:   Partial<Hospital>;
  onSubmit:   (data: HospitalFormData) => Promise<void>;
  onCancel?:  () => void;
}

type FormErrors = Partial<Record<keyof HospitalFormData, string>>;

export function AdminEntryForm({ initial, onSubmit, onCancel }: AdminEntryFormProps) {
  const [form, setForm] = useState<Partial<HospitalFormData>>({
    name:           initial?.name          ?? '',
    address:        initial?.address       ?? '',
    city:           initial?.city          ?? '',
    lga:            initial?.lga           ?? '',
    state:          initial?.state         ?? '',
    phone:          initial?.phone         ?? '',
    email:          initial?.email         ?? '',
    specialties:    initial?.specialties   ?? [],
    ownership:      initial?.ownership     ?? 'public',
    visiting_hours: initial?.visiting_hours ?? '',
    description:    initial?.description   ?? '',
    latitude:       initial?.latitude      ?? 0,
    longitude:      initial?.longitude     ?? 0,
  });
  const [errors, setErrors]   = useState<FormErrors>({});
  const [saving, setSaving]   = useState(false);

  function setField<K extends keyof HospitalFormData>(key: K, value: HospitalFormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function toggleSpecialty(s: Specialty) {
    const current = (form.specialties ?? []) as Specialty[];
    setField(
      'specialties',
      current.includes(s) ? current.filter((x) => x !== s) : [...current, s],
    );
  }

  async function handleSubmit() {
    const result = hospitalSchema.safeParse(form);
    if (!result.success) {
      const errs: FormErrors = {};
      result.error.errors.forEach((e) => {
        const key = e.path[0] as keyof HospitalFormData;
        errs[key] = e.message;
      });
      setErrors(errs);
      return;
    }
    setSaving(true);
    await onSubmit(result.data);
    setSaving(false);
  }

  return (
    <div className="space-y-5" data-testid="admin-entry-form">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input label="Hospital name *"  value={form.name}    onChange={(e) => setField('name', e.target.value)}    error={errors.name}    className="sm:col-span-2" />
        <Input label="Address *"        value={form.address} onChange={(e) => setField('address', e.target.value)} error={errors.address} className="sm:col-span-2" />
        <Input label="City *"           value={form.city}    onChange={(e) => setField('city', e.target.value)}    error={errors.city} />
        <Input label="LGA *"            value={form.lga}     onChange={(e) => setField('lga', e.target.value)}     error={errors.lga} />
        <Input label="State *"          value={form.state}   onChange={(e) => setField('state', e.target.value)}   error={errors.state} />
        <Input label="Phone *"          value={form.phone}   onChange={(e) => setField('phone', e.target.value)}   error={errors.phone} placeholder="08012345678" />
        <Input label="Email"            value={form.email}   onChange={(e) => setField('email', e.target.value)}   error={errors.email} type="email" />
        <Input label="Visiting hours"   value={form.visiting_hours} onChange={(e) => setField('visiting_hours', e.target.value)} />
        <Input label="Latitude *"  type="number" value={form.latitude}  onChange={(e) => setField('latitude',  parseFloat(e.target.value))}  error={errors.latitude} />
        <Input label="Longitude *" type="number" value={form.longitude} onChange={(e) => setField('longitude', parseFloat(e.target.value))} error={errors.longitude} />
      </div>

      {/* Ownership */}
      <fieldset>
        <legend className="text-sm font-medium text-ink mb-2">Ownership *</legend>
        <div className="flex gap-3">
          {(['public', 'private'] as const).map((o) => (
            <label key={o} className="flex items-center gap-2 text-sm cursor-pointer">
              <input
                type="radio"
                name="ownership"
                value={o}
                checked={form.ownership === o}
                onChange={() => setField('ownership', o)}
                className="text-brand-600 focus:ring-brand-500"
              />
              <span className="capitalize">{o}</span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Specialties */}
      <fieldset>
        <legend className="text-sm font-medium text-ink mb-2">Specialties *</legend>
        <div className="flex flex-wrap gap-2">
          {SPECIALTIES.map((s) => {
            const active = (form.specialties as Specialty[] ?? []).includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() => toggleSpecialty(s)}
                className={`rounded-pill px-3 py-1 text-sm font-medium transition-colors ${
                  active ? 'bg-brand-600 text-white' : 'bg-surface-muted text-ink-muted hover:bg-surface-border'
                }`}
              >
                {s}
              </button>
            );
          })}
        </div>
        {errors.specialties && <p className="mt-1 text-xs text-danger">{errors.specialties}</p>}
      </fieldset>

      <div>
        <label className="text-sm font-medium text-ink block mb-2">
          Description <Badge variant="gray" className="ml-1">Markdown</Badge>
        </label>
        <MDEditor
          value={form.description as string}
          onChange={(value) => setField('description', value ?? '')}
          preview="live"
          height={220}
        />
        {errors.description && <p className="mt-1 text-xs text-danger">{errors.description}</p>}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-surface-border pt-4">
        {onCancel && <Button variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button variant="primary" loading={saving} onClick={handleSubmit}>
          {initial?.id ? 'Save changes' : 'Create hospital'}
        </Button>
      </div>
    </div>
  );
}
