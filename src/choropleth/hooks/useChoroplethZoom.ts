import { useEffect } from 'react';
import { zoom as d3Zoom } from 'd3-zoom';
import type { ZoomBehavior, ZoomTransform } from 'd3-zoom';
import { select } from 'd3-selection';
import type { MutableRefObject, RefObject } from 'react';

interface UseChoroplethZoomOptions {
  enabled: boolean;
  zoomExtent: [number, number];
  canvasRef: RefObject<HTMLCanvasElement | null>;
  transformRef: MutableRefObject<ZoomTransform>;
  zoomRef?: MutableRefObject<ZoomBehavior<HTMLCanvasElement, unknown> | null>;
  onZoom: () => void;
}

export function useChoroplethZoom({
  enabled,
  zoomExtent,
  canvasRef,
  transformRef,
  zoomRef,
  onZoom,
}: UseChoroplethZoomOptions) {
  useEffect(() => {
    if (!enabled || !canvasRef || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const zoom = d3Zoom<HTMLCanvasElement, unknown>()
      .scaleExtent(zoomExtent)
      .on('zoom', (event) => {
        transformRef.current = event.transform;
        onZoom();
      });

    if (zoomRef) {
      zoomRef.current = zoom;
    }

    select(canvas).call(zoom);

    return () => {
      select(canvas).on('.zoom', null);
    };
  }, [enabled, zoomExtent, canvasRef, transformRef, zoomRef, onZoom]);
}
