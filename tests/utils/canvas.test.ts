import * as d3 from 'd3';
import type { Feature, FeatureCollection } from 'geojson';
import { describe, expect, it } from 'vitest';
import { getFeatureAtPoint } from '../../src/choropleth/utils/canvas';
import { getProjection } from '../../src/choropleth/utils/projection';

describe('getFeatureAtPoint', () => {
  it('returns null when map data is missing', () => {
    const projection = getProjection('equirectangular', 100, 50);
    const result = getFeatureAtPoint(null, projection, d3.zoomIdentity, 0, 0);

    expect(result).toBeNull();
  });

  it('returns the smallest containing feature', () => {
    const largeFeature: Feature = {
      type: 'Feature',
      id: 'large',
      properties: { name: 'large' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-10, -10],
            [-10, 10],
            [10, 10],
            [10, -10],
            [-10, -10],
          ],
        ],
      },
    };

    const smallFeature: Feature = {
      type: 'Feature',
      id: 'small',
      properties: { name: 'small' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-5, -5],
            [-5, 5],
            [5, 5],
            [5, -5],
            [-5, -5],
          ],
        ],
      },
    };

    const mapData: FeatureCollection = {
      type: 'FeatureCollection',
      features: [largeFeature, smallFeature],
    };

    const projection = getProjection('equirectangular', 800, 400);
    const [x, y] = projection([0, 0]) as [number, number];

    const result = getFeatureAtPoint(mapData, projection, d3.zoomIdentity, x, y);

    expect(result?.id).toBe('small');
  });

  it('accounts for zoom transforms when locating features', () => {
    const feature: Feature = {
      type: 'Feature',
      id: 'single',
      properties: { name: 'single' },
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [-5, -5],
            [-5, 5],
            [5, 5],
            [5, -5],
            [-5, -5],
          ],
        ],
      },
    };

    const mapData: FeatureCollection = {
      type: 'FeatureCollection',
      features: [feature],
    };

    const projection = getProjection('equirectangular', 800, 400);
    const [x, y] = projection([0, 0]) as [number, number];
    const transform = d3.zoomIdentity.translate(50, 75).scale(2);
    const screenX = x * transform.k + transform.x;
    const screenY = y * transform.k + transform.y;

    const result = getFeatureAtPoint(
      mapData,
      projection,
      transform,
      screenX,
      screenY
    );

    expect(result?.id).toBe('single');
  });
});
