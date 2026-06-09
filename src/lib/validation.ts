import { z } from 'zod';

const NIGERIAN_PHONE = /^(\+234|0)[789][01]\d{8}$/;

export const hospitalSchema = z.object({
  name:          z.string().min(2, 'Hospital name is required'),
  address:       z.string().min(5, 'Full address is required'),
  city:          z.string().min(2, 'City is required'),
  lga:           z.string().min(2, 'LGA is required'),
  state:         z.string().min(2, 'State is required'),
  phone:         z.string().regex(NIGERIAN_PHONE, 'Enter a valid Nigerian phone number'),
  email:         z.string().email('Invalid email').optional().or(z.literal('')),
  specialties:   z.array(z.string()).min(1, 'Select at least one specialty'),
  ownership:     z.enum(['public', 'private']),
  visiting_hours: z.string().optional(),
  description:   z.string().optional(),
  latitude:      z.number().min(-90).max(90),
  longitude:     z.number().min(-180).max(180),
});

export type HospitalFormData = z.infer<typeof hospitalSchema>;
