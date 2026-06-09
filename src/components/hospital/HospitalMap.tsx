import { useEffect, useRef } from 'react';
import type { Hospital } from '@/types';

interface HospitalMapProps {
  hospitals:        Hospital[];
  selectedId?:      string;
  onHospitalClick?: (id: string) => void;
  userLat?:         number;
  userLng?:         number;
}

export function HospitalMap({ hospitals, selectedId, onHospitalClick, userLat, userLng }: HospitalMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<any>(null);
  const markersRef   = useRef<any[]>([]);
  const userMarkerRef = useRef<any>(null);

  // Initialise the map once
  useEffect(() => {
    if (!containerRef.current) return;

    let cancelled = false;

    (async () => {
      const leafletMod = await import('leaflet');
      const L = (leafletMod as any).default ?? leafletMod;

      if (cancelled || mapRef.current) return;

      mapRef.current = L.map(containerRef.current!, {
        center: [9.082, 8.6753], // Nigeria centre
        zoom: 6,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(mapRef.current);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers whenever hospitals / selectedId change
  useEffect(() => {
    if (!mapRef.current) {
      // Map not ready yet — retry in a tick
      const t = setTimeout(() => {}, 100);
      return () => clearTimeout(t);
    }

    (async () => {
      const leafletMod = await import('leaflet');
      const L = (leafletMod as any).default ?? leafletMod;

      // Remove old hospital markers
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];

      hospitals.forEach((hospital) => {
        const isSelected = hospital.id === selectedId;

        const icon = L.divIcon({
          className: isSelected ? 'marker marker--selected' : 'marker',
          iconSize:  [28, 28],
          iconAnchor:[14, 14],
        });

        const marker = L.marker([hospital.latitude, hospital.longitude], { icon })
          .addTo(mapRef.current);
        marker.bindTooltip(hospital.name, { direction: 'top', offset: [0, -14] });
        marker.on('click', () => onHospitalClick?.(hospital.id));
        markersRef.current.push(marker);
      });

      // User location marker
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      if (userLat != null && userLng != null) {
        userMarkerRef.current = L.circleMarker([userLat, userLng], {
          radius: 9,
          color: '#16a34a',
          fillColor: '#bbf7d2',
          fillOpacity: 0.85,
          weight: 2,
        }).addTo(mapRef.current);
        userMarkerRef.current.bindTooltip('Your location', { direction: 'top' });
      }

      // Fit bounds
      if (hospitals.length > 0) {
        const bounds = L.latLngBounds(hospitals.map((h) => [h.latitude, h.longitude]));
        if (userLat != null && userLng != null) bounds.extend([userLat, userLng]);
        mapRef.current.fitBounds(bounds, { padding: [60, 60], maxZoom: 13 });
      } else if (userLat != null && userLng != null) {
        mapRef.current.setView([userLat, userLng], 12);
      }

      // Fix tile gap when container was hidden (mobile map toggle)
      mapRef.current.invalidateSize();
    })();
  }, [hospitals, selectedId, onHospitalClick, userLat, userLng]);

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full bg-surface-muted"
      style={{ minHeight: '300px' }}
    />
  );
}
