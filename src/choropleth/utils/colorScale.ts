import * as d3 from 'd3';
import type { ColorSchemeType } from '../types.ts';

export function createColorScale(
  type: ColorSchemeType,
  interpolator: (t: number) => string,
  domain: [number, number],
  categoricalColors?: string[],
  midpoint?: number
): (value: number) => string {
  if (type === 'categorical' && categoricalColors) {
    const scale = d3
      .scaleOrdinal<number, string>()
      .domain(d3.range(categoricalColors.length))
      .range(categoricalColors);
    return (v: number) => scale(v % categoricalColors.length);
  }

  if (type === 'diverging' && midpoint !== undefined) {
    return d3
        .scaleDiverging<string>()
        .domain([domain[0], midpoint, domain[1]])
        .interpolator(interpolator)
        .clamp(true);
  }

  // Sequential (default)
  return d3
      .scaleSequential<string>()
      .domain(domain)
      .interpolator(interpolator)
      .clamp(true);
}
