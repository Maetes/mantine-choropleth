import { Box, Text } from '@mantine/core';
import type { ReactNode } from 'react';
import type { Feature } from 'geojson';

import type { ChoroplethDataPoint } from '../types.ts';

interface RenderTooltipContentOptions {
  activeFeature: Feature | null;
  propertyKey: string;
  dataMap: Map<string, ChoroplethDataPoint>;
  tooltipContent?: (feature: Feature, dataPoint?: ChoroplethDataPoint) => ReactNode;
}

export function renderTooltipContent({
  activeFeature,
  propertyKey,
  dataMap,
  tooltipContent,
}: RenderTooltipContentOptions): ReactNode {
  if (!activeFeature) return null;

  const featureId = activeFeature.properties?.[propertyKey] ?? activeFeature.id;
  const dataPoint = dataMap.get(String(featureId));

  if (tooltipContent) {
    return tooltipContent(activeFeature, dataPoint);
  }

  const name =
    activeFeature.properties?.name ||
    activeFeature.properties?.NAME ||
    featureId;
  const value = dataPoint?.value;
  const label = dataPoint?.label;

  return (
    <Box>
      <Text fw={500} size="sm">
        {name}
      </Text>
      {value !== undefined && (
        <Text size="xs" c="dimmed">
          {label || 'Value'}: {value.toLocaleString()}
        </Text>
      )}
    </Box>
  );
}
