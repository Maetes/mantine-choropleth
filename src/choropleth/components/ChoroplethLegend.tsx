import { useEffect, useMemo, useRef } from 'react';
import {
  Box,
  Paper,
  Text,
  useMantineColorScheme,
  useMantineTheme,
} from '@mantine/core';
import type { ChoroplethLegendProps, ColorSchemeType } from '../types.ts';

interface LegendInternalProps {
  colorScale: (value: number) => string;
  domain: [number, number];
  type: ColorSchemeType;
  config: ChoroplethLegendProps;
  categoricalColors?: string[];
}

export function ChoroplethLegend({
  colorScale,
  domain,
  type,
  config,
  categoricalColors,
}: LegendInternalProps) {
  const theme = useMantineTheme();
  const { colorScheme } = useMantineColorScheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const {
    position = 'bottom-right',
    title,
    width = 200,
    height = 12,
    ticks = 5,
  } = config;

  const positionStyles: React.CSSProperties = {
    position: 'absolute',
    zIndex: 10,
    ...(position.includes('top') ? { top: 10 } : { bottom: 10 }),
    ...(position.includes('left') ? { left: 10 } : { right: 10 }),
  };

  // Draw gradient for sequential/diverging
  useEffect(() => {
    if (type === 'categorical' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Draw gradient
    for (let i = 0; i < width; i++) {
      const t = i / (width - 1);
      const value = domain[0] + t * (domain[1] - domain[0]);
      ctx.fillStyle = colorScale(value);
      ctx.fillRect(i, 0, 1, height);
    }
  }, [colorScale, domain, width, height, type]);

  const tickValues = useMemo(() => {
    const step = (domain[1] - domain[0]) / (ticks - 1);
    return Array.from({ length: ticks }, (_, i) => domain[0] + i * step);
  }, [domain, ticks]);

  const bgColor = colorScheme === 'dark' ? theme.colors.dark[7] : theme.white;
  const textColor =
    colorScheme === 'dark' ? theme.colors.dark[0] : theme.colors.gray[7];

  return (
    <Paper
      shadow="sm"
      p="xs"
      radius="sm"
      style={{
        ...positionStyles,
        backgroundColor: bgColor,
      }}
    >
      {title && (
        <Text size="xs" fw={500} mb={4} c={textColor}>
          {title}
        </Text>
      )}

      {type === 'categorical' && categoricalColors ? (
        <Box style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {categoricalColors.map((color, i) => (
            <Box
              key={i}
              style={{
                width: 16,
                height: 16,
                backgroundColor: color,
                borderRadius: 2,
              }}
            />
          ))}
        </Box>
      ) : (
        <>
          <canvas
            ref={canvasRef}
            style={{
              width,
              height,
              borderRadius: 2,
              display: 'block',
            }}
          />
          <Box
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginTop: 4,
            }}
          >
            {tickValues.map((val, i) => (
              <Text key={i} size="xs" c={textColor}>
                {val.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              </Text>
            ))}
          </Box>
        </>
      )}
    </Paper>
  );
}
