import * as d3 from 'd3';
import type { ZoomTransform } from 'd3-zoom';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { ChoroplethDataPoint } from '../types.ts';

interface RenderChoroplethOptions {
  canvas: HTMLCanvasElement;
  mapData: FeatureCollection;
  projection: d3.GeoProjection;
  width: number;
  height: number;
  dataMap: Map<string, ChoroplethDataPoint>;
  colorScale: (value: number) => string;
  defaultFill: string;
  strokeColor: string;
  highlightStrokeColor: string;
  strokeWidth: number;
  highlightStrokeWidth: number;
  dimOpacity: number;
  propertyKey: string;
  activeFeatureId?: string | number | null;
  animated: boolean;
  animationProgress: number;
  previousData: Map<string, number>;
  transform: ZoomTransform;
}

export function getFeatureAtPoint(
  mapData: FeatureCollection | null | undefined,
  projection: d3.GeoProjection,
  transform: ZoomTransform,
  x: number,
  y: number
): Feature | null {
  if (!mapData || !mapData.features) return null;

  // Convert screen coordinates to geo coordinates
  const invertedPoint = [
    (x - transform.x) / transform.k,
    (y - transform.y) / transform.k,
  ] as [number, number];

  const geoCoords = projection.invert?.(invertedPoint);
  if (!geoCoords) return null;

  // fix for winding bug in geojson
  let bestFeature: Feature | null = null;
  let bestArea = Infinity;
  const MAX_REASONABLE_AREA = 2 * Math.PI; // half the sphere; safely larger than any country

  for (const feature of mapData.features) {
    if (d3.geoContains(feature as Feature<Geometry>, geoCoords)) {
      const area = d3.geoArea(feature as Feature<Geometry>);
      if (area > MAX_REASONABLE_AREA) continue;

      if (area < bestArea) {
        bestArea = area;
        bestFeature = feature as Feature;
      }
    }
  }

  return bestFeature;
}

export function renderChoroplethCanvas({
  canvas,
  mapData,
  projection,
  width,
  height,
  dataMap,
  colorScale,
  defaultFill,
  strokeColor,
  highlightStrokeColor,
  strokeWidth,
  highlightStrokeWidth,
  dimOpacity,
  propertyKey,
  activeFeatureId,
  animated,
  animationProgress,
  previousData,
  transform,
}: RenderChoroplethOptions) {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  ctx.scale(dpr, dpr);

  // Clear canvas
  ctx.clearRect(0, 0, width, height);

  // Apply zoom transform
  ctx.save();
  ctx.translate(transform.x, transform.y);
  ctx.scale(transform.k, transform.k);

  // Create path generator
  const pathGenerator = d3.geoPath().projection(projection).context(ctx);
  const hasActiveFeature = activeFeatureId !== undefined && activeFeatureId !== null;

  // Draw all features
  for (const feature of mapData.features) {
    const featureId = feature.properties?.[propertyKey] ?? feature.id;
    const dataPoint = dataMap.get(String(featureId));

    // Calculate fill color with animation
    let fillColor = defaultFill;
    if (dataPoint) {
      if (animated && animationProgress < 1) {
        const prevValue = previousData.get(String(featureId)) ?? dataPoint.value;
        const interpolatedValue =
          prevValue + (dataPoint.value - prevValue) * animationProgress;
        fillColor = colorScale(interpolatedValue);
      } else {
        fillColor = colorScale(dataPoint.value);
      }
    }

    // Apply dim effect when another feature is hovered
    const isActive =
      hasActiveFeature && String(featureId) === String(activeFeatureId);
    const shouldDim = hasActiveFeature && !isActive;

    ctx.beginPath();
    pathGenerator(feature as Feature<Geometry>);

    ctx.fillStyle = fillColor;
    ctx.globalAlpha = shouldDim ? dimOpacity : 1;
    ctx.fill();

    ctx.strokeStyle = isActive ? highlightStrokeColor : strokeColor;
    ctx.lineWidth = (isActive ? highlightStrokeWidth : strokeWidth) / transform.k;
    ctx.globalAlpha = 1;
    ctx.stroke();
  }

  ctx.restore();
}
