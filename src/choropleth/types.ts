import type { BoxProps, MantineColor } from '@mantine/core';
import type { ReactNode } from 'react';
import type { FeatureCollection, Feature } from 'geojson';

export interface ChoroplethDataPoint {
  /** Unique identifier matching the GeoJSON feature property */
  id: string;
  /** Numeric value for color scaling */
  value: number;
  /** Optional label for tooltip */
  label?: string;
}

export type ProjectionType =
  | 'mercator'
  | 'equirectangular'
  | 'orthographic'
  | 'naturalEarth1'
  | 'albers'
  | 'albersUsa'
  | 'conicEqualArea';

export type ColorSchemeType =
  | 'sequential'
  | 'diverging'
  | 'categorical';

export type TooltipMode = 'combined' | 'hover' | 'click' | 'none';

export interface ChoroplethLegendProps {
  /** Show/hide the legend */
  show?: boolean;
  /** Legend position */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  /** Legend title */
  title?: string;
  /** Width of the legend */
  width?: number;
  /** Height of the legend (for gradient) */
  height?: number;
  /** Number of ticks/labels */
  ticks?: number;
}

export interface ChoroplethMapProps extends BoxProps {
  /** GeoJSON FeatureCollection to render */
  mapData: FeatureCollection;
  /** Data points to visualize */
  data: ChoroplethDataPoint[];
  /** Property key in GeoJSON features to match with data id */
  propertyKey?: string;
  /** Map width (number in px or CSS string) */
  width?: number | string;
  /** Map height (number in px or CSS string) */
  height?: number | string;

  // Projection
  /** Map projection type */
  projection?: ProjectionType;
  /** Projection center [longitude, latitude] */
  projectionCenter?: [number, number];
  /** Projection scale */
  projectionScale?: number;
  /** Projection rotation [lambda, phi, gamma] */
  projectionRotation?: [number, number, number];

  // Colors
  /** Color scheme type */
  colorSchemeType?: ColorSchemeType;
  /** D3 color interpolator for sequential/diverging schemes */
  colorInterpolator?: (t: number) => string;
  /** Array of colors for categorical scheme */
  categoricalColors?: string[];
  /** Use Mantine theme colors */
  useMantineColors?: boolean;
  /** Mantine color for sequential scheme */
  mantineColor?: MantineColor;
  /** Domain for color scale [min, max] - auto-calculated if not provided */
  colorDomain?: [number, number];
  /** Midpoint for diverging color scale */
  divergingMidpoint?: number;

  // Styling
  /** Default fill color for regions without data */
  defaultFill?: string;
  /** Stroke color for region borders */
  strokeColor?: string;
  /** Stroke width for region borders */
  strokeWidth?: number;
  /** Highlight stroke color on hover/select */
  highlightStrokeColor?: string;
  /** Highlight stroke width on hover/select */
  highlightStrokeWidth?: number;
  /** Opacity for non-hovered regions when one is hovered */
  dimOpacity?: number;

  // Interactivity
  /** Tooltip display mode */
  tooltipMode?: TooltipMode;
  /** Custom tooltip content renderer */
  tooltipContent?: (feature: Feature, dataPoint?: ChoroplethDataPoint) => ReactNode;
  /** Enable zoom and pan */
  zoomEnabled?: boolean;
  /** Zoom extent [minZoom, maxZoom] */
  zoomExtent?: [number, number];
  /** Callback when a region is clicked */
  onRegionClick?: (feature: Feature, dataPoint?: ChoroplethDataPoint) => void;
  /** Callback when a region is hovered */
  onRegionHover?: (feature: Feature | null, dataPoint?: ChoroplethDataPoint) => void;

  // Animation
  /** Enable animations */
  animated?: boolean;
  /** Animation duration in ms */
  animationDuration?: number;

  // Legend
  /** Legend configuration */
  legend?: ChoroplethLegendProps;
}
