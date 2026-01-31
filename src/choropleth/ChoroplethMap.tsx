import { forwardRef, useCallback, useEffect, useMemo, useRef } from 'react';
import { Box, Tooltip, useMantineColorScheme, useMantineTheme } from '@mantine/core';
import { useElementSize, useMergedRef } from '@mantine/hooks';
import * as d3 from 'd3';
import type { ZoomBehavior, ZoomTransform } from 'd3-zoom';

import { ChoroplethLegend } from './components/ChoroplethLegend.tsx';
import { createColorScale } from './utils/colorScale.ts';
import { renderChoroplethCanvas } from './utils/canvas.ts';
import { getProjection } from './utils/projection.ts';
import type { ChoroplethDataPoint, ChoroplethMapProps } from './types';
import { useChoroplethAnimation } from './hooks/useChoroplethAnimation.ts';
import { useChoroplethInteractions } from './hooks/useChoroplethInteractions.ts';
import { useChoroplethZoom } from './hooks/useChoroplethZoom.ts';
import { renderTooltipContent } from './components/tooltipContent.tsx';

const DEFAULT_DOMAIN: [number, number] = [0, 100];

function getDomainFromValues(values: number[]): [number, number] {
  if (values.length === 0) return DEFAULT_DOMAIN;
  return [Math.min(...values), Math.max(...values)];
}

export const ChoroplethMap = forwardRef<HTMLDivElement, ChoroplethMapProps>(
  function ChoroplethMap(props, ref) {
    const {
      mapData,
      data,
      propertyKey = 'id',
      width: propWidth = '100%',
      height: propHeight = 400,

      // Projection
      projection: projectionType = 'mercator',
      projectionCenter,
      projectionScale,
      projectionRotation,

      // Colors
      colorSchemeType = 'sequential',
      colorInterpolator = d3.interpolateBlues,
      categoricalColors,
      useMantineColors = true,
      mantineColor = 'blue',
      colorDomain,
      divergingMidpoint,

      // Styling
      defaultFill,
      strokeColor,
      strokeWidth = 0.5,
      highlightStrokeColor,
      highlightStrokeWidth = 2,
      dimOpacity = 0.4,

      // Interactivity
      tooltipMode = 'combined',
      tooltipContent,
      zoomEnabled = false,
      zoomExtent = [1, 8],
      onRegionClick,
      onRegionHover,

      // Animation
      animated = true,
      animationDuration = 1000,

      // Legend
      legend,

      ...boxProps
    } = props;

    const theme = useMantineTheme();
    const { colorScheme } = useMantineColorScheme();

    // Refs
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const zoomRef = useRef<ZoomBehavior<HTMLCanvasElement, unknown> | null>(null);
    const transformRef = useRef<ZoomTransform>(d3.zoomIdentity);
    const onFrameRef = useRef<(() => void) | null>(null);

    const { animationProgressRef, previousDataRef } = useChoroplethAnimation(
      data,
      animated,
      animationDuration,
      onFrameRef
    );

    // Size handling
    const {
      ref: sizeRef,
      width: containerWidth,
      height: containerHeight,
    } = useElementSize();
    const mergedRef = useMergedRef(ref, containerRef, sizeRef);

    const canvasWidth =
      containerWidth || 800;
    const canvasHeight =
        containerHeight || 400;

    // Data lookup map
    const dataMap = useMemo(() => {
      const map = new Map<string, ChoroplethDataPoint>();
      data.forEach((d) => map.set(d.id, d));
      return map;
    }, [data]);

    // Calculate color domain
    const currentDomain = useMemo((): [number, number] => {
      if (colorDomain) return colorDomain;
      return getDomainFromValues(data.map((d) => d.value));
    }, [data, colorDomain]);

    // Get Mantine-based interpolator
    const effectiveInterpolator = useMemo(() => {
      if (!useMantineColors) return colorInterpolator;

      const colors = theme.colors[mantineColor];
      if (!colors) return colorInterpolator;

      // Create interpolator from Mantine color palette
      return d3.interpolateRgbBasis(
        colorScheme === 'dark'
          ? [colors[9], colors[7], colors[5], colors[3], colors[1]]
          : [colors[0], colors[2], colors[4], colors[6], colors[8]]
      );
    }, [useMantineColors, colorInterpolator, theme.colors, mantineColor, colorScheme]);

    // Color scale
    const legendColorScale = useMemo(() => {
      return createColorScale(
        colorSchemeType,
        effectiveInterpolator,
        currentDomain,
        categoricalColors,
        divergingMidpoint
      );
    }, [
      colorSchemeType,
      effectiveInterpolator,
      currentDomain,
      categoricalColors,
      divergingMidpoint,
    ]);

    // Theme-aware colors
    const themeColors = useMemo(() => {
      const isDark = colorScheme === 'dark';
      return {
        defaultFill: defaultFill ?? (isDark ? theme.colors.dark[6] : theme.colors.gray[2]),
        strokeColor: strokeColor ?? (isDark ? theme.colors.dark[4] : theme.colors.gray[4]),
        highlightStrokeColor:
          highlightStrokeColor ?? (isDark ? theme.colors.dark[0] : theme.colors.dark[9]),
      };
    }, [defaultFill, strokeColor, highlightStrokeColor, colorScheme, theme.colors]);

    // Projection
    const projection = useMemo(() => {
      return getProjection(
        projectionType,
        canvasWidth,
        canvasHeight,
        projectionCenter,
        projectionScale,
        projectionRotation
      );
    }, [
      projectionType,
      canvasWidth,
      canvasHeight,
      projectionCenter,
      projectionScale,
      projectionRotation,
    ]);

    // Fit projection to GeoJSON bounds
    useEffect(() => {
      if (!mapData || !canvasWidth || !canvasHeight) return;

      if (!projectionScale && !projectionCenter) {
        projection.fitSize([canvasWidth * 0.95, canvasHeight * 0.95], mapData);
      }
    }, [
      mapData,
      canvasWidth,
      canvasHeight,
      projection,
      projectionScale,
      projectionCenter,
    ]);

    const {
      hoveredFeature,
      activeFeature,
      tooltipPosition,
      showTooltip,
      handleMouseMove,
      handleMouseLeave,
      handleClick,
    } = useChoroplethInteractions({
      mapData,
      projection,
      transformRef,
      propertyKey,
      dataMap,
      tooltipMode,
      onRegionHover,
      onRegionClick,
      containerRef,
    });

    // Main render function
    const render = useCallback(() => {
      const canvas = canvasRef.current;
      if (!canvas || !mapData?.features || !canvasWidth || !canvasHeight) return;

      const activeFeatureId =
        activeFeature?.properties?.[propertyKey] ?? activeFeature?.id;

      const progress = animationProgressRef.current;
      const previousValues = Array.from(previousDataRef.current.values());
      const previousDomain =
        previousValues.length === 0 ? currentDomain : getDomainFromValues(previousValues);
      const frameDomain: [number, number] =
        !animated || progress >= 1
          ? currentDomain
          : [
              previousDomain[0] + (currentDomain[0] - previousDomain[0]) * progress,
              previousDomain[1] + (currentDomain[1] - previousDomain[1]) * progress,
            ];
      const frameColorScale = createColorScale(
        colorSchemeType,
        effectiveInterpolator,
        frameDomain,
        categoricalColors,
        divergingMidpoint
      );

      renderChoroplethCanvas({
        canvas,
        mapData,
        projection,
        width: canvasWidth,
        height: canvasHeight,
        dataMap,
        colorScale: frameColorScale,
        defaultFill: themeColors.defaultFill,
        strokeColor: themeColors.strokeColor,
        highlightStrokeColor: themeColors.highlightStrokeColor,
        strokeWidth,
        highlightStrokeWidth,
        dimOpacity,
        propertyKey,
        activeFeatureId,
        animated,
        animationProgress: animationProgressRef.current,
        previousData: previousDataRef.current,
        transform: transformRef.current,
      });
    }, [
      mapData,
      canvasWidth,
      canvasHeight,
      projection,
      dataMap,
      currentDomain,
      colorSchemeType,
      effectiveInterpolator,
      categoricalColors,
      divergingMidpoint,
      themeColors,
      strokeWidth,
      highlightStrokeWidth,
      dimOpacity,
      propertyKey,
      activeFeature,
      animated,
      animationProgressRef,
      previousDataRef,
    ]);

    useEffect(() => {
      onFrameRef.current = render;
      return () => {
        if (onFrameRef.current === render) onFrameRef.current = null;
      };
    }, [render]);

    // Render on changes
    useEffect(() => {
      render();
    }, [render]);

    useChoroplethZoom({
      enabled: zoomEnabled,
      zoomExtent,
      canvasRef,
      transformRef,
      zoomRef,
      onZoom: render,
    });

    const tooltipLabel = useMemo(
      () =>
        renderTooltipContent({
          activeFeature,
          propertyKey,
          dataMap,
          tooltipContent,
        }),
      [activeFeature, propertyKey, dataMap, tooltipContent]
    );

    return (
      <Box
        ref={mergedRef}
        pos="relative"
        w={propWidth}
        h={propHeight}
        style={{ overflow: 'hidden' }}
        {...boxProps}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            display: 'block',
            cursor: hoveredFeature ? 'pointer' : 'default',
          }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={handleClick}
        />

        {/* Tooltip */}
        {showTooltip && (
          <Tooltip
            label={tooltipLabel}
            opened
            position="top"
            withArrow
            transitionProps={{ duration: 150 }}
          >
            <Box
              style={{
                position: 'fixed',
                left: tooltipPosition?.x,
                top: tooltipPosition?.y,
                width: 1,
                height: 1,
                pointerEvents: 'none',
              }}
            />
          </Tooltip>
        )}

        {/* Legend */}
        {legend?.show && (
          <ChoroplethLegend
            colorScale={legendColorScale}
            domain={currentDomain}
            type={colorSchemeType}
            config={legend}
            categoricalColors={categoricalColors}
          />
        )}
      </Box>
    );
  }
);

ChoroplethMap.displayName = 'ChoroplethMap';
