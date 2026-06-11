import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import type { Report } from '../../types';

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    L: any;
  }
}

interface HeatMapLayerProps {
  reports: Report[];
}

const pollutionWeight: Record<string, number> = {
  low: 0.3,
  medium: 0.6,
  high: 1.0,
};

export default function HeatMapLayer({ reports }: HeatMapLayerProps) {
  const map = useMap();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const heatRef = useRef<any>(null);

  useEffect(() => {
    if (!map) return;

    const points = reports.map((r) => [
      r.latitude,
      r.longitude,
      pollutionWeight[r.ai_pollution_level ?? 'low'] ?? 0.5,
    ]);

    if (heatRef.current) {
      map.removeLayer(heatRef.current);
    }

    // leaflet.heat adds itself to the L global
    const L = (window as typeof window & { L: typeof import('leaflet') }).L;
    if (L && (L as unknown as Record<string, unknown>).heatLayer) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const heat = (L as any).heatLayer(points, {
        radius: 35,
        blur: 25,
        maxZoom: 10,
        gradient: {
          0.0: '#0044ff',
          0.3: '#00e676',
          0.6: '#ffd600',
          1.0: '#ff3d00',
        },
      });
      heat.addTo(map);
      heatRef.current = heat;
    }

    return () => {
      if (heatRef.current) {
        map.removeLayer(heatRef.current);
      }
    };
  }, [map, reports]);

  return null;
}
