import { useCallback, useEffect, useMemo, useState } from 'react';
import type { MouseEvent as ReactMouseEvent, RefObject } from 'react';
import type { ZoomTransform } from 'd3-zoom';
import type { Feature, FeatureCollection } from 'geojson';
import type { GeoProjection } from 'd3-geo';

import { getFeatureAtPoint } from '../utils/canvas.ts';
import type { ChoroplethDataPoint, TooltipMode } from '../types.ts';

interface UseChoroplethInteractionsOptions {
  mapData: FeatureCollection | null | undefined;
  projection: GeoProjection;
  transformRef: React.MutableRefObject<ZoomTransform>;
  propertyKey: string;
  dataMap: Map<string, ChoroplethDataPoint>;
  tooltipMode: TooltipMode;
  onRegionHover?: (feature: Feature | null, dataPoint?: ChoroplethDataPoint) => void;
  onRegionClick?: (feature: Feature, dataPoint?: ChoroplethDataPoint) => void;
  containerRef: RefObject<HTMLDivElement | null>;
}

export function useChoroplethInteractions({
  mapData,
  projection,
  transformRef,
  propertyKey,
  dataMap,
  tooltipMode,
  onRegionHover,
  onRegionClick,
  containerRef,
}: UseChoroplethInteractionsOptions) {
  const [hoveredFeature, setHoveredFeature] = useState<Feature | null>(null);
  const [clickedFeature, setClickedFeature] = useState<Feature | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const getPointFromEvent = useCallback((event: ReactMouseEvent<HTMLCanvasElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }, []);

  const getFeatureAtPointFromEvent = useCallback(
    (x: number, y: number) =>
      getFeatureAtPoint(mapData, projection, transformRef.current, x, y),
    [mapData, projection, transformRef]
  );

  const getDataPoint = useCallback(
    (feature: Feature | null) => {
      if (!feature) return undefined;
      const featureId = feature.properties?.[propertyKey] ?? feature.id;
      return dataMap.get(String(featureId));
    },
    [propertyKey, dataMap]
  );

  const updateHoverState = useCallback(
    (feature: Feature | null, event: ReactMouseEvent<HTMLCanvasElement>) => {
      setHoveredFeature(feature);
      if (!feature) return;

      if (tooltipMode === 'hover' || (tooltipMode === 'combined' && !clickedFeature)) {
        setTooltipPosition({ x: event.clientX, y: event.clientY });
      }
    },
    [tooltipMode, clickedFeature]
  );

  const activeFeature = useMemo(() => {
    switch (tooltipMode) {
      case 'click':
        return clickedFeature;
      case 'hover':
        return hoveredFeature;
      case 'combined':
        return clickedFeature ?? hoveredFeature;
      default:
        return null;
    }
  }, [tooltipMode, clickedFeature, hoveredFeature]);

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLCanvasElement>) => {
      const { x, y } = getPointFromEvent(e);

      const feature = getFeatureAtPointFromEvent(x, y);

      updateHoverState(feature, e);

      if (feature) {
        const dataPoint = getDataPoint(feature);
        onRegionHover?.(feature, dataPoint);
      } else {
        onRegionHover?.(null);
      }
    },
    [
      getFeatureAtPointFromEvent,
      getPointFromEvent,
      updateHoverState,
      getDataPoint,
      onRegionHover,
    ]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredFeature(null);
    onRegionHover?.(null);
  }, [onRegionHover]);

  const handleClick = useCallback(
    (e: ReactMouseEvent<HTMLCanvasElement>) => {
      const { x, y } = getPointFromEvent(e);

      const feature = getFeatureAtPointFromEvent(x, y);

      if (tooltipMode === 'click' || tooltipMode === 'combined') {
        if (feature) {
          setClickedFeature((prev) => {
            const prevId = prev?.properties?.[propertyKey] ?? prev?.id;
            const newId = feature.properties?.[propertyKey] ?? feature.id;
            if (tooltipMode === 'click') {
              return prevId === newId ? null : feature;
            }
            return prevId === newId ? prev : feature;
          });
          setTooltipPosition({ x: e.clientX, y: e.clientY });
        } else {
          setClickedFeature(null);
        }
      }

      if (feature) {
        const dataPoint = getDataPoint(feature);
        onRegionClick?.(feature, dataPoint);
      }
    },
    [
      getFeatureAtPointFromEvent,
      getPointFromEvent,
      getDataPoint,
      tooltipMode,
      propertyKey,
      onRegionClick,
    ]
  );

  useEffect(() => {
    if (tooltipMode !== 'click' && tooltipMode !== 'combined') return;
    if (!clickedFeature) return;

    const handleDocumentMouseDown = (event: MouseEvent) => {
      const container = containerRef?.current;
      if (!container || container.contains(event.target as Node)) return;
      setClickedFeature(null);
    };

    document.addEventListener('mousedown', handleDocumentMouseDown);
    return () => document.removeEventListener('mousedown', handleDocumentMouseDown);
  }, [tooltipMode, clickedFeature, containerRef]);

  const showTooltip =
    tooltipMode !== 'none' && Boolean(activeFeature) && Boolean(tooltipPosition);

  return {
    hoveredFeature,
    activeFeature,
    tooltipPosition,
    showTooltip,
    handleMouseMove,
    handleMouseLeave,
    handleClick,
  };
}
