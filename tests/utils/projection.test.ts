import { describe, expect, it } from 'vitest';
import { getProjection } from '../../src/choropleth/utils/projection';

describe('getProjection', () => {
  it('uses provided scale and center values', () => {
    const projection = getProjection('mercator', 800, 400, [10, 20], 1234);

    expect(projection.translate()).toEqual([400, 200]);
    expect(projection.scale()).toBeCloseTo(1234);
    expect(projection.center()).toEqual([10, 20]);
  });

  it('auto-scales when scale is not provided', () => {
    const width = 600;
    const height = 300;
    const projection = getProjection('equirectangular', width, height);
    const expected = Math.min(width, height) / 2 / Math.PI * 0.9;

    expect(projection.scale()).toBeCloseTo(expected);
  });

  it('handles albersUsa with provided scale', () => {
    const projection = getProjection('albersUsa', 500, 250, [10, 20], 800, [
      5,
      -5,
      0,
    ]);

    expect(projection.translate()).toEqual([250, 125]);
    expect(projection.scale()).toBeCloseTo(800);
  });
});
