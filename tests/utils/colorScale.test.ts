import * as d3 from 'd3';
import { describe, expect, it } from 'vitest';
import { createColorScale } from '../../src/choropleth/utils/colorScale';

describe('createColorScale', () => {
  it('clamps sequential values to the domain', () => {
    const scale = createColorScale('sequential', d3.interpolateBlues, [0, 100]);

    expect(scale(-10)).toBe(scale(0));
    expect(scale(200)).toBe(scale(100));
  });

  it('clamps diverging values to the domain', () => {
    const scale = createColorScale(
      'diverging',
      d3.interpolateRdYlBu,
      [0, 100],
      undefined,
      50
    );

    expect(scale(-10)).toBe(scale(0));
    expect(scale(200)).toBe(scale(100));
  });

  it('wraps categorical values by palette length', () => {
    const scale = createColorScale(
      'categorical',
      d3.interpolateBlues,
      [0, 1],
      ['#111111', '#222222', '#333333']
    );

    expect(scale(0)).toBe('#111111');
    expect(scale(1)).toBe('#222222');
    expect(scale(2)).toBe('#333333');
    expect(scale(3)).toBe('#111111');
  });
});
