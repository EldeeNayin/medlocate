import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { Hospital, SearchFilters } from '@/types';

interface HospitalsState {
  data:    Hospital[];
  loading: boolean;
  error:   string | null;
}

export function useHospitals(filters: SearchFilters = {}): HospitalsState & { refetch: () => void } {
  const [state, setState] = useState<HospitalsState>({ data: [], loading: true, error: null });
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));

    async function fetch() {
      let query = supabase.from('hospitals').select('*');

      if (filters.query) {
        query = query.or(
          `name.ilike.%${filters.query}%,city.ilike.%${filters.query}%,lga.ilike.%${filters.query}%`,
        );
      }
      if (filters.city)      query = query.ilike('city', `%${filters.city}%`);
      if (filters.lga)       query = query.ilike('lga', `%${filters.lga}%`);
      if (filters.specialty) query = query.contains('specialties', [filters.specialty]);
      if (filters.ownership) query = query.eq('ownership', filters.ownership);

      // Radius search via PostGIS RPC
      if (filters.radius && filters.lat != null && filters.lng != null) {
        const { data, error } = await supabase.rpc('hospitals_within_radius', {
          lat: filters.lat,
          lng: filters.lng,
          radius_km: filters.radius,
        });
        if (!cancelled) setState({ data: (data ?? []) as Hospital[], loading: false, error: error?.message ?? null });
        return;
      }

      const { data, error } = await query.order('name');
      if (!cancelled) setState({ data: (data ?? []) as Hospital[], loading: false, error: error?.message ?? null });
    }

    fetch();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters), tick]);

  return { ...state, refetch: () => setTick((t) => t + 1) };
}
